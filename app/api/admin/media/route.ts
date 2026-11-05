import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { getMediaSlots } from "@/lib/admin/settings";

const updateSchema = z.object({
  id: z.string().uuid(),
  url: z.string().trim().max(2000).nullable(),
  alt: z.string().trim().max(240).nullable(),
  is_active: z.boolean(),
});

const createSchema = z.object({
  slot_key: z.string().trim().min(2).max(120).regex(/^[a-z0-9._-]+$/i),
  label: z.string().trim().min(2).max(120),
  group_label: z.string().trim().min(2).max(80),
  url: z.string().trim().max(2000).nullable().optional(),
  alt: z.string().trim().max(240).nullable().optional(),
  sort: z.number().int().min(0).max(9999).optional(),
});

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  return NextResponse.json({ media: await getMediaSlots() });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => null) as { action?: string } | null;
  if (!body?.action) return badRequest("Missing action.");

  if (body.action === "update") {
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid media update.");
    const { error } = await auth.admin
      .from("admin_media")
      .update({
        url: parsed.data.url || null,
        alt: parsed.data.alt || null,
        is_active: parsed.data.is_active,
      })
      .eq("id", parsed.data.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "media_updated",
      entity: "admin_media",
      entityId: parsed.data.id,
      after: parsed.data,
    });
    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/admin/media");
    return NextResponse.json({ ok: true });
  }

  if (body.action === "create") {
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid media slot.");
    const { data, error } = await auth.admin
      .from("admin_media")
      .insert({
        slot_key: parsed.data.slot_key,
        label: parsed.data.label,
        group_label: parsed.data.group_label,
        url: parsed.data.url || null,
        alt: parsed.data.alt || null,
        sort: parsed.data.sort ?? 100,
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "media_created",
      entity: "admin_media",
      entityId: data.id,
      after: data,
    });
    revalidatePath("/admin/media");
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, media: data });
  }

  return badRequest("Unknown action.");
}
