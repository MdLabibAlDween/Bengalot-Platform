import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { productResource } from "@/lib/product-media";
import { getResourceLink } from "@/lib/resource-links";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.union([
  z.object({
    action: z.literal("grant"),
    userId: z.string().uuid(),
    productId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("revoke"),
    userId: z.string().uuid(),
    entitlementId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("refresh"),
    userId: z.string().uuid(),
    entitlementId: z.string().uuid(),
  }),
]);

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.profile || current.profile.role !== "owner") {
    return NextResponse.json(
      { message: "Only the studio owner can manage library access." },
      { status: 403 },
    );
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid access request." },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const supabase = createSupabaseAdminClient();

    if (payload.action === "grant") {
      const [{ data: profile }, { data: product }] = await Promise.all([
        supabase.from("profiles").select("id,email").eq("id", payload.userId).maybeSingle(),
        supabase.from("products").select("*").eq("id", payload.productId).maybeSingle(),
      ]);

      if (!profile) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
      }
      if (!product) {
        return NextResponse.json({ message: "Product not found." }, { status: 404 });
      }

      const uploaded = productResource(product);
      const fallback = getResourceLink(product.slug);
      const { error } = await supabase.from("entitlements").upsert(
        {
          user_id: profile.id,
          product_id: product.id,
          order_id: null,
          title: product.title,
          access_label: uploaded?.label ?? fallback.label,
          access_url: uploaded?.url ?? (fallback.url || null),
          granted_at: new Date().toISOString(),
        },
        { onConflict: "user_id,product_id" },
      );
      if (error) throw error;

      await supabase.from("admin_audit").insert({
        actor_id: current.user.id,
        actor_email: current.profile.email,
        action: "user.access_grant",
        entity: "profile",
        entity_id: profile.id,
        after: { email: profile.email, product: product.slug },
      });
    }

    if (payload.action === "revoke") {
      const { data: entitlement } = await supabase
        .from("entitlements")
        .select("id,user_id,title,product_id")
        .eq("id", payload.entitlementId)
        .eq("user_id", payload.userId)
        .maybeSingle();

      if (!entitlement) {
        return NextResponse.json({ message: "Access not found." }, { status: 404 });
      }

      const { error } = await supabase
        .from("entitlements")
        .delete()
        .eq("id", entitlement.id);
      if (error) throw error;

      await supabase.from("admin_audit").insert({
        actor_id: current.user.id,
        actor_email: current.profile.email,
        action: "user.access_revoke",
        entity: "profile",
        entity_id: payload.userId,
        before: entitlement,
      });
    }

    if (payload.action === "refresh") {
      const { data: entitlement } = await supabase
        .from("entitlements")
        .select("*")
        .eq("id", payload.entitlementId)
        .eq("user_id", payload.userId)
        .maybeSingle();

      if (!entitlement) {
        return NextResponse.json({ message: "Access not found." }, { status: 404 });
      }

      if (!entitlement.product_id) {
        return NextResponse.json(
          { message: "This access is not linked to a product." },
          { status: 400 },
        );
      }

      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", entitlement.product_id)
        .maybeSingle();

      if (!product) {
        return NextResponse.json({ message: "Product not found." }, { status: 404 });
      }

      const uploaded = productResource(product);
      const fallback = getResourceLink(product.slug);
      const { error } = await supabase
        .from("entitlements")
        .update({
          title: product.title,
          access_label: uploaded?.label ?? fallback.label,
          access_url: uploaded?.url ?? (fallback.url || null),
        })
        .eq("id", entitlement.id);
      if (error) throw error;

      await supabase.from("admin_audit").insert({
        actor_id: current.user.id,
        actor_email: current.profile.email,
        action: "user.access_refresh",
        entity: "profile",
        entity_id: payload.userId,
        after: { entitlement: entitlement.id, product: product.slug },
      });
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${payload.userId}`);
    revalidatePath("/account/library");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Library access update failed", error);
    return NextResponse.json(
      { message: "The library access could not be updated." },
      { status: 500 },
    );
  }
}
