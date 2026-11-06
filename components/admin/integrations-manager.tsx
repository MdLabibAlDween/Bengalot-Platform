"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Music2,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Truck,
  Webhook,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { EmailText } from "@/components/site/email-display";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { IntegrationsConfig } from "@/lib/admin/settings";

type SecretStatus = Record<string, boolean>;

type DeliveryEntry = {
  at: string;
  event: string;
  title: string;
  sent: number;
  failed: number;
  skipped: boolean;
  errors: string[];
};

type DiscordStatus = {
  enabled: boolean;
  webhookCount: number;
  lastDelivery: DeliveryEntry | null;
};

type TestResult = {
  ok: boolean;
  message: string;
  errors: string[];
};

const card =
  "rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]";

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  })} (Dhaka)`;
}

export function IntegrationsManager({
  initial,
  secretStatus,
  discordStatus,
  steadfastHealth,
  emailHealth,
  webhookUrl,
}: {
  initial: IntegrationsConfig;
  secretStatus: SecretStatus;
  discordStatus: DiscordStatus;
  steadfastHealth: {
    configured: boolean;
    enabled: boolean;
    autoBookOnConfirmed: boolean;
    webhookRequireSignature: boolean;
    apiKeySet: boolean;
    secretKeySet: boolean;
    webhookTokenSet: boolean;
  };
  emailHealth: {
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    username: string;
    passwordSet: boolean;
    configured: boolean;
    recent: {
      id: string;
      to_email: string;
      subject: string;
      kind: string;
      status: string;
      error: string | null;
      created_at: string;
    }[];
  };
  webhookUrl: string;
}) {
  const router = useRouter();
  const [config, setConfig] = useState(initial);
  const [secrets, setSecrets] = useState({
    smtpPassword: "",
    smsApiKey: "",
    steadfastApiKey: "",
    steadfastSecretKey: "",
    steadfastWebhookSecret: "",
    bkashAppKey: "",
    bkashAppSecret: "",
    bkashUsername: "",
    bkashPassword: "",
    discordWebhooks: "",
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [steadfastTesting, setSteadfastTesting] = useState(false);
  const [steadfastTest, setSteadfastTest] = useState<TestResult | null>(null);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTest, setSmtpTest] = useState<TestResult | null>(null);
  const [generatedSteadfastToken, setGeneratedSteadfastToken] = useState<string | null>(null);

  const splitWebhooks = (value: string) =>
    value
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const setConfigValue = (path: string, value: unknown) => {
    setConfig((current) => {
      const next = structuredClone(current) as Record<string, unknown>;
      const keys = path.split(".");
      let cursor = next;
      for (let index = 0; index < keys.length - 1; index += 1) {
        cursor = cursor[keys[index]] as Record<string, unknown>;
      }
      cursor[keys[keys.length - 1]] = value;
      return next as unknown as IntegrationsConfig;
    });
  };

  const save = async () => {
    setSaving(true);
    const addingDiscordWebhook = secrets.discordWebhooks.trim().length > 0;
    const payloadSecrets = Object.fromEntries(
      Object.entries(secrets)
        .filter(([, value]) => value.trim())
        .map(([key, value]) => [
          key === "discordWebhooks" ? "discordWebhookUrls" : key,
          key === "discordWebhooks" ? splitWebhooks(value) : value.trim(),
        ])
    );
    // Adding a webhook is a clear signal that alerts should run; avoid the
    // silent "saved but disabled" trap.
    const nextConfig =
      addingDiscordWebhook
        ? { ...config, discord: { ...config.discord, enabled: true } }
        : config;
    if (nextConfig !== config) setConfig(nextConfig);

    const response = await fetch("/api/admin/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: nextConfig, secrets: payloadSecrets }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save integrations.");
      return;
    }
    setSecrets({
      smtpPassword: "",
      smsApiKey: "",
      steadfastApiKey: "",
      steadfastSecretKey: "",
      steadfastWebhookSecret: "",
      bkashAppKey: "",
      bkashAppSecret: "",
      bkashUsername: "",
      bkashPassword: "",
      discordWebhooks: "",
    });
    toast.success(
      addingDiscordWebhook
        ? "Saved — Discord alerts are now enabled"
        : "Integrations saved"
    );
    router.refresh();
  };

  const testDiscord = async () => {
    setTesting(true);
    setTestResult(null);
    const typedUrls = splitWebhooks(secrets.discordWebhooks);
    const response = await fetch("/api/admin/integrations/discord/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(typedUrls.length > 0 ? { urls: typedUrls } : {}),
    });
    const result = await response.json().catch(() => ({}));
    setTesting(false);

    if (!response.ok) {
      const message = result.error ?? "Could not send the test alert.";
      setTestResult({ ok: false, message, errors: [] });
      toast.error(message);
      return;
    }

    const errors: string[] = Array.isArray(result.errors) ? result.errors : [];
    const baseMessage =
      result.sent > 0
        ? `Test delivered to ${result.sent} webhook${result.sent === 1 ? "" : "s"}${
            result.failed ? `, ${result.failed} failed` : ""
          }.`
        : "The test was not delivered.";
    const suffix =
      typedUrls.length > 0
        ? " Save integrations to activate automatic alerts."
        : !discordStatus.enabled
          ? " Alerts are currently off — tick Enabled and save."
          : "";
    const message = `${baseMessage}${suffix}`;
    setTestResult({ ok: Boolean(result.ok), message, errors });
    if (result.ok) toast.success(message);
    else toast.error(message);
    router.refresh();
  };

  const testSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTest(null);
    const response = await fetch("/api/admin/integrations/smtp/test", {
      method: "POST",
    });
    const result = await response.json().catch(() => ({}));
    setSmtpTesting(false);
    const message = response.ok
      ? result.message ?? "SMTP verified and test email sent."
      : result.error ?? "Could not verify SMTP.";
    setSmtpTest({ ok: response.ok, message, errors: [] });
    if (response.ok) toast.success(message);
    else toast.error(message);
    router.refresh();
  };

  const testSteadfast = async () => {    setSteadfastTesting(true);
    setSteadfastTest(null);
    const response = await fetch("/api/admin/integrations/steadfast/test", {
      method: "POST",
    });
    const result = await response.json().catch(() => ({}));
    setSteadfastTesting(false);
    const message = response.ok
      ? result.message ?? "Steadfast connection is working."
      : result.error ?? "Could not reach Steadfast.";
    setSteadfastTest({ ok: response.ok, message, errors: [] });
    if (response.ok) toast.success(message);
    else toast.error(message);
    router.refresh();
  };

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied");
    } catch {
      toast.error(webhookUrl);
    }
  };

  const generateSteadfastToken = async () => {
    if (
      secretStatus.steadfastWebhookSecret &&
      !window.confirm(
        "Replace the saved webhook auth token? Any Steadfast webhook using the old token will fail until you update it there."
      )
    ) {
      return;
    }
    setSteadfastTesting(true);
    const response = await fetch("/api/admin/integrations/steadfast/token", {
      method: "POST",
    });
    const result = await response.json().catch(() => ({}));
    setSteadfastTesting(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not generate a webhook token.");
      return;
    }
    setGeneratedSteadfastToken(result.token);
    setSecrets((current) => ({ ...current, steadfastWebhookSecret: "" }));
    toast.success("Webhook token generated", {
      description: "Copy it now and paste it into Steadfast. It will not be shown again.",
    });
    router.refresh();
  };

  const copyGeneratedToken = async () => {
    if (!generatedSteadfastToken) return;
    try {
      await navigator.clipboard.writeText(generatedSteadfastToken);
      toast.success("Webhook token copied");
    } catch {
      toast.error("Could not copy. Select the token and copy it manually.");
    }
  };

  const clearDiscord = async () => {
    if (!window.confirm("Remove the saved Discord webhook URLs?")) return;
    setSaving(true);
    const nextConfig = { ...config, discord: { ...config.discord, enabled: false } };
    const response = await fetch("/api/admin/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: nextConfig,
        secrets: { discordWebhookUrls: [] },
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not remove the webhooks.");
      return;
    }
    setConfig(nextConfig);
    setTestResult(null);
    toast.success("Discord webhooks removed");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-gold/25 bg-gold/[0.05] p-4 text-[0.66rem] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mr-1.5 inline h-4 w-4 text-gold-ink" />
        Secrets are encrypted with AES-256-GCM before they are written to Supabase. Existing
        secret values are never returned to the browser; leave a field blank to keep the saved
        value.
      </div>

      <section className={card}>
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo/10 text-indigo">
            <Mail className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl">Purelymail SMTP</h2>
            <p className="text-[0.6rem] text-muted-foreground">
              Order email and invoice sender. Supabase Auth confirmation emails use the SMTP
              settings in the Supabase server .env, not this field.
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em] ${
                emailHealth.configured ? "bg-jade/10 text-jade" : "bg-saffron/15 text-gold-ink"
              }`}
            >
              {emailHealth.configured ? "Ready" : "Needs setup"}
            </span>
            <label className="flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              <input
                type="checkbox"
                checked={config.smtp.enabled}
                onChange={(event) => setConfigValue("smtp.enabled", event.target.checked)}
                className="h-4 w-4 accent-[var(--color-indigo)]"
              />
              Enabled
            </label>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>SMTP host</Label>
            <Input value={config.smtp.host} onChange={(event) => setConfigValue("smtp.host", event.target.value)} placeholder="mail.purelymail.com" />
          </div>
          <div>
            <Label>Port</Label>
            <Input type="number" value={config.smtp.port} onChange={(event) => setConfigValue("smtp.port", Number(event.target.value))} />
          </div>
          <div>
            <Label>From name</Label>
            <Input value={config.smtp.fromName} onChange={(event) => setConfigValue("smtp.fromName", event.target.value)} />
          </div>
          <div>
            <Label>SMTP username / email</Label>
            <Input
              type="email"
              value={config.smtp.username ?? ""}
              onChange={(event) => setConfigValue("smtp.username", event.target.value)}
              placeholder="name@domain.com"
              autoComplete="username"
            />
            <p className="mt-1 text-[0.56rem] text-muted-foreground">
              Use the full email address, e.g.{" "}
              <EmailText email="info@bengalot.com" fallback="the outgoing email address" />.
            </p>
          </div>
          <div>
            <Label>Password {secretStatus.smtpPassword && <span className="text-jade">(configured)</span>}</Label>
            <Input type="password" value={secrets.smtpPassword} onChange={(event) => setSecrets({ ...secrets, smtpPassword: event.target.value })} placeholder={secretStatus.smtpPassword ? "••••••••" : "SMTP password"} />
          </div>
          <label className="flex items-center gap-2 text-[0.66rem]">
            <input type="checkbox" checked={config.smtp.secure} onChange={(event) => setConfigValue("smtp.secure", event.target.checked)} className="h-4 w-4 accent-[var(--color-indigo)]" />
            Use TLS/SSL
          </label>
          <label className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] px-3.5 py-3 sm:col-span-2">
            <span>
              <span className="block text-[0.66rem] font-semibold">
                Supabase Auth email is configured
              </span>
              <span className="mt-0.5 block text-[0.56rem] leading-relaxed text-muted-foreground">
                This is separate from the app sender above. Turn it on only after adding SMTP
                to the Supabase server `.env` and testing a signup/reset email. Until then,
                registration and password reset stay disabled.
              </span>
            </span>
            <input
              type="checkbox"
              checked={config.authEmailReady}
              onChange={(event) => setConfigValue("authEmailReady", event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-indigo)]"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={testSmtp} disabled={smtpTesting}>
            {smtpTesting ? "Testing…" : "Verify & send test email"}
          </Button>
          <span className="text-[0.56rem] text-muted-foreground">
            Sends only to the signed-in owner, never to customers.
          </span>
        </div>
        {smtpTest && (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-[0.62rem] ${
              smtpTest.ok ? "bg-jade/10 text-jade" : "bg-rosewood/10 text-rosewood"
            }`}
          >
            {smtpTest.message}
          </p>
        )}

        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Recent email deliveries
            </p>
            <span className="text-[0.52rem] text-muted-foreground">{emailHealth.recent.length} shown</span>
          </div>
          {emailHealth.recent.length === 0 ? (
            <p className="mt-2 text-[0.6rem] text-muted-foreground">
              No app emails have been sent yet. Order confirmations, status updates and
              invoice emails will be logged here.
            </p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {emailHealth.recent.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-[0.58rem]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.subject}</p>
                    <p className="truncate text-[0.52rem] text-muted-foreground">
                      {entry.to_email} · {entry.kind}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[0.42rem] font-bold uppercase tracking-[0.08em] ${
                      entry.status === "sent"
                        ? "bg-jade/10 text-jade"
                        : entry.status === "failed"
                          ? "bg-rosewood/10 text-rosewood"
                          : "bg-[var(--muted)] text-muted-foreground"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={card}>
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-teal/10 text-teal">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl">SMS provider</h2>
            <p className="text-[0.6rem] text-muted-foreground">
              Provider-neutral adapter. Disabled by default — email remains the only live
              notification channel for now.
            </p>
          </div>
          <label className="ml-auto flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            <input type="checkbox" checked={config.sms.enabled} onChange={(event) => setConfigValue("sms.enabled", event.target.checked)} className="h-4 w-4 accent-[var(--color-indigo)]" />
            Enabled
          </label>
        </div>
        <div className="mt-4 rounded-xl border border-saffron/30 bg-saffron/[0.05] p-3 text-[0.6rem] leading-relaxed text-muted-foreground">
          SMS is intentionally off. Orders, status updates and invoices are sent by email only.
          Phone numbers are still collected on every order and remain required for delivery.
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Provider</Label>
            <Select value={config.sms.provider} onChange={(event) => setConfigValue("sms.provider", event.target.value)}>
              <option value="generic">Generic HTTP (JSON)</option>
              <option value="bulksmsbd">BulkSMSBD</option>
            </Select>
          </div>
          <div>
            <Label>Sender ID</Label>
            <Input value={config.sms.senderId} onChange={(event) => setConfigValue("sms.senderId", event.target.value)} placeholder="Your approved sender ID" />
          </div>
          <div>
            <Label>API key {secretStatus.smsApiKey && <span className="text-jade">(configured)</span>}</Label>
            <Input type="password" value={secrets.smsApiKey} onChange={(event) => setSecrets({ ...secrets, smsApiKey: event.target.value })} placeholder={secretStatus.smsApiKey ? "••••••••" : "API key"} />
          </div>
          {config.sms.provider === "generic" && (
            <>
              <div>
                <Label>API URL</Label>
                <Input value={config.sms.apiUrl} onChange={(event) => setConfigValue("sms.apiUrl", event.target.value)} placeholder="https://provider.example.com/send" />
              </div>
              <div>
                <Label>Auth header</Label>
                <Input value={config.sms.authHeader} onChange={(event) => setConfigValue("sms.authHeader", event.target.value)} placeholder="Authorization" />
              </div>
              <div>
                <Label>Auth prefix</Label>
                <Input value={config.sms.authPrefix} onChange={(event) => setConfigValue("sms.authPrefix", event.target.value)} placeholder="Bearer" />
              </div>
            </>
          )}
        </div>
        <p className="mt-3 text-[0.56rem] leading-relaxed text-muted-foreground">
          Generic sends a JSON POST with <code>to</code>, <code>message</code> and{" "}
          <code>senderId</code>. Map those fields to any new provider when you choose one.
        </p>
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-jade/10 text-jade">
            <Truck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl">Steadfast Courier</h2>
            <p className="text-[0.6rem] text-muted-foreground">
              Book parcels, receive signed status webhooks and sync tracking.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em] ${
                steadfastHealth.configured
                  ? "bg-jade/10 text-jade"
                  : "bg-saffron/15 text-gold-ink"
              }`}
            >
              {steadfastHealth.configured ? "Ready" : "Needs setup"}
            </span>
            <label className="flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              <input type="checkbox" checked={config.steadfast.enabled} onChange={(event) => setConfigValue("steadfast.enabled", event.target.checked)} className="h-4 w-4 accent-[var(--color-indigo)]" />
              Enabled
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>API key {secretStatus.steadfastApiKey && <span className="text-jade">(set)</span>}</Label>
            <Input type="password" value={secrets.steadfastApiKey} onChange={(event) => setSecrets({ ...secrets, steadfastApiKey: event.target.value })} placeholder={secretStatus.steadfastApiKey ? "••••••••" : "Steadfast API key"} />
          </div>
          <div>
            <Label>Secret key {secretStatus.steadfastSecretKey && <span className="text-jade">(set)</span>}</Label>
            <Input type="password" value={secrets.steadfastSecretKey} onChange={(event) => setSecrets({ ...secrets, steadfastSecretKey: event.target.value })} placeholder={secretStatus.steadfastSecretKey ? "••••••••" : "Steadfast secret key"} />
          </div>
          <div className="sm:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <Label className="mb-0">
                Webhook auth token {secretStatus.steadfastWebhookSecret && <span className="text-jade">(set)</span>}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSteadfastToken}
                disabled={steadfastTesting}
              >
                {secretStatus.steadfastWebhookSecret ? "Rotate token" : "Generate token"}
              </Button>
            </div>
            <Input
              type="password"
              value={secrets.steadfastWebhookSecret}
              onChange={(event) => setSecrets({ ...secrets, steadfastWebhookSecret: event.target.value })}
              placeholder={secretStatus.steadfastWebhookSecret ? "Leave blank to keep the current token" : "Paste the same token you enter in Steadfast"}
            />
            {generatedSteadfastToken && (
              <div className="mt-2 rounded-lg border border-gold/40 bg-gold/[0.07] p-3">
                <p className="text-[0.58rem] font-semibold text-gold-ink">
                  Copy this token now. It is saved and will not be shown again.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all rounded bg-[var(--surface)] px-2 py-1.5 font-mono text-[0.62rem]">
                    {generatedSteadfastToken}
                  </code>
                  <Button type="button" variant="outline" size="sm" onClick={copyGeneratedToken}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
              </div>
            )}
            <p className="mt-1 text-[0.56rem] leading-relaxed text-muted-foreground">
              Steadfast sends this as <code>Authorization: Bearer …</code> and signs the raw
              body in <code>X-Signature</code>. It is separate from your API and secret keys.
              Use the same value in Steadfast → Webhook → Auth token.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Callback URL
              </p>
              <code className="mt-1 block break-all text-[0.62rem]">{webhookUrl}</code>
            </div>
            <div className="flex gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={copyWebhookUrl}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button asChild type="button" variant="outline" size="sm">
                <a href="/admin/couriers">
                  <ExternalLink className="h-3.5 w-3.5" /> Courier desk
                </a>
              </Button>
            </div>
          </div>
          <p className="mt-2 text-[0.56rem] leading-relaxed text-muted-foreground">
            Paste this exact HTTPS URL into Steadfast → Webhook. Save the auth token above and
            in Steadfast. The endpoint answers in under five seconds and ignores duplicate
            retries by <code>Idempotency-Key</code>.
          </p>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] px-3.5 py-3">
            <span>
              <span className="block text-[0.66rem] font-semibold">Auto-book on Confirmed</span>
              <span className="mt-0.5 block text-[0.56rem] leading-relaxed text-muted-foreground">
                Creates the Steadfast parcel when an order moves to Confirmed or Processing.
              </span>
            </span>
            <input
              type="checkbox"
              checked={config.steadfast.autoBookOnConfirmed}
              onChange={(event) => setConfigValue("steadfast.autoBookOnConfirmed", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-indigo)]"
            />
          </label>
          <label className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] px-3.5 py-3">
            <span>
              <span className="block text-[0.66rem] font-semibold">Require X-Signature</span>
              <span className="mt-0.5 block text-[0.56rem] leading-relaxed text-muted-foreground">
                Rejects events without a valid HMAC signature. Turn on after live events show
                a valid signature in the courier desk.
              </span>
            </span>
            <input
              type="checkbox"
              checked={config.steadfast.webhookRequireSignature}
              onChange={(event) => setConfigValue("steadfast.webhookRequireSignature", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-indigo)]"
            />
          </label>
          <div>
            <Label>Delivery type</Label>
            <Select
              value={String(config.steadfast.defaultDeliveryType)}
              onChange={(event) => setConfigValue("steadfast.defaultDeliveryType", Number(event.target.value))}
            >
              <option value="0">Home delivery</option>
              <option value="1">Point / hub delivery</option>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" variant="outline" onClick={testSteadfast} disabled={steadfastTesting}>
              {steadfastTesting ? "Testing…" : "Test connection"}
            </Button>
            <span className="pb-2 text-[0.56rem] text-muted-foreground">
              Ping + balance; no parcel is booked.
            </span>
          </div>
        </div>

        {steadfastTest && (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-[0.62rem] ${
              steadfastTest.ok
                ? "bg-jade/10 text-jade"
                : "bg-rosewood/10 text-rosewood"
            }`}
          >
            {steadfastTest.message}
          </p>
        )}
      </section>

      <section className={card}>
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-magenta/10 text-magenta">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xl">bKash Merchant</h2>
            <p className="text-[0.6rem] text-muted-foreground">Keep off until credentials and mode are verified.</p>
          </div>
          <label className="ml-auto flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            <input type="checkbox" checked={config.bkash.enabled} onChange={(event) => setConfigValue("bkash.enabled", event.target.checked)} className="h-4 w-4 accent-[var(--color-indigo)]" />
            Enabled
          </label>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Mode</Label>
            <Select value={config.bkash.mode} onChange={(event) => setConfigValue("bkash.mode", event.target.value)}>
              <option value="sandbox">Sandbox</option>
              <option value="live">Live</option>
            </Select>
          </div>
          <div>
            <Label>App key {secretStatus.bkashAppKey && <span className="text-jade">(set)</span>}</Label>
            <Input type="password" value={secrets.bkashAppKey} onChange={(event) => setSecrets({ ...secrets, bkashAppKey: event.target.value })} />
          </div>
          <div>
            <Label>App secret {secretStatus.bkashAppSecret && <span className="text-jade">(set)</span>}</Label>
            <Input type="password" value={secrets.bkashAppSecret} onChange={(event) => setSecrets({ ...secrets, bkashAppSecret: event.target.value })} />
          </div>
          <div>
            <Label>Username {secretStatus.bkashUsername && <span className="text-jade">(set)</span>}</Label>
            <Input type="password" value={secrets.bkashUsername} onChange={(event) => setSecrets({ ...secrets, bkashUsername: event.target.value })} />
          </div>
          <div>
            <Label>Password {secretStatus.bkashPassword && <span className="text-jade">(set)</span>}</Label>
            <Input type="password" value={secrets.bkashPassword} onChange={(event) => setSecrets({ ...secrets, bkashPassword: event.target.value })} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-saffron/15 text-gold-ink">
              <Music2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl">Tawk.to</h2>
              <p className="text-[0.6rem] text-muted-foreground">Live chat widget.</p>
            </div>
            <label className="ml-auto flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              <input type="checkbox" checked={config.tawk.enabled} onChange={(event) => setConfigValue("tawk.enabled", event.target.checked)} className="h-4 w-4 accent-[var(--color-indigo)]" />
              Enabled
            </label>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <Label>Property ID</Label>
              <Input value={config.tawk.propertyId} onChange={(event) => setConfigValue("tawk.propertyId", event.target.value)} />
            </div>
            <div>
              <Label>Widget ID</Label>
              <Input value={config.tawk.widgetId} onChange={(event) => setConfigValue("tawk.widgetId", event.target.value)} />
            </div>
          </div>
        </section>

        <section className={card}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo/10 text-indigo">
              <Webhook className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl">Discord alerts</h2>
              <p className="text-[0.6rem] text-muted-foreground">One webhook URL per line.</p>
            </div>
            <label className="ml-auto flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              <input type="checkbox" checked={config.discord.enabled} onChange={(event) => setConfigValue("discord.enabled", event.target.checked)} className="h-4 w-4 accent-[var(--color-indigo)]" />
              Enabled
            </label>
          </div>
          <div className="mt-4">
            <Label>Webhook URLs {secretStatus.discordWebhookUrls && <span className="text-jade">(configured)</span>}</Label>
            <textarea
              value={secrets.discordWebhooks}
              onChange={(event) => setSecrets({ ...secrets, discordWebhooks: event.target.value })}
              className="field min-h-24"
              placeholder={secretStatus.discordWebhookUrls ? "Leave blank to keep current webhooks" : "https://discord.com/api/webhooks/…"}
            />
            <p className="mt-1.5 text-[0.56rem] leading-relaxed text-muted-foreground">
              Discord → Server Settings → Integrations → Webhooks. Paste one URL per line (or separate with commas).
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] ${
                discordStatus.enabled ? "bg-jade/10 text-jade" : "bg-rosewood/10 text-rosewood"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  discordStatus.enabled ? "bg-jade" : "bg-rosewood"
                }`}
              />
              {discordStatus.enabled ? "Alerts on" : "Alerts off"}
            </span>
            <span className="text-[0.56rem] text-muted-foreground">
              {discordStatus.webhookCount} saved webhook
              {discordStatus.webhookCount === 1 ? "" : "s"}
            </span>
            {secretStatus.discordWebhookUrls && (
              <button
                type="button"
                onClick={clearDiscord}
                className="ml-auto inline-flex items-center gap-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-rosewood hover:underline"
              >
                <Trash2 className="h-3 w-3" /> Remove saved
              </button>
            )}
          </div>

          {discordStatus.lastDelivery && (
            <div
              className={`mt-3 rounded-xl border px-3 py-2 text-[0.58rem] ${
                discordStatus.lastDelivery.failed > 0
                  ? "border-rosewood/25 bg-rosewood/[0.05]"
                  : "border-jade/25 bg-jade/[0.05]"
              }`}
            >
              <p className="font-semibold">
                Last {discordStatus.lastDelivery.event === "test" ? "test" : "alert"}:{" "}
                {discordStatus.lastDelivery.sent} sent
                {discordStatus.lastDelivery.failed
                  ? `, ${discordStatus.lastDelivery.failed} failed`
                  : ""}
              </p>
              <p className="mt-0.5 text-muted-foreground">
                {formatWhen(discordStatus.lastDelivery.at)}
              </p>
              {discordStatus.lastDelivery.errors.length > 0 && (
                <p className="mt-1 text-rosewood">{discordStatus.lastDelivery.errors[0]}</p>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testDiscord}
              disabled={testing || saving}
            >
              <Send className="h-3.5 w-3.5" />
              {testing ? "Sending…" : "Send test"}
            </Button>
            <p className="text-[0.56rem] text-muted-foreground">
              Tests the URLs in the box, or the saved webhooks when the box is blank.
            </p>
          </div>

          {testResult && (
            <div
              className={`mt-2 rounded-xl border px-3 py-2 text-[0.6rem] ${
                testResult.ok
                  ? "border-jade/30 bg-jade/[0.06] text-jade"
                  : "border-rosewood/30 bg-rosewood/[0.06] text-rosewood"
              }`}
            >
              <p className="font-semibold">{testResult.message}</p>
              {testResult.errors.map((error, index) => (
                <p key={`${error}-${index}`} className="mt-1">
                  {error}
                </p>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
        <p className="text-[0.62rem] text-muted-foreground">
          Changes are stored in Supabase. Use <strong>Send test</strong> on Discord to verify delivery.
        </p>
        <Button type="button" onClick={save} disabled={saving}>
          <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save integrations"}
        </Button>
      </div>
    </div>
  );
}
