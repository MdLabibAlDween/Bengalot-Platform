import { NextResponse } from "next/server";
import { requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { sendTestEmail, verifySmtpConnection } from "@/lib/email";

export async function POST() {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;
  const to = auth.context.profile.email ?? auth.context.user.email;
  if (!to) {
    return NextResponse.json(
      { error: "This staff account has no email address to send the test to." },
      { status: 400 }
    );
  }

  const verified = await verifySmtpConnection();
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }
  const sent = await sendTestEmail(to);
  if (!sent.ok) {
    return NextResponse.json({ error: sent.error }, { status: 400 });
  }
  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: "smtp_test_sent",
    entity: "integrations",
    entityId: "smtp",
    after: { to, host: verified.host, port: verified.port },
  });
  return NextResponse.json({
    ok: true,
    message: `SMTP verified and a test email was sent to ${to}.`,
  });
}
