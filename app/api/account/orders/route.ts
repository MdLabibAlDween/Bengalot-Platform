import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapOrderRow, type OrderRow } from "@/lib/order-map";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Account service is not configured." }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Order storage is not configured." }, { status: 503 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("email,phone,is_blacklisted")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_blacklisted) {
    return NextResponse.json({ error: "This account is blocked." }, { status: 403 });
  }

  const email = profile?.email || user.email;
  const phone = profile?.phone || "";
  const [byEmail, byPhone] = await Promise.all([
    email
      ? admin
          .from("orders")
          .select("*")
          .ilike("email", email)
          .order("created_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null }),
    phone
      ? admin
          .from("orders")
          .select("*")
          .eq("phone", phone)
          .order("created_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (byEmail.error || byPhone.error) {
    return NextResponse.json({ error: "Could not load your orders." }, { status: 503 });
  }

  const rows = new Map<string, OrderRow>();
  for (const row of [...(byEmail.data ?? []), ...(byPhone.data ?? [])] as OrderRow[]) {
    rows.set(row.order_no, row);
  }
  const orders = [...rows.values()]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .map(mapOrderRow);

  return NextResponse.json(
    { orders },
    { headers: { "Cache-Control": "no-store" } }
  );
}
