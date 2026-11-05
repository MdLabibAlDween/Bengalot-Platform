import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { issueGiftCard, voidGiftCard } from "@/lib/gift-cards-db";
import { GIFT_CARD_MAX, GIFT_CARD_MIN } from "@/lib/gift-cards";

const issueSchema = z.object({
  amount: z.number().int().min(GIFT_CARD_MIN).max(GIFT_CARD_MAX),
  recipientName: z.string().trim().min(2).max(80),
  recipientContact: z.string().trim().min(5).max(120),
  senderName: z.string().trim().min(2).max(80),
  message: z.string().trim().max(500).optional(),
  delivery: z.enum(["email", "whatsapp"]),
  expiryMonths: z.number().int().min(1).max(60).optional(),
  note: z.string().trim().max(500).optional(),
  isDemo: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;

  const [cardsResponse, requestsResponse, transactionsResponse] = await Promise.all([
    auth.admin.from("gift_cards").select("*").order("created_at", { ascending: false }).limit(500),
    auth.admin
      .from("gift_card_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    auth.admin
      .from("gift_card_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  const cards = cardsResponse.data ?? [];
  const requests = requestsResponse.data ?? [];
  const transactions = transactionsResponse.data ?? [];

  return NextResponse.json({
    cards,
    requests,
    transactions,
    stats: {
      active: cards.filter((card) => card.status === "active").length,
      outstanding: cards
        .filter((card) => card.status === "active")
        .reduce((sum, card) => sum + Number(card.balance), 0),
      issued: cards.reduce((sum, card) => sum + Number(card.amount), 0),
      redeemed: cards.filter((card) => card.status === "redeemed").length,
      pendingRequests: requests.filter((request) => request.status === "pending").length,
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.action) return badRequest("Missing action.");

  if (body.action === "issue") {
    const parsed = issueSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid gift card.");
    }
    const result = await issueGiftCard(auth.admin, parsed.data, {
      id: auth.context.user.id,
      email: auth.context.profile.email ?? undefined,
    });
    if (!result.ok) return badRequest(result.error);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "gift_card_issued",
      entity: "gift_cards",
      entityId: result.card.id,
      after: { code: result.card.code, amount: result.card.amount },
    });
    revalidatePath("/admin/gift-cards");
    revalidatePath("/gift-cards");
    return NextResponse.json({ ok: true, card: result.card });
  }

  if (body.action === "issue_from_request") {
    const parsed = z
      .object({ requestId: z.string().uuid(), note: z.string().trim().max(500).optional() })
      .safeParse(body);
    if (!parsed.success) return badRequest("Invalid request.");
    const { data: giftRequest } = await auth.admin
      .from("gift_card_requests")
      .select("*")
      .eq("id", parsed.data.requestId)
      .maybeSingle();
    if (!giftRequest) return badRequest("Gift card request not found.");
    if (giftRequest.gift_card_id) return badRequest("This request already has a gift card.");

    const result = await issueGiftCard(
      auth.admin,
      {
        amount: Number(giftRequest.amount),
        recipientName: giftRequest.recipient_name,
        recipientContact: giftRequest.recipient_contact,
        senderName: giftRequest.sender_name,
        message: giftRequest.message ?? undefined,
        delivery: giftRequest.delivery,
        note: parsed.data.note || `Issued from ${giftRequest.reference}`,
        source: "request",
      },
      { id: auth.context.user.id, email: auth.context.profile.email ?? undefined }
    );
    if (!result.ok) return badRequest(result.error);
    await auth.admin
      .from("gift_card_requests")
      .update({
        status: "issued",
        gift_card_id: result.card.id,
        admin_note: parsed.data.note || giftRequest.admin_note,
      })
      .eq("id", giftRequest.id);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "gift_card_issued_from_request",
      entity: "gift_card_requests",
      entityId: giftRequest.id,
      after: { code: result.card.code, amount: result.card.amount },
    });
    revalidatePath("/admin/gift-cards");
    revalidatePath("/gift-cards");
    return NextResponse.json({ ok: true, card: result.card });
  }

  if (body.action === "void") {
    const parsed = z
      .object({ id: z.string().uuid(), note: z.string().trim().max(500).optional() })
      .safeParse(body);
    if (!parsed.success) return badRequest("Invalid gift card.");
    const result = await voidGiftCard(
      auth.admin,
      parsed.data.id,
      { email: auth.context.profile.email ?? undefined },
      parsed.data.note
    );
    if (!result.ok) return badRequest(result.error);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "gift_card_voided",
      entity: "gift_cards",
      entityId: parsed.data.id,
      after: { note: parsed.data.note },
    });
    revalidatePath("/admin/gift-cards");
    revalidatePath("/gift-cards");
    return NextResponse.json({ ok: true });
  }

  if (body.action === "request_status") {
    const parsed = z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "contacted", "paid", "cancelled"]),
        adminNote: z.string().trim().max(500).optional(),
      })
      .safeParse(body);
    if (!parsed.success) return badRequest("Invalid request status.");
    const { error } = await auth.admin
      .from("gift_card_requests")
      .update({ status: parsed.data.status, admin_note: parsed.data.adminNote || null })
      .eq("id", parsed.data.id);
    if (error) return badRequest(error.message);
    revalidatePath("/admin/gift-cards");
    return NextResponse.json({ ok: true });
  }

  return badRequest("Unknown gift card action.");
}
