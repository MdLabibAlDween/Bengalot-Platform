import "server-only";

import { cache } from "react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret } from "@/lib/admin/crypto";

export type StoreProfile = {
  brandName: string;
  legalName: string;
  tagline: string;
  address: string;
  whatsapp: string;
  supportEmail: string;
  infoEmail: string;
  currency: string;
  deliveryInside: number;
  deliveryOutside: number;
  socials: { facebook: string; instagram: string; youtube: string; tiktok: string };
};

export type FeatureFlags = {
  giftCards: boolean;
  reels: boolean;
  lookbook: boolean;
  offers: boolean;
  reviews: boolean;
  wishlist: boolean;
  darkMode: boolean;
  whatsapp: boolean;
  newsletter: boolean;
  search: boolean;
  trackOrder: boolean;
  account: boolean;
  sizeGuide: boolean;
  cod: boolean;
  bkash: boolean;
};

export type GiftCardSettings = {
  enabled: boolean;
  mode: "physical" | "virtual";
  virtualEnabled: boolean;
  denominations: number[];
  minAmount: number;
  maxAmount: number;
  expiryMonths: number;
  deliveryMethods: ("whatsapp" | "email")[];
  physicalNote: string;
  virtualNote: string;
};

export type HomepageSectionSetting = {
  key: string;
  label: string;
  enabled: boolean;
  sort: number;
};

export type HomepageControl = {
  sections: HomepageSectionSetting[];
  reels: {
    id: string;
    title: string;
    caption?: string;
    platform: "instagram" | "youtube" | "tiktok" | "file";
    videoUrl?: string;
    watchUrl?: string;
    posterUrl?: string;
    productSlug?: string;
    status: "draft" | "published";
    sort: number;
  }[];
};

export type InvoiceSettings = {
  senderName: string;
  senderEmail: string;
  replyTo: string;
  prefix: string;
  footer: string;
  redirectUrl: string;
  autoSend: boolean;
};

export type SeoSettings = {
  title: string;
  description: string;
  ogImage: string;
  analyticsId: string;
  pixelId: string;
};

export type IntegrationsConfig = {
  smtp: { enabled: boolean; host: string; port: number; secure: boolean; fromName: string; username: string };
  sms: {
    enabled: boolean;
    provider: "bulksmsbd" | "generic";
    senderId: string;
    apiUrl: string;
    authHeader: string;
    authPrefix: string;
  };
  steadfast: {
    enabled: boolean;
    autoBookOnConfirmed: boolean;
    webhookRequireSignature: boolean;
    defaultDeliveryType: 0 | 1;
  };
  bkash: { enabled: boolean; mode: "sandbox" | "live" };
  tawk: { enabled: boolean; propertyId: string; widgetId: string };
  discord: { enabled: boolean };
  /** Set only after Supabase Auth SMTP is configured in the Supabase server .env. */
  authEmailReady: boolean;
};

export type MediaSlot = {
  id: string;
  slot_key: string;
  label: string;
  group_label: string;
  url: string | null;
  alt: string | null;
  sort: number;
  is_active: boolean;
};

export type RedirectRule = {
  id: string;
  source_path: string;
  destination_url: string;
  status_code: number;
  enabled: boolean;
  note: string | null;
  sort: number;
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  giftCards: false,
  reels: true,
  lookbook: true,
  offers: true,
  reviews: true,
  wishlist: true,
  darkMode: false,
  whatsapp: true,
  newsletter: true,
  search: true,
  trackOrder: true,
  account: true,
  sizeGuide: true,
  cod: true,
  bkash: false,
};

export const DEFAULT_GIFT_CARD_SETTINGS: GiftCardSettings = {
  enabled: false,
  mode: "physical",
  virtualEnabled: false,
  denominations: [1000, 2000, 5000, 10000],
  minAmount: 500,
  maxAmount: 50000,
  expiryMonths: 12,
  deliveryMethods: ["whatsapp", "email"],
  physicalNote: "Physical gift card delivered with your order. Payment: Cash on Delivery.",
  virtualNote: "Pay online, then receive the gift card code instantly.",
};

