import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";

const schema = z.object({
  id: z.string().uuid(),
  role: z.enum(["customer", "super_admin", "manager", "order_staff", "content_editor", "support"]),
});

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin"]);
  if ("error" in auth) return auth.error;
  const { data, error } = await auth.admin
    .from("profiles")
    .select("id,email,full_name,role,is_blacklisted,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ staff: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin"]);
  if ("error" in auth) return auth.error;
  if (auth.context.profile.role !== "super_admin") {
    return NextResponse.json({ error: "Only a super admin can change roles." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid role change.");
  if (parsed.data.role === "super_admin") {
    return NextResponse.json(
      { error: "Super Admin is managed in Supabase Authentication, not from the app." },
      { status: 403 }
    );
  }
  if (parsed.data.id === auth.context.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role from the app." },
      { status: 400 }
    );
  }
  const { data: target } = await auth.admin
    .from("profiles")
    .select("role")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (target?.role === "super_admin") {
    return NextResponse.json(
      { error: "A Super Admin account can only be changed in Supabase Authentication." },
      { status: 403 }
    );
  }

  const { data: targetAuth, error: targetAuthError } = await auth.admin.auth.admin.getUserById(
    parsed.data.id
  );
  if (targetAuthError || !targetAuth.user) {
    return NextResponse.json({ error: "Staff account not found." }, { status: 404 });
  }
  const targetTrustedRole = targetAuth.user.app_metadata?.role;
  if (targetTrustedRole === "super_admin" || targetTrustedRole === "admin") {
    return NextResponse.json(
      { error: "A Super Admin account can only be changed in Supabase Authentication." },
      { status: 403 }
    );
  }

  // Authorization lives in Auth app_metadata because users can edit profiles.
  const previousAppMetadata = targetAuth.user.app_metadata ?? {};
  const nextAppMetadata = { ...previousAppMetadata, role: parsed.data.role };
  const { error: metadataError } = await auth.admin.auth.admin.updateUserById(
    parsed.data.id,
    { app_metadata: nextAppMetadata }
  );
  if (metadataError) {
    return NextResponse.json({ error: metadataError.message }, { status: 400 });
  }

  const { data, error } = await auth.admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.id)
    .select("id,email,full_name,role")
    .single();
  if (error) {
    try {
      await auth.admin.auth.admin.updateUserById(parsed.data.id, {
        app_metadata: previousAppMetadata,
      });
    } catch {
      // Best-effort rollback; the profile remains unchanged.
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: "staff_role_updated",
    entity: "profiles",
    entityId: parsed.data.id,
    after: { profile: data, app_metadata_role: parsed.data.role },
  });
  revalidatePath("/admin/staff");
  return NextResponse.json({ ok: true, profile: data });
}
