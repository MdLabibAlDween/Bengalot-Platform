import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { digitsOnly } from "@/lib/order-map";

const schema = z.object({
  productSlug: z.string().trim().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(5).max(2000),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Account service is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to review a purchase." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review." },
      { status: 400 }
    );
  }
  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Review storage is not configured." }, { status: 503 });

  const { data: profile } = await admin
    .from("profiles")
    .select("email,phone,full_name")
    .eq("id", user.id)
    .maybeSingle();
  const email = profile?.email || user.email || "";
  const phone = digitsOnly(profile?.phone || "");

  const [byEmail, byPhone] = await Promise.all([
    email
      ? admin.from("orders").select("items,status").ilike("email", email).limit(200)
      : Promise.resolve({ data: [] }),
    phone
      ? admin.from("orders").select("items,status").eq("phone", phone).limit(200)
      : Promise.resolve({ data: [] }),
  ]);
  const purchased = [...(byEmail.data ?? []), ...(byPhone.data ?? [])].some(
    (order) =>
      !["Cancelled", "Returned", "Failed Delivery", "Refunded"].includes(String(order.status)) &&
      Array.isArray(order.items) &&
      order.items.some(
        (item: { productSlug?: string }) => item.productSlug === parsed.data.productSlug
      )
  );
  if (!purchased) {
    return NextResponse.json(
      { error: "Only verified buyers can review this piece." },
      { status: 403 }
    );
  }

  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("profile_id", user.id)
    .eq("product_slug", parsed.data.productSlug)
    .in("status", ["pending", "approved"])
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "You already have a review for this piece." },
      { status: 409 }
    );
  }

  const { data, error } = await admin
    .from("reviews")
    .insert({
      product_slug: parsed.data.productSlug,
      profile_id: user.id,
      name: profile?.full_name || user.user_metadata?.full_name || "Customer",
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      status: "pending",
      verified: true,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, review: data });
}