export const DEFAULT_PAGE_VISIBILITY: Record<string, boolean> = {
  "/": true,
  "/shop": true,
  "/collections": true,
  "/lookbook": true,
  "/offers": true,
  "/gift-cards": false,
  "/about": true,
  "/contact": true,
  "/faq": true,
  "/track": true,
  "/wishlist": true,
  "/search": true,
  "/cart": true,
  "/checkout": true,
};

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  senderName: "Bengalot",
  senderEmail: "info@bengalot.com",
  replyTo: "support@bengalot.com",
  prefix: "BG",
  footer: "Thank you for shopping with Bengalot. Questions? support@bengalot.com",
  redirectUrl: "/order-success/{orderNo}",
  autoSend: false,
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  title: "Bengalot — Premium Fashion from Bengal",
  description: "Heirloom-inspired fashion from Bangladesh.",
  ogImage: "",
  analyticsId: "",
  pixelId: "",
};

export const DEFAULT_INTEGRATIONS: IntegrationsConfig = {
  smtp: {
    enabled: false,
    host: "",
    port: 587,
    secure: false,
    fromName: "Bengalot",
    username: "info@bengalot.com",
  },
  sms: {
    enabled: false,
    provider: "generic",
    senderId: "",
    apiUrl: "",
    authHeader: "Authorization",
    authPrefix: "Bearer",
  },
  steadfast: {
    enabled: false,
    autoBookOnConfirmed: false,
    webhookRequireSignature: false,
    defaultDeliveryType: 0,
  },
  bkash: { enabled: false, mode: "sandbox" },
  tawk: { enabled: false, propertyId: "", widgetId: "" },
  discord: { enabled: false },
  authEmailReady: false,
};

function adminOrThrow() {
  const admin = createAdminSupabaseClient();
  if (!admin) throw new Error("Supabase service role is not configured.");
  return admin;
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const admin = adminOrThrow();
    const { data, error } = await admin
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data?.value) return fallback;
    return data.value as T;
  } catch {
    return fallback;
  }
}

