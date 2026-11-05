import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number, opts?: { compact?: boolean }) {
  if (opts?.compact && amount >= 100000) {
    return `৳${(amount / 100000).toFixed(1)}L`;
  }
  return `৳${Math.round(amount).toLocaleString("en-US")}`;
}

export function discountedPrice(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(value: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

import {
  FREE_DELIVERY_ENABLED,
  FREE_DELIVERY_THRESHOLD,
  STORE_SETTINGS,
} from "./settings";

export const HOME_DISTRICT = "Faridpur";
export const DELIVERY_INSIDE = STORE_SETTINGS.deliveryInside;
export const DELIVERY_OUTSIDE = STORE_SETTINGS.deliveryOutside;
export { FREE_DELIVERY_ENABLED, FREE_DELIVERY_THRESHOLD };

export function deliveryChargeFor(
  district: string | undefined,
  inside: number = DELIVERY_INSIDE,
  outside: number = DELIVERY_OUTSIDE
) {
  if (!district) return outside;
  return district === HOME_DISTRICT ? inside : outside;
}

export function isFreeDelivery(subtotal: number, district?: string) {
  if (!FREE_DELIVERY_ENABLED) return false;
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return true;
  return false;
}

export function safeNumber(value: number | string | undefined, fallback = 0) {
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n as number) ? (n as number) : fallback;
}

/** Serialize JSON-LD without allowing `</script>` to close the tag. */
export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
