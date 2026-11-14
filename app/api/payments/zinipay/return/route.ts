import { NextResponse } from "next/server";

import { syncZinipayOrder, zinipaySiteUrl } from "@/lib/zinipay";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("order");

  if (!orderNumber) {
    return NextResponse.redirect(new URL("/checkout", zinipaySiteUrl()));
  }

  const result = await syncZinipayOrder(orderNumber);
  const target = new URL("/checkout/success", zinipaySiteUrl());
  target.searchParams.set("order", orderNumber);
  target.searchParams.set("payment", result.status);

  return NextResponse.redirect(target);
}
