import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatter = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `৳${formatter.format(safeAmount)}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

export function normalizeBdPhone(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, "");
  const match = compact.match(/^(?:\+?880|0)(1[3-9]\d{8})$/);
  return match?.[1] ? `0${match[1]}` : null;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function slugToTitle(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
