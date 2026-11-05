import { AdminPageHeader } from "@/components/admin/admin-ui";
import { IntegrationsManager } from "@/components/admin/integrations-manager";
import { getIntegrationsConfig, getIntegrationSecretStatus } from "@/lib/admin/settings";
import { getDiscordStatus } from "@/lib/admin/discord";
import { getSteadfastHealth } from "@/lib/steadfast";
import { getEmailHealth } from "@/lib/email";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { headers } from "next/headers";

export default async function AdminIntegrationsPage() {
  await requireAdminPageRole(["super_admin"]);
  const [config, secretStatus, discordStatus, steadfastHealth, emailHealth, requestHeaders] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecretStatus(),
    getDiscordStatus(),
    getSteadfastHealth(),
    getEmailHealth(),
    headers(),
  ]);
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const proto =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const webhookUrl = `${proto}://${host}/api/webhooks/steadfast`;
  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="Integrations"
        description="Connect SMTP, SMS, Steadfast, bKash, Tawk.to and Discord from the panel. Secrets are encrypted and never returned to the browser."
      />
      <IntegrationsManager
        initial={config}
        secretStatus={secretStatus}
        discordStatus={discordStatus}
        steadfastHealth={steadfastHealth}
        emailHealth={emailHealth}
        webhookUrl={webhookUrl}
      />
    </div>
  );
}
