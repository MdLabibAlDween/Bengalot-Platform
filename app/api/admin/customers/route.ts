import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";

const schema = z.object({ id: z.string().uuid(), is_blacklisted: z.boolean() });

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "support"]);
  if ("error" in auth) return auth.error;
  if (!["super_admin", "manager"].includes(auth.context.profile.role)) {
    return NextResponse.json({ error: "Only a manager or super admin can block customers." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid customer update.");
  const { data, error } = await auth.admin
    .from("profiles")
    .update({ is_blacklisted: parsed.data.is_blacklisted })
    .eq("id", parsed.data.id)
    .select("id,email,is_blacklisted")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Block sign-in for blacklisted customers as well as guest checkout.
  try {
    await auth.admin.auth.admin.updateUserById(parsed.data.id, {
      ban_duration: parsed.data.is_blacklisted ? "876000h" : "none",
    });
  } catch {
    // The profile flag still blocks checkout if Auth ban cannot be applied.
  }

  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: parsed.data.is_blacklisted ? "customer_blocked" : "customer_unblocked",
    entity: "profiles",
    entityId: parsed.data.id,
    after: data,
  });
  revalidatePath("/admin/customers");
  return NextResponse.json({ ok: true, customer: data });
}
