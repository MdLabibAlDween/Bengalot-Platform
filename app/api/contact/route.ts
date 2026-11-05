import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(5).max(4000),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(rateLimitKey(request, "contact"), 5, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message." },
      { status: 400 }
    );
  }
  if (parsed.data.website) return NextResponse.json({ ok: true });
  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Contact inbox is not configured." }, { status: 503 });
  }
  const { error } = await admin.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
