import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { digitsOnly, mapOrderRow, type OrderRow } from "@/lib/order-map";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = rateLimit(rateLimitKey(request, "track"), 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many lookup attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const orderNo = searchParams.get("orderNo")?.trim().toUpperCase() ?? "";
  const phone = digitsOnly(searchParams.get("phone") ?? "");
  if (!orderNo || phone.length < 11) {
    return NextResponse.json(
      { error: "Enter both your order number and phone number." },
      { status: 400 }
    );
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Order lookup is not configured." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("orders")
    .select("*")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "Could not look up that order." }, { status: 503 });
  }

  // Do not reveal whether the order exists to someone without the phone number.
  if (!data || digitsOnly(String(data.phone ?? "")) !== phone) {
    return NextResponse.json(
      { error: "We could not find an order with those details." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { ok: true, order: mapOrderRow(data as OrderRow) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
