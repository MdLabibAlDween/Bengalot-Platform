import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getIntegrationSecrets,
  getIntegrationsConfig,
} from "@/lib/admin/settings";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type SmsSendResult =
  | { ok: true; skipped?: boolean; providerId?: string }
  | { ok: false; error: string };

function normalizeBdPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) return `0${digits.slice(3)}`;
  if (digits.startsWith("0") && digits.length === 11) return digits;
  if (digits.startsWith("1") && digits.length === 10) return `0${digits}`;
  return digits;
}

async function logSms(
  admin: SupabaseClient,
  input: {
    to: string;
    provider: string;
    dedupeKey?: string;
    status: "sending" | "sent" | "failed" | "skipped";
    providerId?: string;
    error?: string;
  }
) {
  const payload = {
    dedupe_key: input.dedupeKey ?? null,
    to_phone: input.to,
    provider: input.provider,
    status: input.status,
    provider_message_id: input.providerId ?? null,
    error: input.error?.slice(0, 1000) ?? null,
  };
  if (input.dedupeKey) {
    const { data } = await admin
      .from("sms_deliveries")
      .select("id")
      .eq("dedupe_key", input.dedupeKey)
      .maybeSingle();
    if (data?.id) {
      await admin.from("sms_deliveries").update(payload).eq("id", data.id);
      return;
    }
  }
  await admin.from("sms_deliveries").insert(payload);
}

export async function sendSms(input: {
  to: string;
  message: string;
  dedupeKey?: string;
}): Promise<SmsSendResult> {
  const [config, secrets, admin] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecrets(),
    Promise.resolve(createAdminSupabaseClient()),
  ]);
  const sms = config.sms;
  if (!sms.enabled) {
    return { ok: true, skipped: true };
  }
  if (!admin) return { ok: false, error: "Storage is not configured." };
  const to = normalizeBdPhone(input.to);
  if (!/^01[3-9]\d{8}$/.test(to)) {
    return { ok: false, error: "Recipient phone is not a valid Bangladeshi mobile number." };
  }
  if (!sms.senderId.trim()) {
    return { ok: false, error: "SMS sender ID is not configured." };
  }
  if (!secrets.smsApiKey) {
    return { ok: false, error: "SMS API key is not configured." };
  }
  if (input.dedupeKey) {
    const { data: existing } = await admin
      .from("sms_deliveries")
      .select("status")
      .eq("dedupe_key", input.dedupeKey)
      .maybeSingle();
    if (existing && ["sending", "sent"].includes(existing.status)) {
      return { ok: true, skipped: true };
    }
  }

  try {
    if (sms.provider === "bulksmsbd") {
      const response = await fetch("https://bulksmsbd.net/api/smsapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: secrets.smsApiKey,
          type: "text",
          number: to,
          senderid: sms.senderId,
          message: input.message,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      const body = await response.text().catch(() => "");
      if (!response.ok) {
        const error = `BulkSMSBD responded ${response.status}: ${body.slice(0, 160)}`;
        await logSms(admin, {
          to,
          provider: "bulksmsbd",
          dedupeKey: input.dedupeKey,
          status: "failed",
          error,
        });
        return { ok: false, error };
      }
      await logSms(admin, {
        to,
        provider: "bulksmsbd",
        dedupeKey: input.dedupeKey,
        status: "sent",
      });
      return { ok: true };
    }

    if (!sms.apiUrl.trim()) {
      return { ok: false, error: "SMS API URL is not configured." };
    }
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (sms.authHeader.trim() && sms.authPrefix.trim()) {
      headers[sms.authHeader.trim()] = `${sms.authPrefix.trim()} ${secrets.smsApiKey}`;
    } else if (sms.authHeader.trim()) {
      headers[sms.authHeader.trim()] = secrets.smsApiKey;
    }
    const response = await fetch(sms.apiUrl.trim(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        to,
        message: input.message,
        senderId: sms.senderId,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const text = await response.text().catch(() => "");
    if (!response.ok) {
      const error = `SMS provider responded ${response.status}: ${text.slice(0, 160)}`;
      await logSms(admin, {
        to,
        provider: "generic",
        dedupeKey: input.dedupeKey,
        status: "failed",
        error,
      });
      return { ok: false, error };
    }
    let providerId: string | undefined;
    try {
      const body = JSON.parse(text) as { id?: string; message_id?: string };
      providerId = body.id ?? body.message_id;
    } catch {
      // Provider returned non-JSON; the HTTP 2xx is still a success.
    }
    await logSms(admin, {
      to,
      provider: "generic",
      dedupeKey: input.dedupeKey,
      status: "sent",
      providerId,
    });
    return { ok: true, providerId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send the SMS.";
    await logSms(admin, {
      to,
      provider: sms.provider,
      dedupeKey: input.dedupeKey,
      status: "failed",
      error: message,
    });
    return { ok: false, error: message.slice(0, 500) };
  }
}

export async function getSmsHealth() {
  const [config, secrets, admin] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecrets(),
    Promise.resolve(createAdminSupabaseClient()),
  ]);
  const recent = admin
    ? (await admin
        .from("sms_deliveries")
        .select("id,to_phone,provider,status,error,created_at")
        .order("created_at", { ascending: false })
        .limit(10)).data ?? []
    : [];
  return {
    enabled: config.sms.enabled,
    provider: config.sms.provider,
    senderId: config.sms.senderId,
    apiUrl: config.sms.apiUrl,
    apiKeySet: Boolean(secrets.smsApiKey),
    configured: Boolean(
      config.sms.enabled && config.sms.senderId && secrets.smsApiKey
    ),
    recent,
  };
}
