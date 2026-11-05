import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { saveIntegrationSecrets } from "@/lib/admin/settings";

export async function POST() {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;

  const token = crypto.randomBytes(32).toString("base64url");
  try {
    await saveIntegrationSecrets({ steadfastWebhookSecret: token });
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "steadfast_webhook_token_generated",
      entity: "integrations",
      entityId: "steadfast",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save the token." },
      { status: 400 }
    );
  }
  return NextResponse.json({
    ok: true,
    token,
    message:
      "Copy this token now and paste it into Steadfast → Webhook → Auth token. It will not be shown again.",
  });
}
