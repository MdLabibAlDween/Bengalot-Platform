import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendDiscordAlert } from "@/lib/admin/discord";
import { getProduct } from "@/lib/data";
import { getStoreProfile } from "@/lib/admin/settings";
import { lookupGiftCard, redeemGiftCardForOrder } from "@/lib/gift-cards-db";
import { notifyOrderStatus } from "@/lib/account-db";
import { ensureInvoiceForOrder } from "@/lib/invoices";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { couponAppliesToProduct, couponDiscountAmount } from "@/lib/coupons";
import {
  aggregateSizesFromVariants,
  variantKey,
  type ProductVariant,
} from "@/lib/variants";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { DISTRICTS } from "@/lib/constants";
import { FREE_DELIVERY_ENABLED, FREE_DELIVERY_THRESHOLD } from "@/lib/utils";

const itemSchema = z.object({
  productSlug: z.string(),
  name: z.string(),
  size: z.string(),
  color: z.string(),
  qty: z.number().int().min(1),
  price: z.number().int().min(0),
  bundleId: z.string().optional(),
  bundleName: z.string().optional(),
});

const schema = z.object({
  orderNo: z.string().min(4).max(40),
  customer: z.string().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number."),
  email: z.string().email().optional().or(z.literal("")),
  district: z
    .string()
    .trim()
    .refine((value) => DISTRICTS.includes(value), "Select a valid district."),
  address: z.string().min(5).max(500),
  note: z.string().max(1000).optional(),
  subtotal: z.number().int().min(0),
  discount: z.number().int().min(0).default(0),
  bundleSavings: z.number().int().min(0).default(0),
  couponCode: z.string().max(40).optional(),
  giftCardCode: z.string().max(80).optional(),
  giftCardAmount: z.number().int().min(0).default(0),
  delivery: z.number().int().min(0).default(0),
  total: z.number().int().min(0),
  payment: z.string().max(40).default("Cash on Delivery"),
  items: z.array(itemSchema).min(1).max(100),
});

