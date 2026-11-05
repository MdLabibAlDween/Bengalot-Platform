import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { digitsOnly } from "@/lib/order-map";

const schema = z.object({
  orderNo: z.string().trim().min(4).max(40),
  item: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(2).max(120),
  details: z.string().trim().max(2000).optional(),
});

async function context() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: NextResponse.json({ error: "Account service is not configured." }, { status: 503 }) };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  const admin = createAdminSupabaseClient();
  if (!admin) return { error: NextResponse.json({ error: "Storage is not configured." }, { status: 503 }) };
  return { user, admin };
}

export async function GET() {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  const { data, error } = await ctx.admin
    .from("return_requests")
    .select("*")
    .eq("profile_id", ctx.user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ returns: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid return request." },
      { status: 400 }
    );
  }

  const { data: profile } = await ctx.admin
    .from("profiles")
    .select("email,phone,full_name")
    .eq("id", ctx.user.id)
    .maybeSingle();
  const email = profile?.email || ctx.user.email || "";
  const phone = digitsOnly(profile?.phone || "");

  const { data: order } = await ctx.admin
    .from("orders")
    .select("order_no,customer,phone,email")
    .eq("order_no", parsed.data.orderNo.toUpperCase())
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const matches =
    (email && String(order.email ?? "").toLowerCase() === email.toLowerCase()) ||
    (phone && digitsOnly(String(order.phone ?? "")) === phone);
  if (!matches) {
    return NextResponse.json({ error: "That order is not linked to this account." }, { status: 403 });
  }

  const { data, error } = await ctx.admin
    .from("return_requests")
    .insert({
      profile_id: ctx.user.id,
      order_no: order.order_no,
      customer_name: order.customer,
      phone: order.phone,
      email: order.email,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
      items: [{ name: parsed.data.item, qty: 1 }],
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/account/returns");
  return NextResponse.json({ ok: true, request: data });
}
