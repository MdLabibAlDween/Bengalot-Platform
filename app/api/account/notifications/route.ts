import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomerApi } from "@/lib/customer-api";

const DEFAULT_PREFERENCES = {
  order_updates: true,
  offers_email: false,
  offers_sms: false,
  back_in_stock: false,
  review_reminders: false,
  newsletter: false,
};

export async function GET() {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;

  const [notifications, preferences] = await Promise.all([
    ctx.admin
      .from("customer_notifications")
      .select("id,kind,title,body,href,read_at,created_at")
      .eq("profile_id", ctx.user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    ctx.admin
      .from("notification_preferences")
      .select("*")
      .eq("profile_id", ctx.user.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    notifications: notifications.data ?? [],
    preferences: preferences.data ?? { profile_id: ctx.user.id, ...DEFAULT_PREFERENCES },
    unread: (notifications.data ?? []).filter((row) => !row.read_at).length,
  });
}

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("read"), id: z.string().uuid() }),
  z.object({ action: z.literal("read_all") }),
  z.object({
    action: z.literal("preferences"),
    preferences: z.object({
      order_updates: z.boolean(),
      offers_email: z.boolean(),
      offers_sms: z.boolean(),
      back_in_stock: z.boolean(),
      review_reminders: z.boolean(),
      newsletter: z.boolean(),
    }),
  }),
]);

export async function POST(request: Request) {
  const ctx = await requireCustomerApi();
  if ("error" in ctx) return ctx.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notification update." }, { status: 400 });
  }

  if (parsed.data.action === "read") {
    const { error } = await ctx.admin
      .from("customer_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", parsed.data.id)
      .eq("profile_id", ctx.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "read_all") {
    const { error } = await ctx.admin
      .from("customer_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("profile_id", ctx.user.id)
      .is("read_at", null);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await ctx.admin.from("notification_preferences").upsert(
    {
      profile_id: ctx.user.id,
      ...parsed.data.preferences,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
