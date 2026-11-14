import { NextResponse } from "next/server";

import {
  findOrderNumberByInvoiceId,
  isValidWebhookToken,
  syncZinipayOrder,
  verifyWebhookSignature,
} from "@/lib/zinipay";

export const runtime = "nodejs";

async function handle(request: Request) {
  const url = new URL(request.url);
  const rawBody = request.method === "POST" ? await request.text() : "";
  let body: Record<string, unknown> = {};

  if (rawBody) {
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }

  const signature =
    request.headers.get("x-zinipay-signature") ??
    request.headers.get("zinipay-signature") ??
    "";
  const secretConfigured = Boolean(process.env.ZINIPAY_WEBHOOK_SECRET?.trim());
  const signatureValid = Boolean(signature) && verifyWebhookSignature(rawBody, signature);

  if (signature && !signatureValid) {
    return NextResponse.json(
      { ok: false, message: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  const invoiceId =
    (typeof body.invoice_id === "string" && body.invoice_id) ||
    (typeof body.invoiceId === "string" && body.invoiceId) ||
    url.searchParams.get("invoice_id") ||
    "";

  let orderNumber =
    (typeof body.order === "string" && body.order) ||
    (typeof body.order_number === "string" && body.order_number) ||
    url.searchParams.get("order") ||
    "";

  if (!orderNumber && invoiceId) {
    orderNumber = (await findOrderNumberByInvoiceId(invoiceId)) ?? "";
  }

  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, message: "Missing order reference." },
      { status: 400 },
    );
  }

  const token =
    (typeof body.token === "string" && body.token) ||
    url.searchParams.get("token") ||
    "";
  const tokenValid = Boolean(token) && isValidWebhookToken(orderNumber, token);

  if (secretConfigured && !signatureValid && !tokenValid) {
    return NextResponse.json(
      { ok: false, message: "Webhook could not be authenticated." },
      { status: 401 },
    );
  }

  // Never trust the webhook payload status. Always verify with ZiniPay before
  // releasing digital access or changing the order.
  const result = await syncZinipayOrder(orderNumber);
  return NextResponse.json({
    ok: result.status === "paid" || result.status === "pending",
    status: result.status,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
