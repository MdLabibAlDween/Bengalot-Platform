import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminRoleApi, badRequest } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { getAllSettings, saveSetting } from "@/lib/admin/settings";

const allowed = new Set([
  "store_profile",
  "feature_flags",
  "page_visibility",
  "gift_card_settings",
  "homepage_control",
  "invoice_settings",
  "seo_settings",
  "delivery",
  "site_content",
]);

const publicKeys = new Set([
  "store_profile",
  "feature_flags",
  "page_visibility",
  "gift_card_settings",
  "homepage_control",
  "seo_settings",
  "delivery",
  "site_content",
]);

const schema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;
  const settings = (await getAllSettings()).filter(
    (row) => row.key !== "integration_secrets" && row.key !== "integrations_config"
  );
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid settings payload.");
  const { key, value } = parsed.data;
  if (!allowed.has(key)) return badRequest("That setting is not editable here.");

  const beforeRows = await getAllSettings();
  const before = beforeRows.find((row) => row.key === key)?.value ?? null;

  try {
    await saveSetting(key, value, publicKeys.has(key));
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "setting_updated",
      entity: "settings",
      entityId: key,
      before,
      after: value,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save the setting." },
      { status: 400 }
    );
  }

  revalidatePath("/");
  revalidatePath("/gift-cards");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath(`/admin/${key === "gift_card_settings" ? "gift-cards" : "settings"}`);

  return NextResponse.json({ ok: true });
}
