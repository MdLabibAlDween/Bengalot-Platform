import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { deleteProductImage, isProductImage } from "@/lib/supabase/storage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const schema = z.object({
  id: z.string().uuid(),
  eyebrow: z.string().trim().min(1).max(80),
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().min(5).max(500),
  cta_label: z.string().trim().min(1).max(60),
  cta_href: z.string().trim().min(1).max(300),
  art_key: z.string().min(1).max(40),
  theme: z.object({
    surface: color,
    ink: color,
    accent: color,
    from: color,
    to: color,
    image: z
      .string()
      .url()
      .max(2048)
      .refine((url) => isProductImage(url), {
        message: "Upload the image in the studio first.",
      })
      .nullable()
      .optional(),
  }),
  sort: z.number().int().min(0).max(999),
  is_active: z.boolean(),
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
        { message: "Some banner details need another look.", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { id, ...updates } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data: before } = await supabase
      .from("promotions")
      .select("theme")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("promotions")
      .update(updates)
      .eq("id", id);
    if (error) throw error;

    const previousImage = (before?.theme as { image?: string | null } | null)
      ?.image;
    if (previousImage && previousImage !== updates.theme.image) {
      try {
        await deleteProductImage(previousImage);
      } catch (storageError) {
        console.warn("Could not delete replaced banner image", storageError);
      }
    }

    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "promotion.update",
      entity: "promotion",
      entity_id: id,
      after: updates,
    });

    revalidatePath("/");
    revalidatePath("/admin/promotions");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Promotion update failed", error);
    return NextResponse.json(
      { message: "The banner could not be saved." },
      { status: 500 },
    );
  }
}
