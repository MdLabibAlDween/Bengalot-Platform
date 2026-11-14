import "server-only";

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import { getMailAccount } from "@/lib/env";
import type { MailAccountKind } from "@/lib/env";

type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

type SendResult =
  | { sent: true }
  | { sent: false; skipped: true }
  | { sent: false; skipped: false; error: string };

const transporters = new Map<string, Transporter>();
const warnedMissing = new Set<MailAccountKind>();

function getTransporter(
  config: NonNullable<ReturnType<typeof getMailAccount>>,
) {
  const key = `${config.host}:${config.port}:${config.secure}:${config.user}:${config.pass}`;
  const existing = transporters.get(key);
  if (existing) return existing;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
  });
  transporters.set(key, transporter);
  return transporter;
}

export function isMailConfigured(kind: MailAccountKind) {
  return Boolean(getMailAccount(kind));
}

export async function sendMail(
  kind: MailAccountKind,
  message: MailMessage,
): Promise<SendResult> {
  const config = getMailAccount(kind);
  if (!config) {
    if (!warnedMissing.has(kind)) {
      console.info(
        `Email for ${kind}@ is not configured. Add MAIL_${kind.toUpperCase()}_USER and MAIL_${kind.toUpperCase()}_PASS to enable it.`,
      );
      warnedMissing.add(kind);
    }
    return { sent: false, skipped: true };
  }

  try {
    await getTransporter(config).sendMail({
      from: config.from,
      to: message.to,
      replyTo: message.replyTo ?? config.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { sent: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown mail error";
    console.error(`Email send failed (${kind})`, detail);
    return { sent: false, skipped: false, error: detail };
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const money = (value: number) => `৳${Number(value).toLocaleString("en-BD")}`;

function layout({
  heading,
  intro,
  body,
  footer = "Bengalot · Bring a lot to learning.",
}: {
  heading: string;
  intro: string;
  body: string;
  footer?: string;
}) {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f8f8;color:#152232;font-family:Manrope,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8f8;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e9e7;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#101c2a;padding:20px 26px;">
                <p style="margin:0;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:#f3c95f;font-weight:700;">Bengalot</p>
                <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.1;color:#ffffff;">${escapeHtml(heading)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#2f3d4d;">${escapeHtml(intro)}</p>
                ${body}
                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#56625d;">${escapeHtml(footer)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 26px;background:#f6f8f8;border-top:1px solid #e4e9e7;">
                <p style="margin:0;font-size:11px;color:#6b7873;">Need anything? Reply to this email or message us on WhatsApp 01341739202.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOrderConfirmation({
  order,
  items,
  supportEmail,
}: {
  order: {
    order_number: string;
    customer_name: string;
    email: string;
    address: string;
    city: string;
    district: string;
    subtotal: number;
    delivery_fee: number;
    discount: number;
    total: number;
    payment_method: string;
  };
  items: { title: string; quantity: number; line_total: number }[];
  supportEmail: string;
}) {
  const firstName = order.customer_name.split(" ")[0] || "there";
  const payment =
    order.payment_method === "cod"
      ? "Cash on delivery — no payment is needed now. Please have the exact amount ready when the parcel arrives."
      : order.payment_method === "zinipay"
        ? "Paid securely through ZiniPay (bKash, Nagad, Rocket or Upay). Digital access is ready in your account library."
        : "bKash — we will send payment instructions shortly. Digital access unlocks once payment is confirmed.";

  const itemRows = items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;font-size:13px;color:#152232;">${escapeHtml(item.title)} <span style="color:#56625d;">× ${item.quantity}</span></td>
        <td align="right" style="padding:8px 0;font-size:13px;color:#152232;white-space:nowrap;">${money(item.line_total)}</td>
      </tr>`,
    )
    .join("");

  const discountRow =
    order.discount > 0
      ? `<tr>
          <td style="padding:3px 0;font-size:13px;color:#0d6f6d;">Promo discount</td>
          <td align="right" style="padding:3px 0;font-size:13px;color:#0d6f6d;">−${money(order.discount)}</td>
        </tr>`
      : "";

  const body = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e4e9e7;border-bottom:1px solid #e4e9e7;">
      ${itemRows}
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
      <tr>
        <td style="padding:3px 0;font-size:13px;color:#56625d;">Subtotal</td>
        <td align="right" style="padding:3px 0;font-size:13px;color:#152232;">${money(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:3px 0;font-size:13px;color:#56625d;">Delivery</td>
        <td align="right" style="padding:3px 0;font-size:13px;color:#152232;">${order.delivery_fee === 0 ? "Free" : money(order.delivery_fee)}</td>
      </tr>
      ${discountRow}
      <tr>
        <td style="padding:10px 0 0;border-top:1px solid #e4e9e7;font-size:15px;font-weight:700;color:#152232;">Total</td>
        <td align="right" style="padding:10px 0 0;border-top:1px solid #e4e9e7;font-size:19px;font-family:Georgia,serif;font-weight:700;color:#152232;">${money(order.total)}</td>
      </tr>
    </table>
    <div style="margin-top:20px;padding:14px 16px;background:#f6f8f8;border-radius:12px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#56625d;font-weight:700;">Payment</p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#2f3d4d;">${escapeHtml(payment)}</p>
    </div>
    <div style="margin-top:14px;padding:14px 16px;background:#f6f8f8;border-radius:12px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#56625d;font-weight:700;">Delivery to</p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#2f3d4d;">${escapeHtml(order.address)}, ${escapeHtml(order.city)}, ${escapeHtml(order.district)}</p>
    </div>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#2f3d4d;">Questions? Reply to this email or write to ${escapeHtml(supportEmail)} and a human will answer.</p>`;

  return sendMail("support", {
    to: order.email,
    replyTo: supportEmail,
    subject: `Order ${order.order_number} received · Bengalot`,
    text: [
      `Thank you, ${firstName}. We have your order ${order.order_number}.`,
      "",
      ...items.map((item) => `${item.title} × ${item.quantity} — ${money(item.line_total)}`),
      "",
      `Subtotal: ${money(order.subtotal)}`,
      `Delivery: ${order.delivery_fee === 0 ? "Free" : money(order.delivery_fee)}`,
      ...(order.discount > 0 ? [`Discount: −${money(order.discount)}`] : []),
      `Total: ${money(order.total)}`,
      "",
      payment,
      "",
      `Deliver to: ${order.address}, ${order.city}, ${order.district}`,
      `Support: ${supportEmail}`,
    ].join("\n"),
    html: layout({
      heading: "Your order is in.",
      intro: `Thank you, ${firstName}. We have order ${order.order_number} and a human will check it before it leaves the studio.`,
      body,
    }),
  });
}

export async function sendContactAcknowledgement({
  name,
  email,
  message,
  supportEmail,
}: {
  name: string;
  email: string;
  message: string;
  supportEmail: string;
}) {
  return sendMail("support", {
    to: email,
    replyTo: supportEmail,
    subject: "We have your note · Bengalot",
    text: [
      `Thank you, ${name}. Your note reached the studio.`,
      "",
      `"${message}"`,
      "",
      "We usually reply within one working day.",
      `If it is urgent, message us on WhatsApp 01341739202 or write to ${supportEmail}.`,
    ].join("\n"),
    html: layout({
      heading: "Your note reached us.",
      intro: `Thank you, ${name}. A human will read this and reply within one working day.`,
      body: `<div style="padding:14px 16px;background:#f6f8f8;border-left:3px solid #0d6f6d;border-radius:8px;font-size:13px;line-height:1.7;color:#2f3d4d;">${escapeHtml(message)}</div>
        <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#2f3d4d;">If it is urgent, message us on WhatsApp <strong>01341739202</strong> or write to ${escapeHtml(supportEmail)}.</p>`,
    }),
  });
}

export async function sendContactNotification({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const info = getMailAccount("info");
  if (!info) return { sent: false as const, skipped: true as const };

  return sendMail("info", {
    to: process.env.MAIL_CONTACT_TO?.trim() || info.user,
    replyTo: email,
    subject: `New contact note from ${name} · Bengalot`,
    text: [
      `New contact message from ${name} <${email}>.`,
      "",
      message,
      "",
      "Reply directly to this email to answer the customer.",
    ].join("\n"),
    html: layout({
      heading: "A new note arrived.",
      intro: `${name} <${email}> used the contact form. Reply to this email to answer them directly.`,
      body: `<div style="padding:14px 16px;background:#f6f8f8;border-left:3px solid #0d6f6d;border-radius:8px;font-size:13px;line-height:1.7;color:#2f3d4d;">${escapeHtml(message)}</div>`,
      footer: "This notification was sent to the info@ mailbox.",
    }),
  });
}

export async function sendPasswordReset({
  email,
  name,
  resetUrl,
}: {
  email: string;
  name: string;
  resetUrl: string;
}) {
  return sendMail("support", {
    to: email,
    subject: "Reset your Bengalot password",
    text: [
      `Hello ${name},`,
      "",
      "We received a request to reset your Bengalot password.",
      "Open this link to choose a new password:",
      resetUrl,
      "",
      "The link can only be used once. If you did not ask for this, you can ignore this email.",
      "",
      "— Bengalot support",
    ].join("\n"),
    html: layout({
      heading: "Choose a new password.",
      intro: `Hello ${name}, we received a request to reset your Bengalot password. This link can only be used once.`,
      body: `<p style="margin:0 0 18px;"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#152232;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:999px;font-size:13px;font-weight:700;">Reset my password</a></p>
        <p style="margin:0;font-size:12px;line-height:1.7;color:#56625d;">If the button does not work, paste this link into your browser:<br /><span style="word-break:break-all;color:#0d6f6d;">${escapeHtml(resetUrl)}</span></p>`,
      footer: "If you did not ask for this, you can safely ignore this email.",
    }),
  });
}

export async function sendAccountWelcome({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  return sendMail("info", {
    to: email,
    subject: "Welcome to your Bengalot account",
    text: [
      `Welcome, ${name}.`,
      "",
      "Your Bengalot account is ready. Digital products you buy will appear in your private library, alongside your order history.",
      "",
      "Sign in any time at https://bengalot.com/login",
      "",
      "— Bengalot",
    ].join("\n"),
    html: layout({
      heading: "Your account is ready.",
      intro: `Welcome, ${name}. Digital products you buy will appear in your private library, alongside your order history.`,
      body: `<p style="margin:0 0 18px;"><a href="https://bengalot.com/login" style="display:inline-block;background:#0d6f6d;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:999px;font-size:13px;font-weight:700;">Open my account</a></p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#2f3d4d;">Everything you own stays tied to this profile — no access codes to lose.</p>`,
    }),
  });
}

export async function sendNewsletterWelcome(email: string) {
  return sendMail("info", {
    to: email,
    subject: "You are on the list · Bengalot",
    text: [
      "You are on the list.",
      "",
      "We send a short studio letter: new tools, quiet study notes and the occasional release.",
      "No noise. Unsubscribe whenever you like.",
      "",
      "— Bengalot",
    ].join("\n"),
    html: layout({
      heading: "A quieter inbox.",
      intro: "You are on the list. We send a short studio letter: new tools, quiet study notes and the occasional release.",
      body: `<p style="margin:0;font-size:13px;line-height:1.7;color:#2f3d4d;">No noise. Unsubscribe whenever you like.</p>`,
    }),
  });
}
