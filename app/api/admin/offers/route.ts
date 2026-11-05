import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { getOfferCampaigns } from "@/lib/offers-db";

const schema = z.object({
  id: z.string().trim().min(3).max(80).optional(),
  eyebrow: z.string().trim().min(1).max(80).default("Current offer"),
  title: z.string().trim().min(2).max(160),
  accentWord: z.string().trim().max(80).optional(),
  description: z.string().trim().max(600).default(""),
  couponCode: z.string().trim().min(2).max(40),
  ctaLabel: z.string().trim().min(1).max(80).default("Shop the offer"),
  ctaHref: z.string().trim().min(1).max(300).default("/collections/sale"),
  startAt: z.string().trim().min(1).max(40),
  endAt: z.string().trim().max(40).optional().nullable(),
  status: z.enum(["draft", "published", "ended"]),
  theme: z.enum(["royal", "magenta", "gold", "teal"]),
  sort: z.number().int().min(0).max(9999).default(0),
  isDemo: z.boolean().optional(),
});

function validDate(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? new Date(value).toISOString() : null;
}

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  return NextResponse.json({ campaigns: await getOfferCampaigns() });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid offer campaign.");
  const input = parsed.data;
  const startsAt = validDate(input.startAt);
  const endsAt = input.endAt ? validDate(input.endAt) : null;
  if (!startsAt) return badRequest("Enter a valid start date and time.");
  if (input.endAt && !endsAt) return badRequest("Enter a valid end date and time.");
  if (endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    return badRequest("The end time must be after the start time.");
  }

  const payload = {
    eyebrow: input.eyebrow,
    title: input.title,
    accent_word: input.accentWord || null,
    description: input.description,
    coupon_code: input.couponCode.toUpperCase(),
    cta_label: input.ctaLabel,
    cta_href: input.ctaHref,
    starts_at: startsAt,
    ends_at: endsAt,
    status: input.status,
    theme: input.theme,
    sort: input.sort,
    is_demo: Boolean(input.isDemo),
  };
  const id = input.id || `offer-${Date.now().toString(36)}`;
  const query = input.id
    ? auth.admin.from("offer_campaigns").update(payload).eq("id", input.id)
    : auth.admin.from("offer_campaigns").insert({ id, ...payload });
  const { data, error } = await query.select("*").single();
  if (error) return badRequest(error.message);
  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: input.id ? "offer_campaign_updated" : "offer_campaign_created",
    entity: "offer_campaigns",
    entityId: data.id,
    after: { title: data.title, status: data.status, coupon: data.coupon_code },
  });
  revalidatePath("/");
  revalidatePath("/offers");
  revalidatePath("/admin/offers");
  return NextResponse.json({ ok: true, campaign: data });
}

export async function DELETE(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;
  const parsed = z.object({ id: z.string().trim().min(1).max(80) }).safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) return badRequest("Invalid offer campaign.");
  const { error } = await auth.admin
    .from("offer_campaigns")
    .delete()
    .eq("id", parsed.data.id);
  if (error) return badRequest(error.message);
  revalidatePath("/");
  revalidatePath("/offers");
  revalidatePath("/admin/offers");
  return NextResponse.json({ ok: true });
}
