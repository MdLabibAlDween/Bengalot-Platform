import "server-only";

import { createTransport, type Transporter } from "nodemailer";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getIntegrationSecrets,
  getIntegrationsConfig,
  getInvoiceSettings,
  getIntegrationSecretStatus,
} from "@/lib/admin/settings";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import type { InvoiceRow } from "@/lib/invoices";
import { formatBDT } from "@/lib/utils";

export type EmailOrder = {
  order_no: string;
  customer: string;
  email: string | null;
  phone: string;
  district: string;
  address: string;
  note: string | null;
  items: { name?: string; size?: string; color?: string; qty?: number; price?: number }[] | null;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  payment: string;
  payment_status: string;
  status: string;
  created_at: string;
  tracking_code?: string | null;
  courier_tracking_link?: string | null;
  courier_status?: string | null;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  kind?: string;
  dedupeKey?: string;
  attachments?: { filename: string; content: string | Buffer; contentType?: string }[];
};

export type SendEmailResult =
  | { ok: true; skipped?: boolean; duplicate?: boolean; messageId?: string }
  | { ok: false; error: string };

type SmtpConfig = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  fromName: string;
  username: string;
  password: string;
};

function smtpAddress(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const [config, secrets] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecrets(),
  ]);
  const smtp = config.smtp;
  if (
    !smtp.enabled ||
    !smtp.host ||
    !smtp.username ||
    !secrets.smtpPassword
  ) {
    return null;
  }
  return {
    enabled: true,
    host: smtp.host,
    port: Number(smtp.port) || 587,
    secure: Boolean(smtp.secure),
    fromName: smtp.fromName || "Bengalot",
    username: smtp.username,
    password: secrets.smtpPassword,
  };
}

function transporterFor(config: SmtpConfig): Transporter {
  return createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.username, pass: config.password },
    connectionTimeout: 12_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

export async function verifySmtpConnection() {
  const config = await getSmtpConfig();
  if (!config) {
    return { ok: false as const, error: "SMTP is not enabled or the password is missing." };
  }
  try {
    const transporter = transporterFor(config);
    await transporter.verify();
    transporter.close();
    return { ok: true as const, host: config.host, port: config.port };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? `SMTP verification failed: ${error.message}`
          : "SMTP verification failed.",
    };
  }
}

