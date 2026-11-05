import { formatBDT } from "./utils";

/**
 * Gift-card content bridge.
 *
 * The credential-free preview keeps issued cards in localStorage. In
 * production these helpers should read/write `public.gift_cards` (see
 * supabase/migrations/20261104000100_gift_cards.sql). Keep the public API
 * stable so the UI does not need to change when the backend is connected.
 */

export const GIFT_CARD_STORAGE_KEY = "bengalot-gift-cards";
export const GIFT_CARD_MIN = 500;
export const GIFT_CARD_MAX = 50000;
export const GIFT_CARD_DENOMINATIONS = [1000, 2000, 5000, 10000] as const;

export type GiftCardDelivery = "email" | "whatsapp";
export type GiftCardStatus = "active" | "redeemed" | "expired";

export type GiftCard = {
  code: string;
  amount: number;
  balance: number;
  recipientName: string;
  recipientContact: string;
  senderName: string;
  message?: string;
  delivery: GiftCardDelivery;
  status: GiftCardStatus;
  createdAt: string;
  expiresAt: string;
};

export type CreateGiftCardInput = {
  amount: number;
  recipientName: string;
  recipientContact: string;
  senderName: string;
  message?: string;
  delivery: GiftCardDelivery;
  expiryMonths?: number;
};

export function normalizeGiftCardCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatGiftCardCode(value: string) {
  const normalized = normalizeGiftCardCode(value).replace(/[^A-Z0-9]/g, "");
  if (!normalized.startsWith("BGGIFT")) return normalized;
  const remainder = normalized.slice(6);
  const groups = remainder.match(/.{1,4}/g) ?? [];
  return ["BG", "GIFT", ...groups].join("-");
}

function randomGroup(length = 4) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(values);
  } else {
    for (let index = 0; index < length; index += 1) {
      values[index] = Math.floor(Math.random() * 0xffffffff);
    }
  }
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export function generateGiftCardCode() {
  return `BG-GIFT-${randomGroup()}-${randomGroup()}`;
}

function expiryFrom(date: Date, months = 12) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + Math.max(1, months));
  return next.toISOString();
}

export function getGiftCardStatus(card: GiftCard, now = new Date()): GiftCardStatus {
  if (card.status === "redeemed") return "redeemed";
  if (card.status === "expired") return "expired";
  if (new Date(card.expiresAt).getTime() <= now.getTime()) return "expired";
  return "active";
}

function readStoredCards(): GiftCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GIFT_CARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (card): card is GiftCard =>
        Boolean(card) &&
        typeof card.code === "string" &&
        typeof card.amount === "number" &&
        typeof card.balance === "number"
    );
  } catch {
    return [];
  }
}

function writeStoredCards(cards: GiftCard[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GIFT_CARD_STORAGE_KEY, JSON.stringify(cards));
  } catch {
    /* storage unavailable */
  }
}

export function getGiftCards() {
  return readStoredCards().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function findGiftCard(code: string) {
  const normalized = normalizeGiftCardCode(code);
  if (!normalized) return null;
  return (
    readStoredCards().find(
      (card) => normalizeGiftCardCode(card.code) === normalized
    ) ?? null
  );
}

export function createGiftCard(input: CreateGiftCardInput): GiftCard {
  const amount = Math.round(input.amount);
  if (!Number.isFinite(amount) || amount < GIFT_CARD_MIN || amount > GIFT_CARD_MAX) {
    throw new Error(
      `Choose an amount between ${formatBDT(GIFT_CARD_MIN)} and ${formatBDT(GIFT_CARD_MAX)}.`
    );
  }
  if (!input.recipientName.trim()) throw new Error("Add the recipient's name.");
  if (!input.recipientContact.trim()) throw new Error("Add a recipient email or phone.");
  if (!input.senderName.trim()) throw new Error("Add your name.");

  const now = new Date();
  const card: GiftCard = {
    code: generateGiftCardCode(),
    amount,
    balance: amount,
    recipientName: input.recipientName.trim(),
    recipientContact: input.recipientContact.trim(),
    senderName: input.senderName.trim(),
    message: input.message?.trim() || undefined,
    delivery: input.delivery,
    status: "active",
    createdAt: now.toISOString(),
    expiresAt: expiryFrom(now, input.expiryMonths),
  };

  writeStoredCards([card, ...readStoredCards()]);
  return card;
}

export function redeemGiftCard(code: string, amount: number) {
  const cards = readStoredCards();
  const normalized = normalizeGiftCardCode(code);
  const index = cards.findIndex(
    (card) => normalizeGiftCardCode(card.code) === normalized
  );
  if (index < 0) {
    return { ok: false as const, applied: 0, message: "That gift card was not found." };
  }

  const card = cards[index];
  if (getGiftCardStatus(card) !== "active") {
    return {
      ok: false as const,
      applied: 0,
      message:
        getGiftCardStatus(card) === "expired"
          ? "That gift card has expired."
          : "That gift card has already been used.",
    };
  }

  const applied = Math.max(0, Math.min(card.balance, Math.round(amount)));
  if (applied <= 0) {
    return { ok: false as const, applied: 0, message: "There is no balance left on that card." };
  }

  const balance = card.balance - applied;
  cards[index] = {
    ...card,
    balance,
    status: balance <= 0 ? "redeemed" : "active",
  };
  writeStoredCards(cards);

  return {
    ok: true as const,
    applied,
    balance,
    card: cards[index],
    message: `${formatBDT(applied)} applied from ${formatGiftCardCode(card.code)}.`,
  };
}

export function giftCardMessage(card: GiftCard) {
  return [
    `${card.senderName} sent you a Bengalot gift card.`,
    "",
    `Amount: ${formatBDT(card.amount)}`,
    `Code: ${card.code}`,
    `Expires: ${new Date(card.expiresAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    card.message ? `\n“${card.message}”` : "",
    "",
    "Redeem it at checkout on bengalot.com.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function giftCardDeliveryLink(card: GiftCard) {
  const text = encodeURIComponent(giftCardMessage(card));
  if (card.delivery === "whatsapp") {
    const digits = card.recipientContact.replace(/\D/g, "");
    const phone = digits.startsWith("880")
      ? digits
      : digits.startsWith("0")
        ? `88${digits}`
        : digits;
    return `https://wa.me/${phone}?text=${text}`;
  }
  return `mailto:${card.recipientContact}?subject=${encodeURIComponent(
    `${card.senderName} sent you a Bengalot gift card`
  )}&body=${text}`;
}
