import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getInvoiceSettings, getStoreProfile } from "@/lib/admin/settings";
import { sendInvoiceEmail } from "@/lib/email";

export type InvoiceRow = {
  id: string;
  invoice_no: string;
  order_id: string;
  order_no: string;
  status: "issued" | "void";
  issued_at: string;
  seller: {
    name?: string;
    email?: string;
    replyTo?: string;
    address?: string;
  };
  customer: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    district?: string;
  };
  items: {
    name?: string;
    size?: string;
    color?: string;
    qty?: number;
    price?: number;
    bundleName?: string;
  }[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  payment: string | null;
  payment_status: string | null;
  snapshot: Record<string, unknown>;
  created_at: string;
};

export async function getInvoiceForOrder(admin: SupabaseClient, orderNo: string) {
  const { data } = await admin
    .from("invoices")
    .select("*")
    .eq("order_no", orderNo)
    .maybeSingle();
  return (data as InvoiceRow | null) ?? null;
}

export async function ensureInvoiceForOrder(
  admin: SupabaseClient,
  orderNo: string
): Promise<InvoiceRow | null> {
  const existing = await getInvoiceForOrder(admin, orderNo);
  if (existing) return existing;

  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (error || !order) return null;

  const [invoiceSettings, profile] = await Promise.all([
    getInvoiceSettings(),
    getStoreProfile(),
  ]);

  const { data: invoiceNo, error: numberError } = await admin.rpc(
    "bengalot_next_invoice_no",
    { prefix_in: invoiceSettings.prefix || "BG" }
  );
  if (numberError || !invoiceNo) return null;

  const seller = {
    name: profile.legalName || profile.brandName || invoiceSettings.senderName,
    email: invoiceSettings.senderEmail || profile.infoEmail,
    replyTo: invoiceSettings.replyTo || profile.supportEmail,
    address: profile.address,
  };
  const customer = {
    name: String(order.customer ?? ""),
    phone: String(order.phone ?? ""),
    email: order.email ? String(order.email) : "",
    address: String(order.address ?? ""),
    district: String(order.district ?? ""),
  };
  const items = Array.isArray(order.items) ? order.items : [];
  const snapshot = {
    invoiceNo: String(invoiceNo),
    issuedAt: new Date().toISOString(),
    orderNo: order.order_no,
    orderDate: order.created_at,
    seller,
    customer,
    items,
    subtotal: Number(order.subtotal ?? 0),
    discount: Number(order.discount ?? 0),
    delivery: Number(order.delivery ?? 0),
    total: Number(order.total ?? 0),
    payment: order.payment,
    paymentStatus: order.payment_status,
    footer: invoiceSettings.footer,
  };

  const { data: inserted, error: insertError } = await admin
    .from("invoices")
    .insert({
      invoice_no: String(invoiceNo),
      order_id: order.id,
      order_no: order.order_no,
      status: "issued",
      seller,
      customer,
      items,
      subtotal: Number(order.subtotal ?? 0),
      discount: Number(order.discount ?? 0),
      delivery: Number(order.delivery ?? 0),
      total: Number(order.total ?? 0),
      payment: order.payment,
      payment_status: order.payment_status,
      snapshot,
    })
    .select("*")
    .single();

  if (insertError) {
    // A concurrent request may have created the invoice first.
    const raced = await getInvoiceForOrder(admin, orderNo);
    return raced;
  }
  const invoice = inserted as InvoiceRow;
  if (invoiceSettings.autoSend) {
    try {
      await sendInvoiceEmail(admin, invoice);
    } catch {
      // Invoice email is best-effort; the invoice itself is already durable.
    }
  }
  return invoice;
}

export async function generateMissingInvoices(
  admin: SupabaseClient,
  limit = 100
) {
  const { data: orders } = await admin
    .from("orders")
    .select("order_no")
    .order("created_at", { ascending: false })
    .limit(limit);
  const { data: existing } = await admin
    .from("invoices")
    .select("order_no");
  const existingSet = new Set((existing ?? []).map((row) => row.order_no));
  const missing = (orders ?? []).filter((row) => !existingSet.has(row.order_no));
  const created: string[] = [];
  const failed: string[] = [];
  for (const order of missing) {
    const invoice = await ensureInvoiceForOrder(admin, order.order_no);
    if (invoice) created.push(invoice.invoice_no);
    else failed.push(order.order_no);
  }
  return { created: created.length, failed: failed.length, totalMissing: missing.length };
}
