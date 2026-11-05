/**
 * Store settings bridge.
 *
 * These are the defaults used by the credential-free preview. When the
 * Supabase settings table is connected, this object should be hydrated from
 * `store_settings` (see supabase/migrations/20261102000400_audience_demo_settings.sql
 * and 20261103000200_homepage_content.sql).
 *
 * Copy rules for the home page:
 * - Every customer-facing line comes from this file or `lib/homepage.ts`.
 * - Free-delivery and exchange-window messages are OFF unless enabled here.
 * - There are no member counts, fixed countdowns or invented statistics.
 */
export const STORE_SETTINGS = {
  freeDeliveryEnabled: false,
  freeDeliveryThreshold: 5000,
  // Local previews keep the demo catalogue visible. The database default is
  // ON so a production launch hides demo rows until real content is added.
  hideDemoContent: false,
  showComingSoonCategories: false,
  deliveryInside: 70,
  deliveryOutside: 130,
  deliveryTimeInside: "1–2 days",
  deliveryTimeOutside: "2–4 days",
  codEnabled: true,
  inspectBeforePaying: false,
  orderCutoff: "2pm",
  policyUpdated: "3 November 2026",
  exchangeWindowEnabled: false,
  exchangeWindowDays: 0,
  returnCostRule: "",
  damageReportWindowDays: 0,
  supportHours: "",
  sealText: "Saltha, Faridpur",
  replyTime: "",
  loyaltyEnabled: false,
  loyaltyCredit: 0,

  /** Admin-managed announcement bar messages. Empty array hides the bar. */
  announcementMessages: [
    "Cash on Delivery · ৳70 Faridpur · ৳130 outside",
  ],
  trustItems: [
    "Cash on Delivery",
    "Quality Checked",
    "Delivery across Bangladesh",
    "WhatsApp Support",
  ],

  newsletter: {
    enabled: true,
    eyebrow: "Newsletter",
    heading: "Stay in the loop.",
    accent: "loop.",
    body: "New collections and occasional studio notes, straight to your inbox.",
    buttonLabel: "Subscribe",
    note: "No noise. Unsubscribe anytime.",
  },

  socials: {
    facebook: "https://facebook.com/bengalot",
    instagram: "",
    youtube: "",
    tiktok: "",
  },
} as const;

export const FREE_DELIVERY_ENABLED = STORE_SETTINGS.freeDeliveryEnabled;
export const FREE_DELIVERY_THRESHOLD = STORE_SETTINGS.freeDeliveryThreshold;

export function deliveryLine() {
  return `Cash on Delivery · Delivery ৳${STORE_SETTINGS.deliveryInside} inside Faridpur, ৳${STORE_SETTINGS.deliveryOutside} outside`;
}

export function deliveryNotice() {
  return `Delivery ৳${STORE_SETTINGS.deliveryInside} inside Faridpur · ৳${STORE_SETTINGS.deliveryOutside} outside`;
}

export function exchangeNotice() {
  if (!STORE_SETTINGS.exchangeWindowEnabled || STORE_SETTINGS.exchangeWindowDays <= 0) {
    return "";
  }
  return `${STORE_SETTINGS.exchangeWindowDays}-day exchange`;
}

export function freeDeliveryNotice() {
  if (!STORE_SETTINGS.freeDeliveryEnabled) return "";
  return `Free delivery over ৳${STORE_SETTINGS.freeDeliveryThreshold.toLocaleString("en-US")}`;
}
