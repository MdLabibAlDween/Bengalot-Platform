import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  getSteadfastWebhookSettings,
  handleSteadfastWebhook,
  parseSteadfastWebhook,
  verifySteadfastWebhook,
} from "@/lib/steadfast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const settings = await getSteadfastWebhookSettings();
  if (!settings.enabled) {
    return NextResponse.json({ error: "Steadfast is not enabled." }, { status: 503 });
  }
  if (!settings.token) {
    return NextResponse.json(
      { error: "Add the Steadfast webhook auth token in Integrations." },
      { status: 503 }
    );
  }

  const verification = verifySteadfastWebhook(
    rawBody,
    request.headers,
    settings.token,
    settings.requireSignature
  );
  if (!verification.ok) {
    return NextResponse.json({ error: verification.reason }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const payload = parseSteadfastWebhook(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid Steadfast payload." }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  const suppliedKey = request.headers.get("idempotency-key")?.trim();
  const fallbackKey = crypto.createHash("sha256").update(rawBody).digest("hex");
  const idempotencyKey = `steadfast:${suppliedKey || fallbackKey}`;

  try {
    const result = await handleSteadfastWebhook({
      admin,
      payload,
      idempotencyKey,
      signatureStatus: verification.signatureStatus,
      rawBody: body,
    });
    return NextResponse.json({ ...result, ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message.slice(0, 240)
            : "Could not process the Steadfast webhook.",
      },
      { status: 500 }
    );
  }
}
