import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { getIntegrationSecrets } from "@/lib/admin/settings";
import { isDiscordWebhookUrl, sendDiscordTest } from "@/lib/admin/discord";

const schema = z.object({
  urls: z.array(z.string().url()).max(20).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin"]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return badRequest("Invalid webhook URLs.");

  const supplied = (parsed.data.urls ?? []).map((url) => url.trim()).filter(Boolean);
  const urls =
    supplied.length > 0
      ? supplied
      : (await getIntegrationSecrets()).discordWebhookUrls ?? [];

  if (urls.length === 0) {
    return badRequest("Add a Discord webhook URL first, then send a test.");
  }

  const invalid = urls.filter((url) => !isDiscordWebhookUrl(url));
  if (invalid.length === urls.length) {
    return badRequest(
      "That is not a Discord webhook URL. It should look like https://discord.com/api/webhooks/…"
    );
  }

  const result = await sendDiscordTest(urls);

  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: "discord_test_sent",
    entity: "settings",
    entityId: "integrations_config",
    after: {
      attempted: result.attempted,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors,
    },
  });

  return NextResponse.json({
    ok: result.sent > 0 && result.failed === 0,
    ...result,
  });
}
