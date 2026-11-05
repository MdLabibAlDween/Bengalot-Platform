import type { Order } from "./types";

const KEY = "bengalot-orders";

export function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalOrders().filter((o) => o.orderNo !== order.orderNo);
    localStorage.setItem(KEY, JSON.stringify([order, ...current]));
  } catch {
    /* storage unavailable */
  }
}

export function getLocalOrder(orderNo: string): Order | undefined {
  return getLocalOrders().find(
    (order) => order.orderNo.toLowerCase() === orderNo.toLowerCase()
  );
}

export function createOrderNo() {
  const date = new Date();
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  const code = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `BG-${y}${m}-${code}`;
}
