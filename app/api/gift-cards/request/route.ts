import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { generateGiftCardReference } from "@/lib/gift-cards-db";
import { GIFT_CARD_MAX, GIFT_CARD_MIN } from "@/lib/gift-cards";
import { getFeatureFlags, getGiftCardSettings } from "@/lib/admin/settings";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const schema = z.object({
  amount: z.number().int().min(GIFT_CARD_MIN).max(GIFT_CARD_MAX),
  recipientName: z.string().trim().min(2).max(80),
  recipientContact: z.string().trim().min(5).max(120),
  senderName: z.string().trim().min(2).max(80),
  message: z.string().trim().max(500).optional(),
  delivery: z.enum(["email", "whatsapp"]),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const [features, settings] = await Promise.all([
    getFeatureFlags(),
    getGiftCardSettings(),
  ]);
  if (!features.giftCards || !settings.enabled) {
    return NextResponse.json(
      { error: "Gift cards are not available at the moment." },
      { status: 404 }
    );
  }
  const limited = rateLimit(rateLimitKey(request, "gift-request"), 5, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid gift card request." },
      { status: 400 }
    );
  }
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, reference: "GC-REQ-PENDING" });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Gift cards are not configured." }, { status: 503 });
  }

  let reference = "";
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = generateGiftCardReference();
    const { data } = await admin
      .from("gift_card_requests")
      .select("id")
      .eq("reference", candidate)
      .maybeSingle();
    if (!data) {
      reference = candidate;
      break;
    }
  }
  if (!reference) {
    return NextResponse.json({ error: "Could not create the request. Try again." }, { status: 503 });
  }

  const { error } = await admin.from("gift_card_requests").insert({
    reference,
    amount: parsed.data.amount,
    recipient_name: parsed.data.recipientName,
    recipient_contact: parsed.data.recipientContact,
    sender_name: parsed.data.senderName,
    message: parsed.data.message || null,
    delivery: parsed.data.delivery,
    status: "pending",
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, reference });
}
