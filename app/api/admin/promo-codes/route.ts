import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import {
  normalisePromoCodes,
  PROMO_SETTINGS_KEY,
  savePromoCodes,
} from "@/lib/promos";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const promoCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Use letters, numbers, - or _."),
  description: z.string().trim().max(160).default(""),
  type: z.enum(["percent", "fixed"]),
  value: z.number().int().min(1).max(100_000),
  minSubtotal: z.number().int().min(0).max(10_000_000).default(0),
  maxDiscount: z.number().int().min(0).max(10_000_000).nullable().optional(),
  active: z.boolean().default(true),
  expiresAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  productSlugs: z.array(z.string().trim().min(1).max(140)).max(50).optional(),
});

const schema = z.array(promoCodeSchema).max(50);

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
          message: "Some promo code details need another look.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const percentOverLimit = parsed.data.find(
      (promo) => promo.type === "percent" && promo.value > 100,
    );
    if (percentOverLimit) {
      return NextResponse.json(
        { message: "Percentage discounts cannot be above 100%." },
        { status: 400 },
      );
    }

    const promoCodeValue = parsed.data.map((promo) => ({
      ...promo,
      code: promo.code.toUpperCase(),
      maxDiscount:
        promo.type === "percent" ? (promo.maxDiscount ?? null) : null,
      expiresAt: promo.expiresAt || null,
    }));

    const codes = normalisePromoCodes(promoCodeValue);
    await savePromoCodes(codes);

    const supabase = createSupabaseAdminClient();
    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "promo_codes.update",
      entity: "site_settings",
      entity_id: PROMO_SETTINGS_KEY,
      after: codes,
    });

    revalidatePath("/admin/promo-codes");
    revalidatePath("/checkout");

    return NextResponse.json({ ok: true, codes });
  } catch (error) {
    console.error("Promo code update failed", error);
    return NextResponse.json(
      { message: "The promo codes could not be saved." },
      { status: 500 },
    );
  }
}
