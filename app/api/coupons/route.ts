import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ coupons: [] });
  const { data } = await admin
    .from("coupons")
    .select("code,title,description,type,value,min_spend,expires_at,status,is_demo,product_slugs")
    .eq("status", "active")
    .is("profile_id", null)
    .order("created_at", { ascending: false })
    .limit(50);
  return NextResponse.json(
    {
      coupons: (data ?? []).map((row) => ({
        code: row.code,
        title: row.title,
        description: row.description ?? "",
        type: row.type,
        value: Number(row.value),
        minSpend: Number(row.min_spend),
        expires: row.expires_at ?? "",
        tone: row.type === "shipping" ? "teal" : row.type === "fixed" ? "indigo" : "magenta",
        isDemo: Boolean(row.is_demo),
        productSlugs: Array.isArray(row.product_slugs) ? row.product_slugs.filter(Boolean) : [],
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
