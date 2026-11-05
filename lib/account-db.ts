import "server-only";

import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSetting } from "@/lib/admin/settings";
import { digitsOnly } from "@/lib/order-map";

export type RewardTier = { name: string; min: number; perk: string };

export type RewardDefinition = {
  key: string;
  label: string;
  points: number;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minSpend: number;
  description: string;
  expiresInDays: number;
};

export type RewardsConfig = {
  enabled: boolean;
  pointsPerHundred: number;
  reviewPoints: number;
  signupPoints: number;
  tiers: RewardTier[];
  rewards: RewardDefinition[];
};

export const DEFAULT_REWARDS_CONFIG: RewardsConfig = {
  enabled: false,
  pointsPerHundred: 1,
  reviewPoints: 50,
  signupPoints: 0,
  tiers: [
    { name: "Silver", min: 0, perk: "Birthday offer and early access" },
    { name: "Gold", min: 1000, perk: "Free exchanges and a ৳100 birthday credit" },
    { name: "Royal", min: 2000, perk: "Private previews and complimentary delivery" },
  ],
  rewards: [
    {
      key: "delivery",
      label: "Complimentary delivery",
      points: 300,
      type: "shipping",
      value: 0,
      minSpend: 0,
      description: "One order, any district",
      expiresInDays: 90,
    },
    {
      key: "credit-100",
      label: "৳100 off",
      points: 500,
      type: "fixed",
      value: 100,
      minSpend: 1500,
      description: "Any order over ৳1,500",
      expiresInDays: 90,
    },
    {
      key: "credit-500",
      label: "৳500 off",
      points: 2000,
      type: "fixed",
      value: 500,
      minSpend: 4000,
      description: "Any order over ৳4,000",
      expiresInDays: 90,
    },
  ],
};

export async function getRewardsConfig() {
  const stored = await getSetting<Partial<RewardsConfig>>("rewards_config", {});
  return {
    ...DEFAULT_REWARDS_CONFIG,
    ...stored,
    tiers:
      Array.isArray(stored.tiers) && stored.tiers.length > 0
        ? stored.tiers
        : DEFAULT_REWARDS_CONFIG.tiers,
    rewards:
      Array.isArray(stored.rewards) && stored.rewards.length > 0
        ? stored.rewards
        : DEFAULT_REWARDS_CONFIG.rewards,
  };
}

export function tierFor(points: number, tiers: RewardTier[]) {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  const current = [...sorted].reverse().find((tier) => points >= tier.min) ?? sorted[0];
  const next = sorted.find((tier) => tier.min > points);
  return { current, next, sorted };
}

export async function resolveProfileId(
  admin: SupabaseClient,
  input: { email?: string | null; phone?: string | null }
) {
  const email = input.email?.trim().toLowerCase();
  const phone = digitsOnly(input.phone ?? "");
  if (email) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (data?.id) return String(data.id);
  }
  if (phone) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (data?.id) return String(data.id);
    const { data: fallback } = await admin
      .from("profiles")
      .select("id")
      .ilike("phone", `%${phone.slice(-10)}`)
      .maybeSingle();
    if (fallback?.id) return String(fallback.id);
  }
  return null;
}

export async function notifyProfile(
  admin: SupabaseClient,
  profileId: string,
  input: {
    kind: "order" | "account" | "offer" | "review" | "reward" | "gift_card" | "system";
    title: string;
    body?: string;
    href?: string;
    dedupeKey?: string;
  }
) {
  const { error } = await admin.from("customer_notifications").insert({
    profile_id: profileId,
    kind: input.kind,
    title: input.title,
    body: input.body ?? null,
    href: input.href ?? null,
    dedupe_key: input.dedupeKey ?? null,
  });
  // 23505 means this notification has already been written for this event.
  if (error && error.code !== "23505") return { ok: false as const, error: error.message };
  return { ok: true as const };
}

const ORDER_COPY: Record<string, { title: string; body: string }> = {
  Pending: {
    title: "We have your order",
    body: "Your order is in. We will confirm it shortly and keep you posted here.",
  },
  Confirmed: {
    title: "Your order is confirmed",
    body: "Thank you — we have confirmed your order and will begin preparing it.",
  },
  Processing: {
    title: "We are preparing your order",
    body: "Your pieces are being checked and packed with care.",
  },
  "Handed to Courier": {
    title: "Your parcel is on its way",
    body: "Your order has been handed to our delivery partner.",
  },
  "In Transit": {
    title: "Your order is moving",
    body: "Your parcel is travelling to your district. Keep an eye on your phone.",
  },
  Delivered: {
    title: "Delivered — thank you",
    body: "Your order has arrived. We hope it feels right. You can review it from your account.",
  },
  Returning: {
    title: "Your parcel is coming back",
    body: "The courier could not complete delivery. The parcel is on its way back to us and our team will contact you.",
  },
  Cancelled: {
    title: "Your order was cancelled",
    body: "This order has been cancelled. Any gift-card balance used has been returned.",
  },
  Returned: {
    title: "Your return is complete",
    body: "We have recorded your return. Any gift-card balance used has been returned.",
  },
  "Failed Delivery": {
    title: "Delivery could not be completed",
    body: "The courier could not complete delivery. Contact us and we will arrange the next step.",
  },
  Refunded: {
    title: "Your refund is recorded",
    body: "This order has been marked refunded. Contact us if you need the details.",
  },
};

