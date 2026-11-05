import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(5).max(4000),
  orderNo: z.string().trim().max(40).optional(),
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
    .from("support_messages")
    .select("*")
    .eq("profile_id", ctx.user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid support message." },
      { status: 400 }
    );
  }
  const { data: profile } = await ctx.admin
    .from("profiles")
    .select("full_name,email,phone")
    .eq("id", ctx.user.id)
    .maybeSingle();
  const { data, error } = await ctx.admin
    .from("support_messages")
    .insert({
      profile_id: ctx.user.id,
      name: profile?.full_name || ctx.user.user_metadata?.full_name || "Customer",
      email: profile?.email || ctx.user.email || "",
      phone: profile?.phone || ctx.user.user_metadata?.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
      order_no: parsed.data.orderNo || null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, message: data });
}
