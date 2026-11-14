import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const paletteSchema = z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).length(3);

const specSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(200),
});

const previewSchema = z.record(z.string(), z.unknown());

const schema = z.object({
  slug: z.string().min(1).max(160),
  title: z.string().trim().min(2).max(160),
  title_bn: z.string().trim().max(200).optional().nullable(),
  subtitle: z.string().trim().min(4).max(300),
  description: z.string().trim().min(10).max(5000),
  sku: z.string().trim().max(60).nullable().optional(),
  category_slug: z.string().min(1).max(120),
  type: z.enum(["digital", "physical", "bundle"]),
  format: z.string().trim().min(2).max(140),
  price: z.number().int().min(0).max(1000000),
  compare_at: z.number().int().min(0).max(1000000).nullable().optional(),
  stock: z.number().int().min(0).max(100000),
  badge: z.string().trim().max(60).nullable().optional(),
  featured: z.boolean(),
  is_published: z.boolean(),
  art_key: z.string().min(1).max(40),
  palette: paletteSchema,
  includes: z.array(z.string().trim().min(1).max(220)).max(40),
  requirements: z.array(z.string().trim().min(1).max(220)).max(40),
  specs: z.array(specSchema).max(20),
  tags: z.array(z.string().trim().min(1).max(60)).max(30),
  sort: z.number().int().min(0).max(9999),
  preview: previewSchema,
});

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.profile || !STAFF_ROLES.has(current.profile.role)) {
    return NextResponse.json({ message: "Not authorised." }, { status: 403 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Some product details need another look.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { slug, ...updates } = parsed.data;
    const supabase = createSupabaseAdminClient();

    if (updates.sku) {
      const { data: duplicate } = await supabase
        .from("products")
        .select("slug")
        .eq("sku", updates.sku)
        .neq("slug", slug)
        .maybeSingle();
      if (duplicate) {
        return NextResponse.json(
          {
            message: "That SKU is already used by another product.",
            fields: { sku: ["This SKU is taken."] },
          },
          { status: 400 },
        );
      }
    }

    if (updates.compare_at && updates.compare_at <= updates.price) {
      return NextResponse.json(
        {
          message: "The compare-at price must be higher than the price.",
          fields: { compare_at: ["Must be higher than the price."] },
        },
        { status: 400 },
      );
    }

    const { data: category } = await supabase
      .from("categories")
      .select("id,slug")
      .eq("slug", updates.category_slug)
      .maybeSingle();

    if (!category) {
      return NextResponse.json(
        {
          message: "Choose a collection that exists.",
          fields: { category_slug: ["Unknown collection."] },
        },
        { status: 400 },
      );
    }

    const { data: before } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!before) {
      return NextResponse.json(
        { message: "This product no longer exists." },
        { status: 404 },
      );
    }

    const { error } = await supabase
      .from("products")
      .update({
        ...updates,
        category_id: category.id,
        compare_at: updates.compare_at || null,
        badge: updates.badge || null,
        sku: updates.sku || null,
      })
      .eq("slug", slug);

    if (error) throw error;

    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "product.update",
      entity: "product",
      entity_id: slug,
      before,
      after: updates,
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${updates.category_slug}`);
    revalidatePath(`/product/${slug}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${slug}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Product update failed", error);
    return NextResponse.json(
      { message: "The product could not be saved." },
      { status: 500 },
    );
  }
}
