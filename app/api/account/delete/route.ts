import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireCustomerApi } from "@/lib/customer-api";

const schema = z.object({
  password: z.string().min(1).max(200),
  confirm: z.literal("DELETE"),
});

export async function POST(request: Request) {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Type DELETE and enter your password to confirm." },
      { status: 400 }
    );
  }

  const email = ctx.user.email;
  if (!email) {
    return NextResponse.json({ error: "This account has no email address." }, { status: 400 });
  }

  const verifier = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (verifyError) {
    return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  }

  const { error: deleteError } = await ctx.admin.auth.admin.deleteUser(ctx.user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }
  // profiles has no FK to auth.users in this project, so remove it explicitly.
  await ctx.admin.from("profiles").delete().eq("id", ctx.user.id);
  await ctx.supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
