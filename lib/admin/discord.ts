import "server-only";

import {
  getIntegrationsConfig,
  getIntegrationSecrets,
  getSetting,
  saveSetting,
} from "@/lib/admin/settings";

export type DiscordEvent = {
  title: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  url?: string;
  event?: string;
};

export type DiscordDeliveryEntry = {
  at: string;
  event: string;
  title: string;
  sent: number;
  failed: number;
  skipped: boolean;
  errors: string[];
};

type WebhookResult = {
  ok: boolean;
  status?: number;
  error?: string;
};

export type DiscordSendResult = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: boolean;
  reason?: "disabled" | "no_webhooks";
  errors: string[];
  results: WebhookResult[];
};

const LOG_KEY = "discord_delivery_log";
const MAX_LOG_ENTRIES = 20;
const TIMEOUT_MS = 8000;

export function isDiscordWebhookUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    const allowedHosts = new Set([
      "discord.com",
      "discordapp.com",
      "canary.discord.com",
      "ptb.discord.com",
    ]);
    if (!allowedHosts.has(host)) return false;
    return /^\/api\/webhooks\/\d+\/[\w.-]+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

function discordErrorMessage(status: number, body: string) {
  let detail = "";
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: string };
    detail = parsed.message ?? parsed.error ?? "";
  } catch {
    detail = body.trim();
  }
  detail = detail.replace(/\s+/g, " ").slice(0, 200);
  return `Discord responded ${status}${detail ? `: ${detail}` : ""}`;
}

async function deliver(
  webhook: string,
  payload: unknown
): Promise<WebhookResult> {
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        status: response.status,
        error: discordErrorMessage(response.status, body),
      };
    }
    return { ok: true, status: response.status };
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        ok: false,
        error: `Discord did not respond within ${TIMEOUT_MS / 1000} seconds.`,
      };
    }
    return {
      ok: false,
      error:
        error instanceof Error && error.message
          ? `Could not reach Discord: ${error.message}`
          : "Could not reach Discord.",
    };
  }
}

async function appendDeliveryLog(entry: DiscordDeliveryEntry) {
  try {
    const current = await getSetting<DiscordDeliveryEntry[]>(LOG_KEY, []);
    const list = Array.isArray(current) ? current : [];
    await saveSetting(LOG_KEY, [entry, ...list].slice(0, MAX_LOG_ENTRIES), false);
  } catch {
    // Delivery logging must never break checkout or order updates.
  }
}

export async function getDiscordDeliveryLog() {
  const log = await getSetting<DiscordDeliveryEntry[]>(LOG_KEY, []);
  return Array.isArray(log) ? log : [];
}

export async function sendDiscordAlert(
  event: DiscordEvent,
  options?: { urls?: string[]; requireEnabled?: boolean; source?: string }
): Promise<DiscordSendResult> {
  const [config, secrets] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecrets(),
  ]);

  const requireEnabled = options?.requireEnabled ?? true;
  const urls = (options?.urls ?? secrets.discordWebhookUrls ?? [])
    .map((url) => url.trim())
    .filter(Boolean);

  if (requireEnabled && !config.discord.enabled) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: true,
      reason: "disabled",
      errors: [],
      results: [],
    };
  }

  if (urls.length === 0) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: true,
      reason: "no_webhooks",
      errors: [],
      results: [],
    };
  }

  const embed = {
    title: event.title.slice(0, 256),
    description: event.description?.slice(0, 4000),
    color: event.color ?? 0x3b2a8c,
    fields: event.fields?.slice(0, 25).map((field) => ({
      ...field,
      name: field.name.slice(0, 256),
      value: field.value.slice(0, 1024),
    })),
    url: event.url,
    timestamp: new Date().toISOString(),
    footer: { text: "Bengalot admin alerts" },
  };

  const results = await Promise.all(
    urls.map(async (webhook, index) => {
      if (!isDiscordWebhookUrl(webhook)) {
        return {
          ok: false,
          error: `Webhook ${index + 1} is not a valid Discord webhook URL.`,
        };
      }
      return deliver(webhook, {
        username: "Bengalot",
        embeds: [embed],
        // Never allow webhook content to ping @everyone or roles.
        allowed_mentions: { parse: [] },
      });
    })
  );

  const sent = results.filter((result) => result.ok).length;
  const failed = results.length - sent;
  const errors = results
    .filter((result): result is WebhookResult & { error: string } =>
      Boolean(result.error)
    )
    .map((result) => result.error);

  const source = options?.source ?? "alert";
  if (source === "test" || results.length > 0) {
    await appendDeliveryLog({
      at: new Date().toISOString(),
      event: event.event ?? source,
      title: event.title,
      sent,
      failed,
      skipped: false,
      errors,
    });
  }

  return {
    attempted: results.length,
    sent,
    failed,
    skipped: false,
    errors,
    results,
  };
}

export async function sendDiscordTest(urls?: string[]) {
  return sendDiscordAlert(
    {
      title: "Bengalot test alert",
      description:
        "If you can read this, your Discord webhook is connected. Order alerts will arrive here.",
      color: 0x2e7d5b,
      event: "test",
      fields: [
        { name: "Store", value: "Bengalot", inline: true },
        { name: "Status", value: "Connected", inline: true },
      ],
    },
    { urls, requireEnabled: false, source: "test" }
  );
}

export async function getDiscordStatus() {
  const [config, secrets, log] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecrets(),
    getDiscordDeliveryLog(),
  ]);
  return {
    enabled: config.discord.enabled,
    webhookCount: secrets.discordWebhookUrls?.length ?? 0,
    lastDelivery: log[0] ?? null,
  };
}
