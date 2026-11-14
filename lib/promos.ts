import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PromoCode } from "@/lib/types";

export const PROMO_SETTINGS_KEY = "promo_codes";

const codePattern = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;

export type PromoEvaluation =
  | {
      ok: true;
      code: string;
      description: string;
      discount: number;
    }
  | { ok: false; message: string };

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
}

function normaliseCode(input: unknown): PromoCode | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Partial<PromoCode>;
  const code = cleanText(row.code, 32).toUpperCase();
  if (!codePattern.test(code)) return null;

  const type = row.type === "fixed" ? "fixed" : "percent";
  const rawValue = cleanNumber(row.value);
  const value =
    type === "percent" ? Math.min(Math.max(rawValue, 1), 100) : rawValue;

  return {
    code,
    description: cleanText(row.description, 160),
    type,
    value,
    minSubtotal: cleanNumber(row.minSubtotal),
    maxDiscount:
      type === "percent" && row.maxDiscount
        ? cleanNumber(row.maxDiscount)
        : null,
    active: row.active !== false,
    expiresAt: cleanText(row.expiresAt, 10) || null,
  };
}

export function normalisePromoCodes(value: unknown): PromoCode[] {
  if (!Array.isArray(value)) return [];

  const unique = new Map<string, PromoCode>();
  for (const candidate of value) {
    const promo = normaliseCode(candidate);
    if (!promo) continue;
    unique.set(promo.code, promo);
  }
  return [...unique.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export async function getPromoCodes() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", PROMO_SETTINGS_KEY)
    .maybeSingle();

  if (error) throw error;
  return normalisePromoCodes(data?.value);
}

export async function savePromoCodes(codes: PromoCode[]) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: PROMO_SETTINGS_KEY,
      value: codes,
      is_public: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) throw error;
}

function expiryTime(value: string | null) {
  if (!value) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(dateOnly ? `${value}T23:59:59+06:00` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

export function evaluatePromoCode(
  codes: PromoCode[],
  input: string,
  subtotal: number,
): PromoEvaluation {
  const code = input.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a promo code." };

  const promo = codes.find((item) => item.code === code);
  if (!promo || !promo.active) {
    return { ok: false, message: "That promo code is not available." };
  }

  const expiry = expiryTime(promo.expiresAt);
  if (expiry !== null && expiry < Date.now()) {
    return { ok: false, message: "That promo code has expired." };
  }

  if (subtotal < promo.minSubtotal) {
    return {
      ok: false,
      message: `This code needs a subtotal of at least ৳${promo.minSubtotal.toLocaleString("en-BD")}.`,
    };
  }

  const rawDiscount =
    promo.type === "percent"
      ? Math.round((subtotal * promo.value) / 100)
      : promo.value;
  const capped =
    promo.maxDiscount !== null
      ? Math.min(rawDiscount, promo.maxDiscount)
      : rawDiscount;
  const discount = Math.min(Math.max(capped, 0), subtotal);

  if (discount <= 0) {
    return { ok: false, message: "That promo code does not apply to this order." };
  }

  return {
    ok: true,
    code: promo.code,
    description: promo.description,
    discount,
  };
}
