import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBundleDigitalComponents } from "@/lib/bundles";
import { getResourceLink } from "@/lib/resource-links";
import { normalizeBdPhone } from "@/lib/utils";

export const runtime = "nodejs";

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

    const auth = await createSupabaseServerClient();
    const {
      data: { user },
    } = await auth.auth.getUser();

    const supabase = createSupabaseAdminClient();
    const slugs = [...new Set(body.items.map((item) => item.slug))];
    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select("id,slug,title,type,format,price,stock")
      .in("slug", slugs)
      .eq("is_published", true);

    if (productError) throw productError;
    if (!productRows?.length) {
      return NextResponse.json(
        { message: "These products are no longer available." },
        { status: 409 },
      );
    }

    const products = productRows as ProductRow[];
    const resolved = body.items.map((item) => {
      const product = products.find((row) => row.slug === item.slug);
      if (!product) throw new Error(`Missing product: ${item.slug}`);
      if (product.type === "physical" && product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.title}`);
      }
      return {
        product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      };
    });

    const subtotal = resolved.reduce((total, item) => total + item.lineTotal, 0);
    const hasPhysical = resolved.some(
      (item) => item.product.type === "physical",
    );
    const deliveryFee = hasPhysical
      ? subtotal >= 2000
        ? 0
        : body.district.toLowerCase() === "faridpur"
          ? 70
          : 130
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

    const total = subtotal + deliveryFee;
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
        discount: 0,
        total,
        payment_method: body.paymentMethod,
        payment_status: body.paymentMethod === "cod" ? "pending" : "pending",
        status: "processing",
      })
      .select("id,order_number")
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from("order_items").insert(
      resolved.map((item) => ({
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
          resolved.flatMap((item) =>
            getBundleDigitalComponents(item.product.slug),
          ),
        ),
      ];

      let componentProducts: ProductRow[] = [];
      if (componentSlugs.length) {
        const { data, error } = await supabase
          .from("products")
          .select("id,slug,title,type,format,price,stock")
          .in("slug", componentSlugs);
        if (error) throw error;
        componentProducts = (data ?? []) as ProductRow[];
      }

      const digitalTargets = [
        ...resolved
          .filter(
            (item) =>
              item.product.type === "digital" || item.product.type === "bundle",
          )
          .map((item) => item.product),
        ...componentProducts,
      ];
      const uniqueTargets = [
        ...new Map(digitalTargets.map((product) => [product.id, product])).values(),
      ];

      if (uniqueTargets.length) {
        await supabase.from("entitlements").upsert(
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
      }
    }

    for (const item of resolved) {
      if (item.product.type !== "physical") continue;
      await supabase
        .from("products")
        .update({ stock: item.product.stock - item.quantity })
        .eq("id", item.product.id);
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      total,
      deliveryFee,
      signedIn: Boolean(user),
    });
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
