import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { after } from "next/server";

import { decrementOrderStock, grantOrderEntitlements } from "@/lib/entitlements";
import { publicEnv } from "@/lib/env";
import { sendOrderConfirmation } from "@/lib/mail";
import { normaliseSettings } from "@/lib/settings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/lib/types";

const baseUrl = (
  process.env.ZINIPAY_BASE_URL?.trim() || "https://api.zinipay.com"
).replace(/\/+$/, "");

const apiKey = process.env.ZINIPAY_API_KEY?.trim();

export type ZinipaySyncStatus =
  | "paid"
  | "pending"
  | "failed"
  | "not_configured"
  | "not_zinipay"
  | "not_found"
  | "cancelled"
  | "mismatch"
  | "error";

type CreateInvoiceResult =
  | { ok: true; paymentUrl: string; invoiceId: string | null }
  | { ok: false; message: string };

type VerifyResult = {
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: number;
  invoice_id: string;
  transaction_id?: string;
  payment_method?: string;
  cus_name?: string;
  cus_email?: string;
};

export function isZinipayConfigured() {
  return Boolean(apiKey);
}

export function zinipaySiteUrl() {
  return publicEnv.siteUrl.replace(/\/+$/, "");
}

function normaliseUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value.replace(/^\/+/, "")}`;
}

function extractInvoiceId(paymentUrl: string) {
  try {
    const parts = new URL(paymentUrl).pathname.split("/").filter(Boolean);
    return parts.at(-1) ?? null;
  } catch {
    const clean = paymentUrl.split("?")[0] ?? paymentUrl;
    const parts = clean.split("/").filter(Boolean);
    return parts.at(-1) ?? null;
  }
}

async function zinipayFetch<T>(path: string, body: unknown): Promise<T> {
  if (!apiKey) throw new Error("ZiniPay is not configured.");

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "zini-api-key": apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message?: unknown }).message)
        : `ZiniPay returned ${response.status}.`;
    throw new Error(message);
  }

  return data as T;
}

export async function createZinipayInvoice(order: Order): Promise<CreateInvoiceResult> {
  if (!isZinipayConfigured()) {
    return { ok: false, message: "Online payment is not configured yet." };
  }

  const siteUrl = zinipaySiteUrl();
  const amount = Math.round(order.total);
  if (amount <= 0) {
    return { ok: false, message: "This order has no payable amount." };
  }

  try {
    const data = await zinipayFetch<{
      status?: boolean;
      message?: string;
      payment_url?: string;
    }>("/v1/payment/create", {
      cus_name: order.customer_name,
      cus_email: order.email,
      amount,
      metadata: {
        order_id: order.order_number,
        order_number: order.order_number,
        store: "bengalot",
      },
      redirect_url: `${siteUrl}/api/payments/zinipay/return?order=${encodeURIComponent(order.order_number)}`,
      cancel_url: `${siteUrl}/checkout/success?order=${encodeURIComponent(order.order_number)}&payment=cancelled`,
      webhook_url: `${siteUrl}/api/payments/zinipay/webhook?order=${encodeURIComponent(order.order_number)}&token=${webhookToken(order.order_number)}`,
    });

    if (!data?.status || !data.payment_url) {
      return {
        ok: false,
        message: data?.message || "ZiniPay could not create the payment page.",
      };
    }

    const paymentUrl = normaliseUrl(data.payment_url);
    const invoiceId = extractInvoiceId(paymentUrl);

    const supabase = createSupabaseAdminClient();
    await supabase.from("admin_audit").insert({
      action: "payment.zinipay.invoice",
      actor_email: order.email,
      entity: "order",
      entity_id: order.id,
      after: {
        order_number: order.order_number,
        invoice_id: invoiceId,
        payment_url: paymentUrl,
        amount,
      },
    });

    return { ok: true, paymentUrl, invoiceId };
  } catch (error) {
    console.error("ZiniPay invoice creation failed", error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "ZiniPay could not create the payment page.",
    };
  }
}

async function invoiceIdsForOrder(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("admin_audit")
    .select("after")
    .eq("entity", "order")
    .eq("entity_id", orderId)
    .eq("action", "payment.zinipay.invoice")
    .order("created_at", { ascending: false })
    .limit(10);

  const ids = (data ?? [])
    .map((row) => (row.after as { invoice_id?: string | null } | null)?.invoice_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  return [...new Set(ids)];
}

export async function verifyZinipayInvoice(invoiceId: string) {
  const data = await zinipayFetch<VerifyResult & { message?: string }>(
    "/v1/payment/verify",
    { invoice_id: invoiceId },
  );

  if (!data?.status) throw new Error(data?.message || "ZiniPay verify failed.");
  return data;
}

async function orderItems(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  return (data ?? []) as OrderItem[];
}

async function storeSupportEmail() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "store")
    .maybeSingle();
  return normaliseSettings(data?.value).supportEmail;
}

export async function syncZinipayOrder(
  orderNumber: string,
): Promise<{ status: ZinipaySyncStatus; order?: Order }> {
  if (!isZinipayConfigured()) return { status: "not_configured" };

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!data) return { status: "not_found" };
  const order = data as Order;

  if (order.payment_method !== "zinipay") return { status: "not_zinipay", order };
  if (order.payment_status === "paid") return { status: "paid", order };
  if (order.status === "cancelled") return { status: "cancelled", order };

  const invoiceIds = await invoiceIdsForOrder(order.id);
  if (!invoiceIds.length) return { status: "pending", order };

  let verified: Awaited<ReturnType<typeof verifyZinipayInvoice>> | null = null;
  let matchedInvoiceId: string | null = null;
  let sawPending = false;

  for (const invoiceId of invoiceIds) {
    try {
      const candidate = await verifyZinipayInvoice(invoiceId);
      const candidateStatus = String(candidate.status).toUpperCase();
      if (candidateStatus === "COMPLETED") {
        verified = candidate;
        matchedInvoiceId = invoiceId;
        break;
      }
      if (candidateStatus === "PENDING") sawPending = true;
    } catch (verifyError) {
      console.warn("ZiniPay verify attempt failed", verifyError);
    }
  }

  if (!verified) {
    return { status: sawPending ? "pending" : "failed", order };
  }

  const invoiceId = verified.invoice_id || matchedInvoiceId || invoiceIds[0];

  try {
    if (Math.abs(Number(verified.amount) - Number(order.total)) > 1) {
      await supabase.from("admin_audit").insert({
        action: "payment.zinipay.mismatch",
        actor_email: order.email,
        entity: "order",
        entity_id: order.id,
        after: {
          order_number: order.order_number,
          expected: order.total,
          received: verified.amount,
          invoice_id: invoiceId,
        },
      });
      return { status: "mismatch", order };
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_status: "paid", status: "processing" })
      .eq("id", order.id);

    if (updateError) throw updateError;

    try {
      await decrementOrderStock(order.id);
    } catch (stockError) {
      console.error("ZiniPay stock update failed", stockError);
      await supabase.from("admin_audit").insert({
        action: "payment.zinipay.stock_failed",
        actor_email: order.email,
        entity: "order",
        entity_id: order.id,
        after: {
          order_number: order.order_number,
          message:
            stockError instanceof Error ? stockError.message : "Unknown stock error",
        },
      });
    }

    let granted = 0;
    try {
      granted = await grantOrderEntitlements({
        orderId: order.id,
        userId: order.user_id,
      });
    } catch (entitlementError) {
      console.error("ZiniPay entitlement grant failed", entitlementError);
      await supabase.from("admin_audit").insert({
        action: "payment.zinipay.entitlement_failed",
        actor_email: order.email,
        entity: "order",
        entity_id: order.id,
        after: {
          order_number: order.order_number,
          message:
            entitlementError instanceof Error
              ? entitlementError.message
              : "Unknown entitlement error",
        },
      });
    }

    const items = await orderItems(order.id);
    const supportEmail = await storeSupportEmail();
    after(() =>
      sendOrderConfirmation({
        order: {
          order_number: order.order_number,
          customer_name: order.customer_name,
          email: order.email,
          address: order.address,
          city: order.city,
          district: order.district,
          subtotal: order.subtotal,
          delivery_fee: order.delivery_fee,
          discount: order.discount,
          total: order.total,
          payment_method: "zinipay",
        },
        items: items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          line_total: item.line_total,
        })),
        supportEmail,
      }),
    );

    await supabase.from("admin_audit").insert({
      action: "payment.zinipay.confirmed",
      actor_email: order.email,
      entity: "order",
      entity_id: order.id,
      after: {
        order_number: order.order_number,
        invoice_id: invoiceId,
        transaction_id: verified.transaction_id ?? null,
        payment_method: verified.payment_method ?? null,
        amount: verified.amount,
        entitlements: granted,
      },
    });

    return {
      status: "paid",
      order: { ...order, payment_status: "paid", status: "processing" },
    };
  } catch (error) {
    console.error("ZiniPay verification failed", error);
    return { status: "error", order };
  }
}

export function webhookToken(orderNumber: string) {
  const secret =
    process.env.ZINIPAY_WEBHOOK_SECRET?.trim() ||
    process.env.APP_ENCRYPTION_KEY?.trim();
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update(orderNumber)
    .digest("hex")
    .slice(0, 40);
}

export function isValidWebhookToken(orderNumber: string, token: string) {
  const expected = webhookToken(orderNumber);
  if (!expected || !token) return true;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.ZINIPAY_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  if (!signature) return false;

  const expected = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * The ZiniPay dashboard allows one brand-wide IPN endpoint. If it does not
 * include our per-order query token, resolve the order from the invoice ID
 * recorded when the invoice was created.
 */
export async function findOrderNumberByInvoiceId(invoiceId: string) {
  if (!invoiceId) return null;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("admin_audit")
    .select("entity_id")
    .eq("action", "payment.zinipay.invoice")
    .contains("after", { invoice_id: invoiceId })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.entity_id) return null;

  const { data: order } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", data.entity_id)
    .maybeSingle();

  return order?.order_number ?? null;
}