async function logEmail(
  admin: SupabaseClient,
  input: SendEmailInput,
  status: "sending" | "sent" | "failed" | "skipped",
  messageId?: string,
  error?: string
) {
  const payload = {
    dedupe_key: input.dedupeKey ?? null,
    to_email: input.to,
    subject: input.subject,
    kind: input.kind ?? "transactional",
    status,
    provider_message_id: messageId ?? null,
    error: error?.slice(0, 1000) ?? null,
  };
  if (input.dedupeKey) {
    const { data } = await admin
      .from("email_deliveries")
      .select("id")
      .eq("dedupe_key", input.dedupeKey)
      .maybeSingle();
    if (data?.id) {
      await admin.from("email_deliveries").update(payload).eq("id", data.id);
      return;
    }
  }
  await admin.from("email_deliveries").insert(payload);
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!smtpAddress(input.to)) {
    return { ok: false, error: "Recipient email is not valid." };
  }
  const config = await getSmtpConfig();
  const admin = (await import("@/lib/supabase/admin")).createAdminSupabaseClient();
  if (!config) {
    return { ok: false, error: "SMTP is not enabled or the password is missing." };
  }
  if (!admin) return { ok: false, error: "Storage is not configured." };

  if (input.dedupeKey) {
    const { data: existing } = await admin
      .from("email_deliveries")
      .select("id,status")
      .eq("dedupe_key", input.dedupeKey)
      .maybeSingle();
    if (existing && ["sending", "sent"].includes(existing.status)) {
      return { ok: true, skipped: true, duplicate: true };
    }
    if (existing?.id) {
      await admin
        .from("email_deliveries")
        .update({ status: "sending", error: null })
        .eq("id", existing.id);
    } else {
      const { error } = await admin.from("email_deliveries").insert({
        dedupe_key: input.dedupeKey,
        to_email: input.to,
        subject: input.subject,
        kind: input.kind ?? "transactional",
        status: "sending",
      });
      if (error?.code === "23505") {
        return { ok: true, skipped: true, duplicate: true };
      }
    }
  }

  try {
    const transporter = transporterFor(config);
    const info = await transporter.sendMail({
      from: `"${config.fromName.replace(/"/g, "")}" <${config.username}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
      attachments: input.attachments,
    });
    transporter.close();
    if (input.dedupeKey) {
      await logEmail(admin, input, "sent", info.messageId);
    } else {
      await logEmail(admin, input, "sent", info.messageId);
    }
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send the email.";
    await logEmail(admin, input, "failed", undefined, message);
    return { ok: false, error: message.slice(0, 500) };
  }
}

export async function sendTestEmail(to: string) {
  const html = emailLayout({
    eyebrow: "SMTP test",
    title: "Your mail pipeline is working.",
    body: [
      `<p>This is a test email from <strong>Bengalot</strong>. If you can read this, Purelymail SMTP is connected correctly.</p>`,
      `<p class="muted">Sent ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })} (Dhaka).</p>`,
    ].join(""),
  });
  return sendEmail({
    to,
    subject: "Bengalot SMTP test",
    html,
    text: "This is a test email from Bengalot. Purelymail SMTP is connected correctly.",
    kind: "test",
    replyTo: SITE.email,
  });
}

export type EmailDeliveryRow = {
  id: string;
  to_email: string;
  subject: string;
  kind: string;
  status: string;
  error: string | null;
  created_at: string;
};

export async function getEmailHealth() {
  const [config, secretStatus, admin] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecretStatus(),
    import("@/lib/supabase/admin").then((module) => module.createAdminSupabaseClient()),
  ]);
  const recent = admin
    ? (await admin
        .from("email_deliveries")
        .select("id,to_email,subject,kind,status,error,created_at")
        .order("created_at", { ascending: false })
        .limit(12)).data ?? []
    : [];
  return {
    enabled: config.smtp.enabled,
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    username: config.smtp.username,
    passwordSet: secretStatus.smtpPassword,
    configured: Boolean(config.smtp.enabled && config.smtp.host && config.smtp.username && secretStatus.smtpPassword),
    recent: recent as EmailDeliveryRow[],
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emailLayout({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { margin:0; padding:0; background:#f6f1e7; color:#1a1626; font-family: Georgia, 'Times New Roman', serif; }
  .wrap { max-width:620px; margin:0 auto; padding:32px 18px; }
  .card { background:#fffdf8; border:1px solid #e7ddc9; border-radius:18px; overflow:hidden; }
  .head { padding:28px 30px 20px; border-bottom:1px solid #eadfca; }
  .eyebrow { font-family: Arial, sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#8a6d1f; margin:0 0 8px; }
  h1 { font-size:28px; line-height:1.15; margin:0; font-weight:normal; }
  .body { padding:26px 30px 30px; font-family: Arial, sans-serif; font-size:14px; line-height:1.7; color:#3f394c; }
  .body p { margin:0 0 14px; }
  .muted { color:#7b7387; font-size:12px; }
  table { width:100%; border-collapse:collapse; margin:16px 0; font-size:13px; }
  th { text-align:left; font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#7b7387; border-bottom:1px solid #e7ddc9; padding:8px 0; }
  td { padding:9px 0; border-bottom:1px solid #f1eadc; vertical-align:top; }
  .right { text-align:right; }
  .total { font-size:17px; font-weight:bold; }
  .box { background:#f8f3e8; border-radius:12px; padding:14px 16px; margin:16px 0; }
  .cta { display:inline-block; background:#241b48; color:#fff8ec !important; text-decoration:none; padding:12px 20px; border-radius:999px; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; font-weight:bold; }
  .footer { padding:18px 30px 24px; font-family: Arial, sans-serif; font-size:11px; line-height:1.6; color:#8a8197; }
  a { color:#2b1f5f; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="head">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
      </div>
      <div class="body">${body}</div>
      <div class="footer">
        Bengalot · Saltha, Faridpur, Bangladesh<br/>
        <a href="${WHATSAPP_LINK}">WhatsApp</a> · <a href="mailto:${SITE.email}">${SITE.email}</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function orderItemRows(order: EmailOrder) {
  return (order.items ?? [])
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.name ?? "Item")}${item.size || item.color ? `<br/><span class="muted">${escapeHtml([item.color, item.size].filter(Boolean).join(" · "))}</span>` : ""}</td>
        <td class="right">${Number(item.qty ?? 1)}</td>
        <td class="right">${formatBDT(Number(item.price ?? 0) * Number(item.qty ?? 1))}</td>
      </tr>`
    )
    .join("");
}

