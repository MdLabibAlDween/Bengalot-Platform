import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomerApi } from "@/lib/customer-api";

export async function GET() {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;
  const { data, error } = await ctx.admin
    .from("reviews")
    .select("id,product_slug,name,location,rating,title,body,status,verified,helpful,created_at")
    .eq("profile_id", ctx.user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reviews: data ?? [] });
}

export async function DELETE(request: Request) {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;
  const parsed = z
    .object({ id: z.string().uuid() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  }
  const { error } = await ctx.admin
    .from("reviews")
    .delete()
    .eq("id", parsed.data.id)
    .eq("profile_id", ctx.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
