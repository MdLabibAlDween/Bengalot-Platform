import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomerApi } from "@/lib/customer-api";

function currentSessionId(accessToken: string | undefined) {
  if (!accessToken) return null;
  const part = accessToken.split(".")[1];
  if (!part) return null;
  try {
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(normalized, "base64").toString("utf8")) as {
      session_id?: string;
    };
    return payload.session_id ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;
  const {
    data: { session },
  } = await ctx.supabase.auth.getSession();
  const sessionId = currentSessionId(session?.access_token);
  const { data, error } = await ctx.supabase.rpc("bengalot_my_sessions");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const sessions = (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_agent: row.user_agent,
    ip: row.ip,
    aal: row.aal,
    current: sessionId ? String(row.id) === sessionId : false,
  }));
  return NextResponse.json({ sessions, sessionId });
}

export async function DELETE(request: Request) {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;
  const parsed = z
    .object({ sessionId: z.string().uuid() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }
  const { data, error } = await ctx.supabase.rpc("bengalot_revoke_session", {
    target_session: parsed.data.sessionId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) {
    return NextResponse.json({ error: "That session could not be found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
