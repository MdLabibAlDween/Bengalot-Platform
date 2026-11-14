import type { StoreSettings } from "@/lib/types";

export const defaultSettings: StoreSettings = {
  name: "Bengalot",
  slogan: "Bring a lot to learning.",
  announcement:
    "Free delivery over ৳2,000 · Digital access after payment",
  whatsapp: "01341739202",
  supportEmail: "support@bengalot.com",
  city: "Saltha, Faridpur",
  deliveryInside: 70,
  deliveryOutside: 130,
  freeDeliveryThreshold: 2000,
  currency: "BDT",
};

function numberOr(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function normaliseSettings(value: unknown): StoreSettings {
  if (!value || typeof value !== "object") return defaultSettings;

  const input = value as Partial<StoreSettings>;
  return {
    name: typeof input.name === "string" && input.name ? input.name : defaultSettings.name,
    slogan:
      typeof input.slogan === "string" && input.slogan
        ? input.slogan
        : defaultSettings.slogan,
    announcement:
      typeof input.announcement === "string"
        ? input.announcement
        : defaultSettings.announcement,
    whatsapp:
      typeof input.whatsapp === "string" && input.whatsapp
        ? input.whatsapp
        : defaultSettings.whatsapp,
    supportEmail:
      typeof input.supportEmail === "string" && input.supportEmail
        ? input.supportEmail
        : defaultSettings.supportEmail,
    city: typeof input.city === "string" && input.city ? input.city : defaultSettings.city,
    deliveryInside: numberOr(input.deliveryInside, defaultSettings.deliveryInside),
    deliveryOutside: numberOr(input.deliveryOutside, defaultSettings.deliveryOutside),
    freeDeliveryThreshold: numberOr(
      input.freeDeliveryThreshold,
      defaultSettings.freeDeliveryThreshold,
    ),
    currency:
      typeof input.currency === "string" && input.currency
        ? input.currency
        : defaultSettings.currency,
  };
}
