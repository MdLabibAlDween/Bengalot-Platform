import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { getRedirects } from "@/lib/admin/settings";

const values = {
  source_path: z.string().trim().min(1).max(500).startsWith("/"),
  destination_url: z.string().trim().min(1).max(2000),
  status_code: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]),
  enabled: z.boolean(),
  note: z.string().trim().max(240).nullable().optional(),
  sort: z.number().int().min(0).max(99999).optional(),
};

const createSchema = z.object(values);
const updateSchema = z.object({ id: z.string().uuid(), ...values });

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  return NextResponse.json({ redirects: await getRedirects() });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return badRequest("Invalid redirect payload.");

  if (body.action === "create") {
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return badRequest("Check the source path, destination and status code.");
    const { data, error } = await auth.admin.from("admin_redirects").insert(parsed.data).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "redirect_created",
      entity: "admin_redirects",
      entityId: data.id,
      after: data,
    });
    revalidatePath("/admin/redirects");
    return NextResponse.json({ ok: true, redirect: data });
  }

  if (body.action === "update") {
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Check the redirect values.");
    const { id, ...patch } = parsed.data;
    const { data, error } = await auth.admin.from("admin_redirects").update(patch).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "redirect_updated",
      entity: "admin_redirects",
      entityId: id,
      after: data,
    });
    revalidatePath("/admin/redirects");
    return NextResponse.json({ ok: true, redirect: data });
  }

  if (body.action === "delete") {
    const id = z.string().uuid().safeParse(body.id);
    if (!id.success) return badRequest("Invalid redirect id.");
    const { error } = await auth.admin.from("admin_redirects").delete().eq("id", id.data);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "redirect_deleted",
      entity: "admin_redirects",
      entityId: id.data,
    });
    revalidatePath("/admin/redirects");
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reorder") {
    const parsed = z.array(z.object({ id: z.string().uuid(), sort: z.number().int().min(0) })).safeParse(body.items);
    if (!parsed.success) return badRequest("Invalid redirect order.");
    await Promise.all(
      parsed.data.map((item) =>
        auth.admin.from("admin_redirects").update({ sort: item.sort }).eq("id", item.id)
      )
    );
    revalidatePath("/admin/redirects");
    return NextResponse.json({ ok: true });
  }

  return badRequest("Unknown action.");
}