function orderTotals(order: EmailOrder) {
  return `<table>
    <tr><td>Subtotal</td><td class="right">${formatBDT(Number(order.subtotal))}</td></tr>
    ${Number(order.discount) > 0 ? `<tr><td>Discount</td><td class="right">−${formatBDT(Number(order.discount))}</td></tr>` : ""}
    <tr><td>Delivery</td><td class="right">${formatBDT(Number(order.delivery))}</td></tr>
    <tr><td class="total">Total</td><td class="right total">${formatBDT(Number(order.total))}</td></tr>
  </table>`;
}

export async function sendOrderConfirmationEmail(
  admin: SupabaseClient,
  order: EmailOrder
) {
  if (!order.email || !smtpAddress(order.email)) {
    return { ok: false as const, error: "Order has no email address." };
  }
  const { data: invoice } = await admin
    .from("invoices")
    .select("invoice_no")
    .eq("order_no", order.order_no)
    .maybeSingle();
  const html = emailLayout({
    eyebrow: "Order received",
    title: `Thank you, ${String(order.customer).split(/\s+/)[0] || "friend"}.`,
    body: `
      <p>Your order <strong>${escapeHtml(order.order_no)}</strong> is in. We will confirm it shortly and keep you updated by email and in your account.</p>
      <table>
        <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Total</th></tr></thead>
        <tbody>${orderItemRows(order)}</tbody>
      </table>
      ${orderTotals(order)}
      <div class="box">
        <p><strong>Delivering to</strong><br/>${escapeHtml(order.customer)}<br/>${escapeHtml(order.address)}, ${escapeHtml(order.district)}<br/>${escapeHtml(order.phone)}</p>
        <p><strong>Payment</strong><br/>${escapeHtml(order.payment)} · ${escapeHtml(order.payment_status)}</p>
        ${invoice?.invoice_no ? `<p><strong>Invoice</strong><br/>${escapeHtml(invoice.invoice_no)}</p>` : ""}
      </div>
      <p><a class="cta" href="${SITE.url}/account/orders/${encodeURIComponent(order.order_no)}">View your order</a></p>
      <p class="muted">Need help? Reply to this email or message us on WhatsApp.</p>
    `,
  });
  return sendEmail({
    to: order.email,
    subject: `Order ${order.order_no} received — Bengalot`,
    html,
    text: `Thank you for your order ${order.order_no}. Total ${formatBDT(Number(order.total))}. We will confirm it shortly.`,
    kind: "order_confirmation",
    dedupeKey: `order:confirmation:${order.order_no}`,
    replyTo: SITE.email,
  });
}

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  Confirmed: {
    title: "Your order is confirmed.",
    body: "Thank you — we have confirmed your order and will begin preparing it.",
  },
  Processing: {
    title: "We are preparing your order.",
    body: "Your pieces are being checked and packed with care.",
  },
  "Handed to Courier": {
    title: "Your parcel is on its way.",
    body: "Your order has been handed to Steadfast. You can follow the tracking link below.",
  },
  "In Transit": {
    title: "Your order is moving.",
    body: "Your parcel is travelling to your district. Please keep your phone reachable.",
  },
  Delivered: {
    title: "Delivered — thank you.",
    body: "Your order has arrived. We hope it feels right. You can review it from your account.",
  },
  Returning: {
    title: "Your parcel is coming back.",
    body: "The courier could not complete delivery. The parcel is on its way back to us and our team will contact you.",
  },
  Cancelled: {
    title: "Your order was cancelled.",
    body: "This order has been cancelled. If a gift card was used, its balance has been restored.",
  },
  Returned: {
    title: "Your return is complete.",
    body: "We have recorded your return. If a gift card was used, its balance has been restored.",
  },
  "Failed Delivery": {
    title: "Delivery could not be completed.",
    body: "The courier could not complete delivery. Contact us and we will arrange the next step.",
  },
  Refunded: {
    title: "Your refund is recorded.",
    body: "This order has been marked refunded. Contact us if you need the details.",
  },
};