export async function getAllSettings() {
  try {
    const admin = adminOrThrow();
    const { data } = await admin
      .from("settings")
      .select("key,value,is_public,updated_at")
      .order("key");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function saveSetting(key: string, value: unknown, isPublic?: boolean) {
  const admin = adminOrThrow();
  const payload: Record<string, unknown> = { key, value };
  if (typeof isPublic === "boolean") payload.is_public = isPublic;
  const { error } = await admin
    .from("settings")
    .upsert(payload, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export async function getStoreProfile() {
  return getSetting<StoreProfile>("store_profile", {
    brandName: "Bengalot",
    legalName: "Bengalot",
    tagline: "Premium fashion from Bengal",
    address: "Saltha, Faridpur, Bangladesh",
    whatsapp: "01341739202",
    supportEmail: "support@bengalot.com",
    infoEmail: "info@bengalot.com",
    currency: "BDT",
    deliveryInside: 70,
    deliveryOutside: 130,
    socials: {
      facebook: "https://facebook.com/bengalot",
      instagram: "",
      youtube: "",
      tiktok: "",
    },
  });
}

export async function getFeatureFlags() {
  return getSetting<FeatureFlags>("feature_flags", DEFAULT_FEATURE_FLAGS);
}

export async function getPageVisibility() {
  return getSetting<Record<string, boolean>>("page_visibility", DEFAULT_PAGE_VISIBILITY);
}

export async function getGiftCardSettings() {
  return getSetting<GiftCardSettings>("gift_card_settings", DEFAULT_GIFT_CARD_SETTINGS);
}

export async function getHomepageControl() {
  return getSetting<HomepageControl>("homepage_control", {
    sections: [],
    reels: [],
  });
}

export async function getInvoiceSettings() {
  return getSetting<InvoiceSettings>("invoice_settings", DEFAULT_INVOICE_SETTINGS);
}

export async function getSeoSettings() {
  return getSetting<SeoSettings>("seo_settings", DEFAULT_SEO_SETTINGS);
}

export async function getIntegrationsConfig() {
  const stored = await getSetting<Partial<IntegrationsConfig>>("integrations_config", DEFAULT_INTEGRATIONS);
  return {
    ...DEFAULT_INTEGRATIONS,
    ...stored,
    smtp: { ...DEFAULT_INTEGRATIONS.smtp, ...(stored.smtp ?? {}) },
    sms: { ...DEFAULT_INTEGRATIONS.sms, ...(stored.sms ?? {}) },
    steadfast: { ...DEFAULT_INTEGRATIONS.steadfast, ...(stored.steadfast ?? {}) },
    bkash: { ...DEFAULT_INTEGRATIONS.bkash, ...(stored.bkash ?? {}) },
    tawk: { ...DEFAULT_INTEGRATIONS.tawk, ...(stored.tawk ?? {}) },
    discord: { ...DEFAULT_INTEGRATIONS.discord, ...(stored.discord ?? {}) },
  };
}

export type IntegrationSecrets = {
  smtpPassword?: string;
  smsApiKey?: string;
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  steadfastWebhookSecret?: string;
  bkashAppKey?: string;
  bkashAppSecret?: string;
  bkashUsername?: string;
  bkashPassword?: string;
  discordWebhookUrls?: string[];
};

export async function getIntegrationSecrets() {
  const encrypted = await getSetting<string | null>("integration_secrets", null);
  return decryptSecret<IntegrationSecrets>(encrypted) ?? {};
}

export async function getIntegrationSecretStatus() {
  const secrets = await getIntegrationSecrets();
  return {
    smtpPassword: Boolean(secrets.smtpPassword),
    smsApiKey: Boolean(secrets.smsApiKey),
    steadfastApiKey: Boolean(secrets.steadfastApiKey),
    steadfastSecretKey: Boolean(secrets.steadfastSecretKey),
    steadfastWebhookSecret: Boolean(secrets.steadfastWebhookSecret),
    bkashAppKey: Boolean(secrets.bkashAppKey),
    bkashAppSecret: Boolean(secrets.bkashAppSecret),
    bkashUsername: Boolean(secrets.bkashUsername),
    bkashPassword: Boolean(secrets.bkashPassword),
    discordWebhookUrls: Boolean(secrets.discordWebhookUrls?.length),
  };
}

export async function saveIntegrationSecrets(patch: IntegrationSecrets) {
  const current = await getIntegrationSecrets();
  const next: IntegrationSecrets = { ...current };
  for (const [key, value] of Object.entries(patch) as [keyof IntegrationSecrets, unknown][]) {
    if (value === undefined) continue;
    if (value === "" || value === null) continue;
    if (key === "discordWebhookUrls") {
      const urls = Array.isArray(value)
        ? value.map(String).map((url) => url.trim()).filter(Boolean)
        : [String(value).trim()].filter(Boolean);
      next.discordWebhookUrls = urls;
    } else if (typeof value === "string") {
      next[key] = value.trim();
    }
  }
  await saveSetting("integration_secrets", encryptSecret(next), false);
}

export async function getMediaSlots() {
  try {
    const admin = adminOrThrow();
    const { data } = await admin
      .from("admin_media")
      .select("*")
      .order("group_label")
      .order("sort");
    return (data ?? []) as MediaSlot[];
  } catch {
    return [];
  }
}

export async function getMediaMap() {
  const slots = await getMediaSlots();
  return Object.fromEntries(
    slots.filter((slot) => slot.is_active && slot.url).map((slot) => [slot.slot_key, slot.url!])
  ) as Record<string, string>;
}

export async function getRedirects() {
  try {
    const admin = adminOrThrow();
    const { data } = await admin
      .from("admin_redirects")
      .select("*")
      .order("sort")
      .order("source_path");
    return (data ?? []) as RedirectRule[];
  } catch {
    return [];
  }
}

export const getPublicSiteConfig = cache(async () => {
  const [profile, features, pages, giftCards, homepage, seo, media, rewards, integrations] = await Promise.all([
    getStoreProfile(),
    getFeatureFlags(),
    getPageVisibility(),
    getGiftCardSettings(),
    getHomepageControl(),
    getSeoSettings(),
    getMediaMap(),
    getSetting<{ enabled?: boolean }>("rewards_config", {}),
    getIntegrationsConfig(),
  ]);
  return {
    profile,
    features,
    pages,
    giftCards,
    homepage,
    seo,
    media,
    rewardsEnabled: rewards.enabled === true,
    tawk: {
      enabled: Boolean(
        integrations.tawk.enabled &&
          integrations.tawk.propertyId.trim() &&
          integrations.tawk.widgetId.trim()
      ),
      propertyId: integrations.tawk.propertyId,
      widgetId: integrations.tawk.widgetId,
    },
  };
});
