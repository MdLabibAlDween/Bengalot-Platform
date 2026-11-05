import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import {
  getIntegrationsConfig,
  getIntegrationSecretStatus,
  saveIntegrationSecrets,
  saveSetting,
} from "@/lib/admin/settings";

const schema = z.object({
  config: z.record(z.string(), z.unknown()),
  secrets: z
    .object({
      smtpPassword: z.string().max(500).optional(),
      smsApiKey: z.string().max(500).optional(),
      steadfastApiKey: z.string().max(500).optional(),
      steadfastSecretKey: z.string().max(500).optional(),
      steadfastWebhookSecret: z.string().max(500).optional(),
      bkashAppKey: z.string().max(500).optional(),
      bkashAppSecret: z.string().max(500).optional(),
      bkashUsername: z.string().max(500).optional(),
      bkashPassword: z.string().max(500).optional(),
      discordWebhookUrls: z.array(z.string().url()).max(20).optional(),
    })
    .optional(),
});

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin"]);
  if ("error" in auth) return auth.error;
  return NextResponse.json({
    config: await getIntegrationsConfig(),
    secrets: await getIntegrationSecretStatus(),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin"]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid integration payload.");

  try {
    await saveSetting("integrations_config", parsed.data.config, false);
    if (parsed.data.secrets) {
      await saveIntegrationSecrets(parsed.data.secrets);
    }
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "integrations_updated",
      entity: "settings",
      entityId: "integrations_config",
      after: {
        ...parsed.data.config,
        secrets: parsed.data.secrets
          ? Object.fromEntries(Object.keys(parsed.data.secrets).map((key) => [key, "updated"]))
          : "unchanged",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save integrations." },
      { status: 400 }
    );
  }

  revalidatePath("/admin/integrations");
  revalidatePath("/register");
  revalidatePath("/login");
  revalidatePath("/forgot-password");
  return NextResponse.json({ ok: true });
}
