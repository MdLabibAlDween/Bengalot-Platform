import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const paletteSchema = z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).length(3);

const schema = z.object({
  slug: z.string().min(1).max(160),
  title: z.string().trim().min(2).max(160),
  title_bn: z.string().trim().max(200).optional().nullable(),
  subtitle: z.string().trim().min(4).max(300),
  description: z.string().trim().min(10).max(5000),
  category_slug: z.string().min(1).max(120),
  price: z.number().int().min(0).max(1000000),
  compare_at: z.number().int().min(0).max(1000000).nullable().optional(),
  stock: z.number().int().min(0).max(100000),
  badge: z.string().trim().max(60).nullable().optional(),
  featured: z.boolean(),
  is_published: z.boolean(),
  art_key: z.string().min(1).max(40),
  palette: paletteSchema,
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
        { message: "Some product details need another look.", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { slug, ...updates } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", updates.category_slug)
      .maybeSingle();

    const { error } = await supabase
      .from("products")
      .update({
        ...updates,
        category_id: category?.id ?? null,
        compare_at: updates.compare_at || null,
        badge: updates.badge || null,
      })
      .eq("slug", slug);

    if (error) throw error;

    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "product.update",
      entity: "product",
      entity_id: slug,
      after: updates,
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${slug}`);
    revalidatePath("/admin/products");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Product update failed", error);
    return NextResponse.json(
      { message: "The product could not be saved." },
      { status: 500 },
    );
  }
}
