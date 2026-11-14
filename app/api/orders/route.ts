import { NextResponse } from "next/server";
import { z } from "zod";

import { getBundleComponentSlugs } from "@/lib/bundles";
import { evaluatePromoCode, getPromoCodes } from "@/lib/promos";
import { getResourceLink } from "@/lib/resource-links";
import { normaliseSettings } from "@/lib/settings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeBdPhone } from "@/lib/utils";

export const runtime = "nodejs";

const ORDER_ACCESS_COOKIE = "bengalot-order-access";

const itemSchema = z.object({
  slug: z.string().min(1).max(140),
  quantity: z.number().int().min(1).max(20),
});

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(24),
  address: z.string().trim().min(8).max(500),
  city: z.string().trim().min(2).max(120),
  district: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(1000).optional().nullable(),
  paymentMethod: z.enum(["cod", "bkash"]),
  promoCode: z.string().trim().max(40).optional().nullable(),
  items: z.array(itemSchema).min(1).max(30),
});

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  type: "digital" | "physical" | "bundle";
  format: string;
  price: number;
  stock: number;
  preview?: Record<string, unknown> | null;
};

function orderNumber() {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `BG-${year}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = checkoutSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Some details need another look.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const phone = normalizeBdPhone(body.phone);
    if (!phone) {
      return NextResponse.json(
        {
          message: "Please enter a valid Bangladeshi mobile number.",
          fields: { phone: ["Use a valid 11-digit mobile number."] },
        },
        { status: 400 },
      );
    }

    const mergedItems = new Map<string, number>();
    for (const item of body.items) {
      mergedItems.set(
        item.slug,
        Math.min((mergedItems.get(item.slug) ?? 0) + item.quantity, 20),
      );
    }

    const auth = await createSupabaseServerClient();
    const {
      data: { user },
    } = await auth.auth.getUser();

    const supabase = createSupabaseAdminClient();
    const slugs = [...mergedItems.keys()];
    const [productResult, settingsResult] = await Promise.all([
      supabase
        .from("products")
        .select("id,slug,title,type,format,price,stock,preview")
        .in("slug", slugs)
        .eq("is_published", true),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "store")
        .maybeSingle(),
    ]);

    if (productResult.error) throw productResult.error;
    const productRows = productResult.data;
    if (!productRows?.length) {
      return NextResponse.json(
        { message: "These products are no longer available." },
        { status: 409 },
      );
    }

    if (productRows.length !== slugs.length) {
      return NextResponse.json(
        { message: "One of these products is no longer available." },
        { status: 409 },
      );
    }

    const settings = normaliseSettings(settingsResult.data?.value);
    const products = productRows as ProductRow[];
    const resolved = [...mergedItems.entries()].map(([slug, quantity]) => {
      const product = products.find((row) => row.slug === slug);
      if (!product) throw new Error(`Missing product: ${slug}`);
      if (product.type === "physical" && product.stock < quantity) {
        return {
          error: `${product.title} only has ${product.stock} left in stock.`,
        };
      }
      return {
        product,
        quantity,
        lineTotal: product.price * quantity,
      };
    });

    const stockProblem = resolved.find((item) => "error" in item);
    if (stockProblem && "error" in stockProblem) {
      return NextResponse.json({ message: stockProblem.error }, { status: 409 });
    }

    const lines = resolved as {
      product: ProductRow;
      quantity: number;
      lineTotal: number;
    }[];

    const subtotal = lines.reduce((total, item) => total + item.lineTotal, 0);
    const hasPhysical = lines.some((item) => item.product.type === "physical");
    const deliveryFee = hasPhysical
      ? subtotal >= settings.freeDeliveryThreshold
        ? 0
        : body.district.toLowerCase() === "faridpur"
          ? settings.deliveryInside
          : settings.deliveryOutside
      : 0;

    if (!hasPhysical && body.paymentMethod === "cod") {
      return NextResponse.json(
        {
          message:
            "Digital orders need bKash. Cash on delivery is for physical items.",
        },
        { status: 400 },
      );
    }

    let discount = 0;
    let appliedPromo: string | null = null;
    if (body.promoCode) {
      const codes = await getPromoCodes();
      const promo = evaluatePromoCode(codes, body.promoCode, subtotal);
      if (!promo.ok) {
        return NextResponse.json(
          { message: promo.message, fields: { promoCode: [promo.message] } },
          { status: 400 },
        );
      }
      discount = promo.discount;
      appliedPromo = promo.code;
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber(),
        user_id: user?.id ?? null,
        customer_name: body.customerName,
        email: body.email,
        phone,
        address: body.address,
        city: body.city,
        district: body.district,
        notes: body.notes ?? null,
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        total,
        payment_method: body.paymentMethod,
        payment_status: "pending",
        status: "processing",
      })
      .select("id,order_number")
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        type: item.product.type,
        format: item.product.format,
        unit_price: item.product.price,
        quantity: item.quantity,
        line_total: item.lineTotal,
      })),
    );
    if (itemsError) throw itemsError;

    if (user) {
      const componentSlugs = [
        ...new Set(
          lines.flatMap((item) =>
            getBundleComponentSlugs({
              slug: item.product.slug,
              type: item.product.type,
              preview: item.product.preview,
            }),
          ),
        ),
      ];

      let componentProducts: ProductRow[] = [];
      if (componentSlugs.length) {
        const { data, error } = await supabase
          .from("products")
          .select("id,slug,title,type,format,price,stock")
          .in("slug", componentSlugs)
          .eq("is_published", true);
        if (error) throw error;
        componentProducts = (data ?? []) as ProductRow[];
      }

      const digitalTargets = [
        ...lines
          .filter(
            (item) =>
              item.product.type === "digital" ||
              item.product.type === "bundle",
          )
          .map((item) => item.product),
        ...componentProducts.filter(
          (product) => product.type === "digital" || product.type === "bundle",
        ),
      ];
      const uniqueTargets = [
        ...new Map(digitalTargets.map((product) => [product.id, product])).values(),
      ];

      if (uniqueTargets.length) {
        const { error: entitlementError } = await supabase
          .from("entitlements")
          .upsert(
            uniqueTargets.map((product) => {
              const resource = getResourceLink(product.slug);
              return {
                user_id: user.id,
                product_id: product.id,
                order_id: order.id,
                title: product.title,
                access_label: resource.label,
                access_url: resource.url || null,
              };
            }),
            { onConflict: "user_id,product_id", ignoreDuplicates: true },
          );
        if (entitlementError) throw entitlementError;
      }
    }

    for (const item of lines) {
      if (item.product.type !== "physical") continue;
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: Math.max(0, item.product.stock - item.quantity) })
        .eq("id", item.product.id)
        .eq("stock", item.product.stock);
      if (stockError) throw stockError;
    }

    const response = NextResponse.json({
      orderNumber: order.order_number,
      subtotal,
      deliveryFee,
      discount,
      promoCode: appliedPromo,
      total,
      signedIn: Boolean(user),
    });

    // Guest confirmation pages need a scoped key. The order number in the URL
    // alone is not enough to expose a customer's address and phone number.
    response.cookies.set({
      name: ORDER_ACCESS_COOKIE,
      value: order.id,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Order creation failed", error);
    return NextResponse.json(
      {
        message:
          "We could not place the order just now. Please try again or message us on WhatsApp.",
      },
      { status: 500 },
    );
  }
}
