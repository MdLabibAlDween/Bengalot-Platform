import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { notifyProfile } from "@/lib/account-db";

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "support"]);
  if ("error" in auth) return auth.error;
  const [contact, support, newsletter, returns] = await Promise.all([
    auth.admin.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200),
    auth.admin.from("support_messages").select("*").order("created_at", { ascending: false }).limit(200),
    auth.admin.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(500),
    auth.admin.from("return_requests").select("*").order("created_at", { ascending: false }).limit(200),
  ]);
  return NextResponse.json({
    contact: contact.data ?? [],
    support: support.data ?? [],
    newsletter: newsletter.data ?? [],
    returns: returns.data ?? [],
  });
}

const updateSchema = z.object({
  kind: z.enum(["contact", "support", "return", "newsletter"]),
  id: z.string().uuid(),
  status: z.string().trim().min(1).max(40),
  note: z.string().trim().max(1000).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "support"]);
  if ("error" in auth) return auth.error;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid inbox update.");
  const table =
    parsed.data.kind === "contact"
      ? "contact_messages"
      : parsed.data.kind === "support"
        ? "support_messages"
        : parsed.data.kind === "return"
          ? "return_requests"
          : "newsletter_subscribers";
  const patch =
    parsed.data.kind === "newsletter"
      ? { status: parsed.data.status }
      : { status: parsed.data.status, admin_note: parsed.data.note || null };
  const { data, error } = await auth.admin
    .from(table)
    .update(patch)
    .eq("id", parsed.data.id)
    .select("id,status,profile_id,subject,order_no")
    .single();
  if (error) return badRequest(error.message);
  if (
    data &&
    (parsed.data.kind === "support" || parsed.data.kind === "return") &&
    "profile_id" in data &&
    data.profile_id
  ) {
    const label = parsed.data.kind === "support" ? "support message" : "return request";
    await notifyProfile(auth.admin, String(data.profile_id), {
      kind: "account",
      title:
        parsed.data.status === "replied" || parsed.data.status === "approved"
          ? `Your ${label} was updated`
          : `Your ${label} is now ${parsed.data.status.replace(/_/g, " ")}`,
      body:
        parsed.data.note ||
        ("subject" in data && data.subject
          ? `“${data.subject}” · ${parsed.data.status}`
          : `Status: ${parsed.data.status}`),
      href: parsed.data.kind === "support" ? "/account/support" : "/account/returns",
      dedupeKey: `${parsed.data.kind}:${data.id}:${parsed.data.status}`,
    });
  }
  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: `${parsed.data.kind}_inbox_updated`,
    entity: table,
    entityId: parsed.data.id,
    after: data,
  });
  revalidatePath("/admin/inbox");
  return NextResponse.json({ ok: true, row: data });
}
