import "server-only";

import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  GIFT_CARD_MAX,
  GIFT_CARD_MIN,
  normalizeGiftCardCode,
} from "./gift-cards";

export type DbGiftCard = {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipient_name: string;
  recipient_contact: string;
  sender_name: string;
  message: string | null;
  delivery: "email" | "whatsapp";
  status: "active" | "redeemed" | "expired" | "void";
  expires_at: string;
  created_at: string;
  note: string | null;
  is_demo: boolean;
  source: string;
};

export type DbGiftCardRequest = {
  id: string;
  reference: string;
  amount: number;
  recipient_name: string;
  recipient_contact: string;
  sender_name: string;
  message: string | null;
  delivery: "email" | "whatsapp";
  status: "pending" | "contacted" | "paid" | "issued" | "cancelled";
  admin_note: string | null;
  gift_card_id: string | null;
  created_at: string;
  updated_at: string;
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomGroup(length = 4) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function generateGiftCardCode() {
  return `BG-GIFT-${randomGroup()}-${randomGroup()}`;
}

export function generateGiftCardReference() {
  return `GC-REQ-${randomGroup(6)}`;
}

function expiryFrom(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + Math.max(1, Math.min(60, months)));
  return date.toISOString();
}

function cleanCode(value: string) {
  return normalizeGiftCardCode(value);
}

export function giftCardIsExpired(card: Pick<DbGiftCard, "expires_at" | "status">) {
  return card.status === "expired" || new Date(card.expires_at).getTime() <= Date.now();
}

export async function issueGiftCard(
  admin: SupabaseClient,
  input: {
    amount: number;
    recipientName: string;
    recipientContact: string;
    senderName: string;
    message?: string;
    delivery: "email" | "whatsapp";
    expiryMonths?: number;
    note?: string;
    isDemo?: boolean;
    source?: string;
  },
  actor?: { id?: string; email?: string }
) {
  const amount = Math.round(Number(input.amount));
  if (!Number.isFinite(amount) || amount < GIFT_CARD_MIN || amount > GIFT_CARD_MAX) {
    return {
      ok: false as const,
      error: `Choose an amount between ৳${GIFT_CARD_MIN} and ৳${GIFT_CARD_MAX}.`,
    };
  }
  if (!input.recipientName.trim()) return { ok: false as const, error: "Recipient name is required." };
  if (!input.recipientContact.trim()) {
    return { ok: false as const, error: "Recipient contact is required." };
  }
  if (!input.senderName.trim()) return { ok: false as const, error: "Sender name is required." };

  let code = "";
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = generateGiftCardCode();
    const { data } = await admin
      .from("gift_cards")
      .select("id")
      .eq("code", cleanCode(candidate))
      .maybeSingle();
    if (!data) {
      code = candidate;
      break;
    }
  }
  if (!code) return { ok: false as const, error: "Could not generate a unique code. Try again." };

  const { data, error } = await admin
    .from("gift_cards")
    .insert({
      code: cleanCode(code),
      amount,
      balance: amount,
      recipient_name: input.recipientName.trim(),
      recipient_contact: input.recipientContact.trim(),
      sender_name: input.senderName.trim(),
      message: input.message?.trim() || null,
      delivery: input.delivery,
      status: "active",
      expires_at: expiryFrom(input.expiryMonths ?? 12),
      issued_by: actor?.id ?? null,
      note: input.note?.trim() || null,
      is_demo: Boolean(input.isDemo),
      source: input.source ?? "admin",
    })
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false as const, error: error?.message ?? "Could not issue the gift card." };
  }
  await admin.from("gift_card_transactions").insert({
    gift_card_id: data.id,
    kind: "issue",
    amount,
    balance_after: amount,
    note: input.note?.trim() || "Gift card issued",
    actor_email: actor?.email ?? null,
  });
  return { ok: true as const, card: data as DbGiftCard };
}

