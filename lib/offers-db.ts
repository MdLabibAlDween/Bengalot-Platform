import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  OFFER_CAMPAIGNS,
  isDemoVisible,
  type OfferCampaign,
} from "@/lib/homepage";
import { coupons as demoCoupons } from "@/lib/data";
import type { Coupon } from "@/lib/types";

type CouponRow = {
  code: string;
  title: string;
  description: string | null;
  type: Coupon["type"];
  value: number;
  min_spend: number;
  expires_at: string | null;
  status: string;
  is_demo: boolean;
  product_slugs: string[] | null;
};

type CampaignRow = {
  id: string;
  eyebrow: string;
  title: string;
  accent_word: string | null;
  description: string;
  coupon_code: string;
  cta_label: string;
  cta_href: string;
  starts_at: string;
  ends_at: string | null;
  status: OfferCampaign["status"];
  theme: OfferCampaign["theme"];
  sort: number;
  is_demo: boolean;
};

export function mapCouponRow(row: CouponRow): Coupon {
  return {
    code: row.code,
    title: row.title,
    description: row.description ?? "",
    type: row.type,
    value: Number(row.value),
    minSpend: Number(row.min_spend),
    expires: row.expires_at ? String(row.expires_at).slice(0, 10) : "",
    tone: row.type === "shipping" ? "teal" : row.type === "fixed" ? "indigo" : "magenta",
    isDemo: Boolean(row.is_demo),
    productSlugs: Array.isArray(row.product_slugs) ? row.product_slugs.filter(Boolean) : [],
  };
}

export function mapCampaignRow(row: CampaignRow): OfferCampaign {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    title: row.title,
    accentWord: row.accent_word ?? undefined,
    description: row.description,
    couponCode: row.coupon_code,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    startAt: row.starts_at,
    endAt: row.ends_at ?? undefined,
    status: row.status,
    theme: row.theme,
    isDemo: Boolean(row.is_demo),
    sort: Number(row.sort ?? 0),
  };
}

export async function getLiveCoupons(): Promise<Coupon[]> {
  const admin = createAdminSupabaseClient();
  if (!admin) return demoCoupons;
  const { data, error } = await admin
    .from("coupons")
    .select("code,title,description,type,value,min_spend,expires_at,status,is_demo,product_slugs")
    .eq("status", "active")
    .is("profile_id", null)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return demoCoupons;
  return (data ?? []).map((row) => mapCouponRow(row as CouponRow));
}

export async function getOfferCampaigns(): Promise<OfferCampaign[]> {
  const admin = createAdminSupabaseClient();
  if (!admin) return [];
  const { data, error } = await admin
    .from("offer_campaigns")
    .select(
      "id,eyebrow,title,accent_word,description,coupon_code,cta_label,cta_href,starts_at,ends_at,status,theme,sort,is_demo"
    )
    .order("sort", { ascending: true })
    .order("starts_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((row) => mapCampaignRow(row as CampaignRow));
}

function pickActiveCampaign(campaigns: OfferCampaign[], now: Date) {
  return campaigns
    .filter((campaign) => {
      if (campaign.status !== "published" || !isDemoVisible(campaign.isDemo)) return false;
      const start = new Date(campaign.startAt).getTime();
      const end = campaign.endAt
        ? new Date(campaign.endAt).getTime()
        : Number.POSITIVE_INFINITY;
      return now.getTime() >= start && now.getTime() <= end;
    })
    .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt))[0];
}

export async function getActiveOffer(now = new Date()): Promise<{
  campaign?: OfferCampaign;
  coupon?: Coupon;
}> {
  const [campaigns, liveCoupons] = await Promise.all([
    getOfferCampaigns(),
    getLiveCoupons(),
  ]);
  const source = campaigns.length > 0 ? campaigns : OFFER_CAMPAIGNS;
  const campaign = pickActiveCampaign(source, now);
  if (!campaign) return {};
  return {
    campaign,
    coupon: liveCoupons.find((coupon) => coupon.code === campaign.couponCode),
  };
}
