import { NextResponse } from "next/server";

import { isValidWebhookToken, syncZinipayOrder } from "@/lib/zinipay";

export const runtime = "nodejs";

async function handle(request: Request) {
  const url = new URL(request.url);
  let body: Record<string, unknown> = {};

  if (request.method === "POST") {
    body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }

  const orderNumber =
    (typeof body.order === "string" && body.order) ||
    (typeof body.order_number === "string" && body.order_number) ||
    url.searchParams.get("order");
  const token =
    (typeof body.token === "string" && body.token) ||
    url.searchParams.get("token") ||
    "";

  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, message: "Missing order reference." },
      { status: 400 },
    );
  }

  if (!isValidWebhookToken(orderNumber, token)) {
    return NextResponse.json(
      { ok: false, message: "Invalid webhook token." },
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
