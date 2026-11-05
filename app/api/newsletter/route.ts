import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email().max(200),
  source: z.string().trim().max(80).optional(),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(rateLimitKey(request, "newsletter"), 8, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true });
  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Newsletter is not configured." }, { status: 503 });
  }
  const { error } = await admin.from("newsletter_subscribers").upsert(
    {
      email: parsed.data.email.toLowerCase(),
      status: "subscribed",
      source: parsed.data.source || "website",
    },
    { onConflict: "email" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