export async function sendOrderStatusEmail(
  admin: SupabaseClient,
  order: EmailOrder,
  status: string
) {
  if (!order.email || !smtpAddress(order.email)) {
    return { ok: false as const, error: "Order has no email address." };
  }
  const copy = STATUS_COPY[status] ?? {
    title: `Your order is now ${status}.`,
    body: "There is an update on your order. Open your account for the latest status.",
  };
  const trackingLink =
    order.courier_tracking_link ??
    (order.tracking_code ? `https://steadfast.com.bd/t/${order.tracking_code}` : null);
  const html = emailLayout({
    eyebrow: `Order ${order.order_no}`,
    title: copy.title,
    body: `
      <p>${escapeHtml(copy.body)}</p>
      <div class="box">
        <p><strong>Status</strong><br/>${escapeHtml(status)}</p>
        ${order.tracking_code ? `<p><strong>Tracking</strong><br/><span style="font-family:monospace">${escapeHtml(order.tracking_code)}</span></p>` : ""}
        ${trackingLink ? `<p><a class="cta" href="${escapeHtml(trackingLink)}">Track with Steadfast</a></p>` : ""}
      </div>
      <p><a href="${SITE.url}/account/orders/${encodeURIComponent(order.order_no)}">View your order</a></p>
      <p class="muted">Questions? Reply to this email or message us on WhatsApp.</p>
    `,
  });
  return sendEmail({
    to: order.email,
    subject: `Order ${order.order_no} — ${status} | Bengalot`,
    html,
    text: `${copy.title} ${copy.body} Order ${order.order_no}.`,
    kind: "order_status",
    dedupeKey: `order:status:${order.order_no}:${status}`,
    replyTo: SITE.email,
  });
}

export async function sendInvoiceEmail(
  admin: SupabaseClient,
  invoice: InvoiceRow,
  options?: { force?: boolean }
) {
  const settings = await getInvoiceSettings();
  if (!settings.autoSend && !options?.force) {
    return { ok: false as const, error: "Invoice auto-send is off." };
  }
  const email = invoice.customer.email;
  if (!email || !smtpAddress(email)) {
    return { ok: false as const, error: "Invoice has no customer email." };
  }
  const items = (invoice.items ?? [])
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.name ?? "Item")}${item.size ? `<br/><span class="muted">${escapeHtml(item.size)}</span>` : ""}</td>
        <td class="right">${Number(item.qty ?? 1)}</td>
        <td class="right">${formatBDT(Number(item.price ?? 0) * Number(item.qty ?? 1))}</td>
      </tr>`
    )
    .join("");
  const html = emailLayout({
    eyebrow: "Invoice",
    title: `Invoice ${invoice.invoice_no}.`,
    body: `
      <p>Thank you for shopping with Bengalot. Your invoice is below.</p>
      <table>
        <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Total</th></tr></thead>
        <tbody>${items}</tbody>
      </table>
      <table>
        <tr><td>Subtotal</td><td class="right">${formatBDT(Number(invoice.subtotal))}</td></tr>
        ${Number(invoice.discount) > 0 ? `<tr><td>Discount</td><td class="right">−${formatBDT(Number(invoice.discount))}</td></tr>` : ""}
        <tr><td>Delivery</td><td class="right">${formatBDT(Number(invoice.delivery))}</td></tr>
        <tr><td class="total">Total</td><td class="right total">${formatBDT(Number(invoice.total))}</td></tr>
      </table>
      <div class="box">
        <p><strong>Order</strong><br/>${escapeHtml(invoice.order_no)}</p>
        <p><strong>Issued</strong><br/>${new Date(invoice.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
      <p><a class="cta" href="${SITE.url}/account/orders/${encodeURIComponent(invoice.order_no)}">View your order</a></p>
      <p class="muted">${escapeHtml(invoice.snapshot?.footer ?? settings.footer)}</p>
    `,
  });
  return sendEmail({
    to: email,
    subject: `Invoice ${invoice.invoice_no} — Bengalot`,
    html,
    text: `Invoice ${invoice.invoice_no} for order ${invoice.order_no}. Total ${formatBDT(Number(invoice.total))}.`,
    kind: "invoice",
    dedupeKey: `invoice:${invoice.invoice_no}:email`,
    replyTo: settings.replyTo || SITE.email,
  });
}
