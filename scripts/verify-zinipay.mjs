/**
 * Checks the ZiniPay configuration. With VERIFY_ZINIPAY_CREATE=true it also
 * creates a small sandbox invoice and verifies it, printing the hosted URL.
 *
 *   node scripts/verify-zinipay.mjs
 *   VERIFY_ZINIPAY_CREATE=true node scripts/verify-zinipay.mjs
 *
 * Nothing here can move real money: creating an invoice only produces a hosted
 * payment page. No payment is made by this script.
 */

import { readFileSync } from "node:fs";

function envFileValue(key) {
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((row) => row.trim().startsWith(`${key}=`));
  if (!line) return undefined;
  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^"(.*)"$/, "$1");
}

function value(key) {
  return process.env[key] ?? envFileValue(key);
}

const apiKey = value("ZINIPAY_API_KEY");
const baseUrl = (value("ZINIPAY_BASE_URL") ?? "https://api.zinipay.com").replace(/\/+$/, "");
const appUrl = (process.env.VERIFY_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const shouldCreate = process.env.VERIFY_ZINIPAY_CREATE === "true";

console.log(`ZiniPay endpoint: ${baseUrl}`);
console.log(`API key: ${apiKey ? `${apiKey.slice(0, 12)}… (${apiKey.length} chars)` : "(not set)"}`);
console.log("");

if (!apiKey) {
  console.log("ZiniPay is NOT configured yet.");
  console.log("Add ZINIPAY_API_KEY to .env.local (Brand Key from the ZiniPay dashboard), then run this again.");
  console.log("Digital checkout falls back to manual bKash instructions until the key is added.");
  console.log("");

  try {
    const retry = await fetch(`${appUrl}/api/payments/zinipay/retry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: "BG-VERIFY-NONE" }),
    });
    console.log(
      `${retry.status === 503 ? "PASS" : "WARN"} · Retry route is guarded (status ${retry.status}).`,
    );

    const returned = await fetch(
      `${appUrl}/api/payments/zinipay/return?order=BG-VERIFY-NONE`,
      { redirect: "manual" },
    );
    const location = returned.headers.get("location") ?? "";
    const guardedReturn =
      [302, 303, 307, 308].includes(returned.status) &&
      location.includes("payment=");
    console.log(
      `${guardedReturn ? "PASS" : "WARN"} · Return route redirects safely (status ${returned.status}).`,
    );

    const webhook = await fetch(`${appUrl}/api/payments/zinipay/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "true" }),
    });
    console.log(
      `${webhook.status === 400 ? "PASS" : "WARN"} · Webhook rejects a missing order (status ${webhook.status}).`,
    );
  } catch {
    console.log("WARN · Start the dev server to check the local ZiniPay routes.");
  }

  process.exit(0);
}

async function api(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "zini-api-key": apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data, text };
}

if (!shouldCreate) {
  console.log("Configuration is present.");
  console.log("Set VERIFY_ZINIPAY_CREATE=true to create a small sandbox invoice and check the API.");
  process.exit(0);
}

const created = await api("/v1/payment/create", {
  cus_name: "Bengalot Verify",
  cus_email: "support@bengalot.com",
  amount: 10,
  metadata: { order_id: "VERIFY-ZINIPAY", source: "verify-script" },
  redirect_url: "https://bengalot.com/checkout/success?order=VERIFY-ZINIPAY",
  cancel_url: "https://bengalot.com/checkout?payment=cancelled",
  webhook_url: "https://bengalot.com/api/payments/zinipay/webhook?order=VERIFY-ZINIPAY",
});

if (!created.ok || !created.data?.status || !created.data?.payment_url) {
  console.error(`FAIL · Invoice creation failed (${created.status}).`);
  console.error(created.data ?? created.text);
  process.exitCode = 1;
} else {
  const paymentUrl = /^https?:\/\//i.test(created.data.payment_url)
    ? created.data.payment_url
    : `https://${created.data.payment_url}`;
  console.log(`PASS · Invoice created: ${paymentUrl}`);

  const invoiceId = (() => {
    try {
      return new URL(paymentUrl).pathname.split("/").filter(Boolean).at(-1);
    } catch {
      return null;
    }
  })();

  if (invoiceId) {
    const verified = await api("/v1/payment/verify", { invoice_id: invoiceId });
    if (verified.ok && verified.data?.status) {
      console.log(`PASS · Verify endpoint answered with status ${verified.data.status}.`);
    } else {
      console.warn(`WARN · Verify endpoint did not return a status (${verified.status}).`);
      console.warn(verified.data ?? verified.text);
    }
  }

  console.log("No payment was made. This invoice is safe to ignore in the sandbox dashboard.");
}
