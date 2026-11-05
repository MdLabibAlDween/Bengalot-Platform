import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { lookupGiftCard } from "@/lib/gift-cards-db";
import { formatGiftCardCode } from "@/lib/gift-cards";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const schema = z.object({ code: z.string().trim().min(4).max(80) });

export async function POST(request: Request) {
  const limited = rateLimit(rateLimitKey(request, "gift-lookup"), 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many lookups. Please wait a minute." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid gift card code." }, { status: 400 });
  }
  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Gift cards are not configured." }, { status: 503 });
  }
  const found = await lookupGiftCard(admin, parsed.data.code);
  if (!found.ok) {
    return NextResponse.json({ error: found.error }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    giftCard: {
      code: formatGiftCardCode(found.card.code),
      amount: found.card.amount,
      balance: found.card.balance,
      status: found.card.status,
      expiresAt: found.card.expires_at,
      recipientName: found.card.recipient_name.split(/\s+/)[0] ?? "",
    },
  });
}