type ProductPayload = {
  isDemo?: boolean;
  sizes?: { label: string; stock: number }[];
  colors?: { name: string }[];
  variants?: ProductVariant[];
  [key: string]: unknown;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  payload: Record<string, unknown> | null;
};

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const limited = rateLimit(rateLimitKey(request, "orders"), 6, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many order attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Order storage is not configured." }, { status: 503 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order payload." }, { status: 400 });
  }
  const order = parsed.data;
  const slugs = Array.from(new Set(order.items.map((item) => item.productSlug)));

  const email = order.email?.trim().toLowerCase();
  const phone = order.phone.trim();
  const blockChecks = await Promise.all([
    email
      ? admin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .eq("is_blacklisted", true)
          .limit(1)
      : Promise.resolve({ data: [] }),
    phone
      ? admin
          .from("profiles")
          .select("id")
          .eq("phone", phone)
          .eq("is_blacklisted", true)
          .limit(1)
      : Promise.resolve({ data: [] }),
  ]);
  if (blockChecks.some((result) => (result.data?.length ?? 0) > 0)) {
    return bad("This customer account is blocked. Please contact support.", 403);
  }

  const { data: productRows, error: productError } = await admin
    .from("products")
    .select("id,slug,name,price,stock,status,payload")
    .in("slug", slugs);
  if (productError) {
    return bad("Could not verify product availability. Please try again.", 503);
  }

  const rows = new Map<string, ProductRow>();
  for (const row of productRows ?? []) {
    rows.set(row.slug, row as ProductRow);
  }

  const demoSlugs = slugs.filter((slug) => {
    const row = rows.get(slug);
    if (row) {
      const payload = (row.payload ?? {}) as ProductPayload;
      if (typeof payload.isDemo === "boolean") return payload.isDemo;
    }
    return getProduct(slug)?.isDemo === true;
  });
  if (demoSlugs.length > 0) {
    return NextResponse.json(
      {
        error:
          "Demo products cannot be ordered. Remove the demo items from your bag and try again.",
        demoProducts: demoSlugs,
      },
      { status: 400 }
    );
  }

  if (order.items.some((item) => item.bundleId)) {
    return bad("Bundle checkout is not available yet. Please add the pieces individually.");
  }

  // Rebuild every line from the database. Client-supplied names and prices are
  // never trusted for totals or stock.
  type Requirement = {
    row: ProductRow;
    qty: number;
    sizes: Map<string, number>;
    variants: Map<string, number>;
  };
  const required = new Map<string, Requirement>();
  const canonicalItems: z.infer<typeof itemSchema>[] = [];

  for (const item of order.items) {
    const row = rows.get(item.productSlug);
    if (!row || row.status !== "published") {
      return bad(`${item.name} is no longer available. Please refresh your bag.`);
    }
    const payload = (row.payload ?? {}) as ProductPayload;
    const sizes = Array.isArray(payload.sizes) ? payload.sizes : [];
    const variants = Array.isArray(payload.variants)
      ? (payload.variants as ProductVariant[])
      : [];
    if (sizes.length > 0) {
      const size = sizes.find((option) => option.label === item.size);
      if (!size) return bad(`Size ${item.size} is not available for ${row.name}.`);
    }
    const colors = Array.isArray(payload.colors) ? payload.colors : [];
    if (colors.length > 0 && !colors.some((color) => color.name === item.color)) {
      return bad(`Colour ${item.color} is not available for ${row.name}.`);
    }
    const selectedVariant = variants.find(
      (variant) => variant.size === item.size && variant.color === item.color
    );
    if (variants.length > 0 && !selectedVariant) {
      return bad(`That size and colour combination is not available for ${row.name}.`);
    }

    const current = required.get(row.slug) ?? {
      row,
      qty: 0,
      sizes: new Map<string, number>(),
      variants: new Map<string, number>(),
    };
    current.qty += item.qty;
    if (variants.length > 0) {
      const key = variantKey(item.size, item.color);
      current.variants.set(key, (current.variants.get(key) ?? 0) + item.qty);
    } else if (sizes.length > 0) {
      current.sizes.set(item.size, (current.sizes.get(item.size) ?? 0) + item.qty);
    }
    required.set(row.slug, current);

    canonicalItems.push({
      productSlug: row.slug,
      name: row.name,
      size: item.size,
      color: item.color,
      qty: item.qty,
      price: Number(selectedVariant?.price ?? row.price),
    });
  }

  for (const requirement of required.values()) {
    const payload = (requirement.row.payload ?? {}) as ProductPayload;
    const sizes = Array.isArray(payload.sizes) ? payload.sizes : [];
    const variants = Array.isArray(payload.variants)
      ? (payload.variants as ProductVariant[])
      : [];
    if (variants.length > 0) {
      for (const [key, qty] of requirement.variants) {
        const [size, color] = key.split("::");
        const variant = variants.find(
          (option) => option.size === size && option.color === color
        );
        if (!variant || Number(variant.stock) < qty) {
          return bad(`Not enough stock for ${requirement.row.name} (${size} · ${color}).`);
        }
      }
      continue;
    }
    if (sizes.length === 0) {
      if (Number(requirement.row.stock) < requirement.qty) {
        return bad(`${requirement.row.name} is out of stock.`);
      }
      continue;
    }
    for (const [label, qty] of requirement.sizes) {
      const size = sizes.find((option) => option.label === label);
      if (!size || Number(size.stock) < qty) {
        return bad(`Not enough stock for ${requirement.row.name} (${label}).`);
      }
    }
  }

  const subtotal = canonicalItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );
  const code = order.couponCode?.trim().toUpperCase();
  type CouponRow = {
    code: string;
    type: "percent" | "fixed" | "shipping";
    value: number;
    min_spend: number;
    expires_at: string | null;
    product_slugs: string[] | null;
  };
  let coupon: CouponRow | null = null;
  if (code) {
    const { data } = await admin
      .from("coupons")
      .select("code,type,value,min_spend,expires_at,status,product_slugs")
      .eq("code", code)
      .eq("status", "active")
      .maybeSingle();
    if (!data) return bad("That promo code is not valid.");
    coupon = data as CouponRow;
  }
  if (coupon?.expires_at) {
    const expiry = new Date(`${coupon.expires_at}T23:59:59`);
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return bad("That promo code has expired.");
    }
  }
  const eligibleSubtotal = coupon
    ? canonicalItems.reduce((sum, item) => {
        const applies = couponAppliesToProduct(
          { productSlugs: coupon.product_slugs ?? [] },
          item.productSlug
        );
        return applies ? sum + Number(item.price) * item.qty : sum;
      }, 0)
    : subtotal;
  if (coupon && eligibleSubtotal <= 0) {
    return bad("That promo code does not apply to the products in your bag.");
  }
  if (coupon && eligibleSubtotal < Number(coupon.min_spend)) {
    return bad(
      `Add more eligible products to your bag to use ${coupon.code}.`
    );
  }
  const discount = couponDiscountAmount(
    coupon ? { type: coupon.type, value: coupon.value } : null,
    eligibleSubtotal
  );
  const freeShipping =
    coupon?.type === "shipping" ||
    (FREE_DELIVERY_ENABLED && subtotal >= FREE_DELIVERY_THRESHOLD);
  const storeProfile = await getStoreProfile();
  const delivery = freeShipping
    ? 0
    : order.district === "Faridpur"
      ? Number(storeProfile.deliveryInside)
      : Number(storeProfile.deliveryOutside);

  const totalBeforeGift = Math.max(0, subtotal - discount + delivery);
  const giftCode = order.giftCardCode?.trim() ?? "";
  let giftCardCode: string | null = null;
  let giftCardAmount = 0;
  if (giftCode) {
    const found = await lookupGiftCard(admin, giftCode);
    if (!found.ok) return bad(found.error);
    giftCardAmount = Math.min(found.card.balance, totalBeforeGift);
    giftCardCode = found.card.code;
  } else if (order.giftCardAmount > 0) {
    return bad("Enter a gift card code to use that balance.");
  }
  const total = Math.max(0, totalBeforeGift - giftCardAmount);

  // Reject tampered/stale client totals rather than silently charging a
  // different amount than the customer reviewed.
  if (
    order.subtotal !== subtotal ||
    order.discount !== discount ||
    order.bundleSavings !== 0 ||
    order.giftCardAmount !== giftCardAmount ||
    order.delivery !== delivery ||
    order.total !== total
  ) {
    return NextResponse.json(
      {
        error: "Your bag total changed. Please refresh the bag and try again.",
        totals: { subtotal, discount, delivery, giftCardAmount, total },
      },
      { status: 409 }
    );
  }

  // A retried checkout must not reset the order status or decrement stock twice.
  const { data: existing } = await admin
    .from("orders")
    .select("id,phone")
    .eq("order_no", order.orderNo)
    .maybeSingle();
  if (existing) {
    const samePhone =
      String(existing.phone ?? "").replace(/\D/g, "") ===
      String(order.phone ?? "").replace(/\D/g, "");
    if (!samePhone) {
      return NextResponse.json(
        {
          error:
            "That order number is already in use. Please refresh the bag and try again.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({
      ok: true,
      orderNo: order.orderNo,
      duplicate: true,
      totals: { subtotal, discount, delivery, giftCardAmount, total },
      items: canonicalItems,
    });
  }

  const { data: createdOrder, error: insertError } = await admin
    .from("orders")
    .insert({
      order_no: order.orderNo,
      customer: order.customer,
      phone: order.phone,
      email: order.email || null,
      district: order.district,
      address: order.address,
      note: order.note || null,
      subtotal,
      discount,
      bundle_savings: 0,
      gift_card_code: giftCardCode,
      gift_card_amount: giftCardAmount,
      delivery,
      total,
      payment: order.payment,
      items: canonicalItems,
      status: "Pending",
      payment_status: "Unpaid",
    })
    .select("id")
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }
  await admin.from("order_events").insert({
    order_id: createdOrder.id,
    order_no: order.orderNo,
    status: "Pending",
    note: "Order received. We will confirm it shortly.",
  });
  await notifyOrderStatus(
    admin,
    {
      order_no: order.orderNo,
      customer: order.customer,
      email: order.email || null,
      phone: order.phone,
    },
    "Pending"
  );

  // Conditional updates guard against two simultaneous checkout requests
  // selling the same last piece.
  const applied: { id: string; stock: number; payload: ProductRow["payload"] }[] = [];
  const rollback = async () => {
    await admin.from("orders").delete().eq("order_no", order.orderNo);
    await admin
      .from("customer_notifications")
      .delete()
      .eq("dedupe_key", `order:${order.orderNo}:Pending`);
    for (const previous of applied) {
      await admin
        .from("products")
        .update({ stock: previous.stock, payload: previous.payload })
        .eq("id", previous.id);
    }
  };

  for (const requirement of required.values()) {
    const payload = (requirement.row.payload ?? {}) as ProductPayload;
    const sizes = Array.isArray(payload.sizes) ? payload.sizes : [];
    const variants = Array.isArray(payload.variants)
      ? (payload.variants as ProductVariant[])
      : [];
    let nextSizes;
    let nextStock;
    let nextVariants: ProductVariant[] | undefined;
    if (variants.length > 0) {
      nextVariants = variants.map((variant) => ({
        ...variant,
        stock: Math.max(
          0,
          Number(variant.stock) -
            (requirement.variants.get(variantKey(variant.size, variant.color)) ?? 0)
        ),
      }));
      nextSizes = aggregateSizesFromVariants(nextVariants, sizes);
      nextStock = nextVariants.reduce(
        (sum, variant) => sum + Math.max(0, Number(variant.stock)),
        0
      );
    } else {
      nextSizes = sizes.map((size) => ({
        ...size,
        stock: Math.max(
          0,
          Number(size.stock) - (requirement.sizes.get(size.label) ?? 0)
        ),
      }));
      nextStock = Math.max(0, Number(requirement.row.stock) - requirement.qty);
    }
    const nextPayload = {
      ...(payload as Record<string, unknown>),
      stock: nextStock,
      ...(sizes.length > 0 ? { sizes: nextSizes } : {}),
      ...(nextVariants ? { variants: nextVariants } : {}),
    };
    const { data: updated, error: updateError } = await admin
      .from("products")
      .update({ stock: nextStock, payload: nextPayload })
      .eq("id", requirement.row.id)
      .eq("stock", requirement.row.stock)
      .select("id");
    if (updateError || !updated?.length) {
      await rollback();
      return bad(
        `${requirement.row.name} just sold out or changed stock. Please refresh your bag and try again.`,
        409
      );
    }
    applied.push({
      id: requirement.row.id,
      stock: Number(requirement.row.stock),
      payload: requirement.row.payload,
    });
  }

  for (const slug of slugs) revalidatePath(`/product/${slug}`);
  revalidatePath("/", "layout");

  if (giftCardCode && giftCardAmount > 0) {
    const redemption = await redeemGiftCardForOrder(
      admin,
      giftCardCode,
      giftCardAmount,
      order.orderNo
    );
    if (!redemption.ok) {
      await rollback();
      return bad(redemption.error, 409);
    }
  }

  const itemCount = canonicalItems.reduce((sum, item) => sum + item.qty, 0);
  const lines = canonicalItems
    .slice(0, 6)
    .map(
      (item) =>
        `• ${item.qty}× ${item.name}${item.size ? ` — ${item.size}` : ""}${item.color ? ` / ${item.color}` : ""}`
    );
  if (canonicalItems.length > 6) {
    lines.push(`…and ${canonicalItems.length - 6} more line(s)`);
  }
  try {
    after(async () => {
      await Promise.allSettled([
        (async () => {
          try {
            await sendDiscordAlert(
              {
                title: `New order ${order.orderNo}`,
                description: lines.join("\n"),
                color: 0xc9a227,
                event: "order_created",
                fields: [
                  { name: "Customer", value: `${order.customer}\n${order.phone}`, inline: true },
                  { name: "District", value: order.district, inline: true },
                  { name: "Total", value: `৳${total.toLocaleString("en-US")}`, inline: true },
                  { name: "Payment", value: order.payment, inline: true },
                  { name: "Items", value: String(itemCount), inline: true },
                ],
              },
              { source: "order_created" }
            );
          } catch {
            // Alerts are best-effort; the order is already durable.
          }
        })(),
        (async () => {
          try {
            await ensureInvoiceForOrder(admin, order.orderNo);
            const { data: savedOrder } = await admin
              .from("orders")
              .select("*")
              .eq("order_no", order.orderNo)
              .maybeSingle();
            if (savedOrder) {
              await sendOrderConfirmationEmail(admin, savedOrder as never);
            }
          } catch {
            // Invoicing and email are best-effort; the order is already durable.
          }
        })(),
      ]);
    });
  } catch {
    // `after` is not available in every execution context; the order still stands.
  }

  return NextResponse.json({
    ok: true,
    orderNo: order.orderNo,
    totals: { subtotal, discount, delivery, giftCardAmount, total },
    items: canonicalItems,
  });
}
