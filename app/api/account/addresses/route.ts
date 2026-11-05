import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DISTRICTS } from "@/lib/constants";

const schema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1).max(40),
  recipientName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/),
  district: z.string().trim().refine((value) => DISTRICTS.includes(value)),
  thana: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(500),
  isDefault: z.boolean().default(false),
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

function map(row: Record<string, unknown>) {
  return {
    id: row.id,
    label: row.label,
    name: row.recipient_name,
    phone: row.phone,
    district: row.district,
    thana: row.thana,
    address: row.address,
    isDefault: row.is_default,
  };
}

export async function GET() {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  const { data, error } = await ctx.admin
    .from("customer_addresses")
    .select("*")
    .eq("profile_id", ctx.user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ addresses: (data ?? []).map(map) });
}

export async function POST(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid address." },
      { status: 400 }
    );
  }
  const input = parsed.data;
  if (input.isDefault) {
    await ctx.admin
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("profile_id", ctx.user.id);
  }
  const payload = {
    profile_id: ctx.user.id,
    label: input.label,
    recipient_name: input.recipientName,
    phone: input.phone,
    district: input.district,
    thana: input.thana,
    address: input.address,
    is_default: input.isDefault,
  };
  const query = input.id
    ? ctx.admin.from("customer_addresses").update(payload).eq("id", input.id).eq("profile_id", ctx.user.id)
    : ctx.admin.from("customer_addresses").insert(payload);
  const { data, error } = await query.select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/account/addresses");
  return NextResponse.json({ ok: true, address: map(data) });
}

export async function DELETE(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  const { error } = await ctx.admin
    .from("customer_addresses")
    .delete()
    .eq("id", parsed.data.id)
    .eq("profile_id", ctx.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