export async function lookupGiftCard(admin: SupabaseClient, code: string) {
  const normalized = cleanCode(code);
  if (!normalized) return { ok: false as const, error: "Enter a gift card code." };
  const { data, error } = await admin
    .from("gift_cards")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  if (!data) return { ok: false as const, error: "That gift card was not found." };
  const card = data as DbGiftCard;
  if (card.status === "void") {
    return { ok: false as const, error: "That gift card has been voided." };
  }
  if (card.status === "redeemed" || card.balance <= 0) {
    return { ok: false as const, error: "That gift card has no balance left." };
  }
  if (giftCardIsExpired(card)) {
    return { ok: false as const, error: "That gift card has expired." };
  }
  return { ok: true as const, card };
}

export async function redeemGiftCardForOrder(
  admin: SupabaseClient,
  code: string,
  amountDue: number,
  orderNo: string
) {
  if (!code || amountDue <= 0) {
    return { ok: true as const, applied: 0, card: null as DbGiftCard | null };
  }
  const found = await lookupGiftCard(admin, code);
  if (!found.ok) return { ok: false as const, error: found.error };
  const card = found.card;
  const applied = Math.max(0, Math.min(card.balance, Math.round(amountDue)));
  if (applied <= 0) return { ok: false as const, error: "That gift card has no usable balance." };
  const balance = card.balance - applied;
  const { data: updated, error } = await admin
    .from("gift_cards")
    .update({
      balance,
      status: balance <= 0 ? "redeemed" : "active",
    })
    .eq("id", card.id)
    .eq("balance", card.balance)
    .eq("status", "active")
    .select("*")
    .maybeSingle();
  if (error || !updated) {
    return {
      ok: false as const,
      error: "That gift card balance changed. Please check the code and try again.",
    };
  }
  await admin.from("gift_card_transactions").insert({
    gift_card_id: card.id,
    order_no: orderNo,
    kind: "redeem",
    amount: -applied,
    balance_after: balance,
    note: `Redeemed on order ${orderNo}`,
  });
  return { ok: true as const, applied, card: updated as DbGiftCard, balance };
}

export async function refundGiftCardForOrder(
  admin: SupabaseClient,
  code: string,
  amount: number,
  orderNo: string
) {
  if (!code || amount <= 0) return { ok: true as const };
  const { data } = await admin
    .from("gift_cards")
    .select("*")
    .eq("code", cleanCode(code))
    .maybeSingle();
  if (!data) return { ok: true as const };
  const card = data as DbGiftCard;
  const balance = Math.min(card.amount, card.balance + Math.round(amount));
  const expiresAt = new Date(card.expires_at).getTime();
  const status = card.status === "void" ? "void" : expiresAt <= Date.now() ? "expired" : "active";
  const { error } = await admin.from("gift_cards").update({ balance, status }).eq("id", card.id);
  if (error) return { ok: false as const, error: error.message };
  await admin.from("gift_card_transactions").insert({
    gift_card_id: card.id,
    order_no: orderNo,
    kind: "refund",
    amount: Math.round(amount),
    balance_after: balance,
    note: `Restored after ${orderNo} was cancelled/returned`,
  });
  return { ok: true as const };
}

export async function voidGiftCard(
  admin: SupabaseClient,
  id: string,
  actor?: { email?: string },
  note?: string
) {
  const { data: card } = await admin.from("gift_cards").select("*").eq("id", id).maybeSingle();
  if (!card) return { ok: false as const, error: "Gift card not found." };
  const { error } = await admin
    .from("gift_cards")
    .update({ status: "void", balance: 0, note: note?.trim() || "Voided by admin" })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  await admin.from("gift_card_transactions").insert({
    gift_card_id: id,
    kind: "void",
    amount: -Math.max(0, Number(card.balance)),
    balance_after: 0,
    note: note?.trim() || "Voided by admin",
    actor_email: actor?.email ?? null,
  });
  return { ok: true as const };
}