export async function notifyOrderStatus(
  admin: SupabaseClient,
  order: { order_no: string; customer?: string | null; email?: string | null; phone?: string | null },
  status: string
) {
  const profileId = await resolveProfileId(admin, {
    email: order.email,
    phone: order.phone,
  });
  if (!profileId) return;
  const copy = ORDER_COPY[status] ?? {
    title: `Order ${status.toLowerCase()}`,
    body: "There is an update on your order. Open it to see the latest status.",
  };
  await notifyProfile(admin, profileId, {
    kind: "order",
    title: copy.title,
    body: copy.body,
    href: `/account/orders/${order.order_no}`,
    dedupeKey: `order:${order.order_no}:${status}`,
  });
}

export async function awardReward(
  admin: SupabaseClient,
  input: {
    profileId: string;
    kind: "order" | "review" | "signup" | "adjustment" | "redemption" | "bonus";
    points: number;
    reference?: string;
    note?: string;
  }
) {
  if (!Number.isFinite(input.points) || input.points === 0) return { ok: true as const };
  const { error } = await admin.from("reward_ledger").insert({
    profile_id: input.profileId,
    kind: input.kind,
    points: Math.round(input.points),
    reference: input.reference ?? null,
    note: input.note ?? null,
  });
  if (error && error.code !== "23505") {
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const, alreadyAwarded: error?.code === "23505" };
}

export async function getRewardBalance(admin: SupabaseClient, profileId: string) {
  const { data, error } = await admin
    .from("reward_ledger")
    .select("points")
    .eq("profile_id", profileId);
  if (error) return 0;
  return (data ?? []).reduce((sum, row) => sum + Number(row.points ?? 0), 0);
}

export async function awardOrderPoints(
  admin: SupabaseClient,
  order: {
    order_no: string;
    total: number;
    email?: string | null;
    phone?: string | null;
  }
) {
  const config = await getRewardsConfig();
  if (!config.enabled) return;
  const profileId = await resolveProfileId(admin, {
    email: order.email,
    phone: order.phone,
  });
  if (!profileId) return;
  const points = Math.floor(Number(order.total) / 100) * config.pointsPerHundred;
  if (points <= 0) return;
  const result = await awardReward(admin, {
    profileId,
    kind: "order",
    points,
    reference: order.order_no,
    note: `Earned on delivered order ${order.order_no}`,
  });
  if (result.ok && !("alreadyAwarded" in result && result.alreadyAwarded)) {
    await notifyProfile(admin, profileId, {
      kind: "reward",
      title: `${points} reward points added`,
      body: `Your order ${order.order_no} was delivered. Points are ready to use.`,
      href: "/account/rewards",
      dedupeKey: `reward:order:${order.order_no}`,
    });
  }
}

export async function awardReviewPoints(
  admin: SupabaseClient,
  input: { profileId: string | null; reviewId: string; title: string }
) {
  if (!input.profileId) return;
  const config = await getRewardsConfig();
  if (!config.enabled || config.reviewPoints <= 0) return;
  const result = await awardReward(admin, {
    profileId: input.profileId,
    kind: "review",
    points: config.reviewPoints,
    reference: input.reviewId,
    note: "Verified review approved",
  });
  if (result.ok && !("alreadyAwarded" in result && result.alreadyAwarded)) {
    await notifyProfile(admin, input.profileId, {
      kind: "review",
      title: "Your review is live",
      body: `“${input.title}” is now published. ${config.reviewPoints} points were added to your account.`,
      href: "/account/reviews",
      dedupeKey: `review:approved:${input.reviewId}`,
    });
  }
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

export async function issueRewardCoupon(
  admin: SupabaseClient,
  input: { profileId: string; reward: RewardDefinition }
) {
  let code = "";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = `BG-REWARD-${randomCode()}`;
    const { data } = await admin.from("coupons").select("id").eq("code", candidate).maybeSingle();
    if (!data) {
      code = candidate;
      break;
    }
  }
  if (!code) return { ok: false as const, error: "Could not create a reward code. Try again." };

  const expires = new Date();
  expires.setDate(expires.getDate() + Math.max(7, Number(input.reward.expiresInDays || 90)));
  const { data, error } = await admin
    .from("coupons")
    .insert({
      code,
      title: input.reward.label,
      description: input.reward.description,
      type: input.reward.type,
      value: input.reward.type === "shipping" ? 0 : Math.max(0, Number(input.reward.value)),
      min_spend: Math.max(0, Number(input.reward.minSpend)),
      expires_at: expires.toISOString().slice(0, 10),
      status: "active",
      is_demo: false,
      profile_id: input.profileId,
      is_reward: true,
      reward_points: input.reward.points,
    })
    .select("code")
    .single();
  if (error || !data) return { ok: false as const, error: error?.message ?? "Could not issue the reward." };
  return { ok: true as const, code: String(data.code) };
}
