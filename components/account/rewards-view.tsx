"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Gift,
  Sparkles,
  Star,
  TicketPercent,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { JamdaniField, SealStamp } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";
import { AccountHeading } from "./account-heading";
import { cn, formatBDT } from "@/lib/utils";

type Tier = { name: string; min: number; perk: string };
type Reward = {
  key: string;
  label: string;
  points: number;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minSpend: number;
  description: string;
  expiresInDays: number;
  affordable: boolean;
};
type LedgerRow = {
  id: string;
  kind: string;
  points: number;
  reference: string | null;
  note: string | null;
  created_at: string;
};
type RewardCoupon = {
  code: string;
  title: string;
  description: string | null;
  type: "percent" | "fixed" | "shipping";
  value: number;
  min_spend: number;
  expires_at: string | null;
  status: string;
};

type Payload = {
  config: {
    enabled: boolean;
    pointsPerHundred: number;
    reviewPoints: number;
    tiers: Tier[];
    rewards: Omit<Reward, "affordable">[];
  };
  points: number;
  tier: Tier;
  next: Tier | null;
  ledger: LedgerRow[];
  rewards: Reward[];
  coupons: RewardCoupon[];
};

function when(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function rewardNote(reward: Reward) {
  if (reward.type === "shipping") return "Free delivery on one order";
  if (reward.type === "percent") return `${reward.value}% off · minimum ${formatBDT(reward.minSpend)}`;
  return `${formatBDT(reward.value)} off · minimum ${formatBDT(reward.minSpend)}`;
}

export function RewardsView() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/account/rewards", { cache: "no-store" });
    if (!response.ok) return;
    const result = await response.json().catch(() => null);
    if (result) setData(result);
  };

  useEffect(() => {
    let active = true;
    void fetch("/api/account/rewards", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json().catch(() => null);
        if (active && result) setData(result);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const progress = useMemo(() => {
    if (!data) return 0;
    if (!data.next) return 100;
    const span = Math.max(1, data.next.min - data.tier.min);
    return Math.min(100, Math.max(0, ((data.points - data.tier.min) / span) * 100));
  }, [data]);

  const redeem = async (reward: Reward) => {
    if (!reward.affordable) return;
    if (!window.confirm(`Redeem ${reward.points} points for ${reward.label}?`)) return;
    setRedeeming(reward.key);
    const response = await fetch("/api/account/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardKey: reward.key }),
    });
    const result = await response.json().catch(() => ({}));
    setRedeeming(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not redeem that reward.");
      return;
    }
    toast.success("Reward code created", {
      description: `${result.code} · your points balance is now ${Number(result.points).toLocaleString("en-US")}.`,
    });
    await load();
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success("Reward code copied");
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error(code);
    }
  };

  if (loading) {
    return (
      <div>
        <AccountHeading eyebrow="A little more" title="Rewards" description="Loading your points…" />
        <div className="h-52 animate-pulse rounded-[24px] bg-[var(--muted)]" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-28 animate-pulse rounded-2xl bg-[var(--muted)]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.config.enabled) {
    return (
      <div>
        <AccountHeading
          eyebrow="Coming soon"
          title="Rewards"
          description="The loyalty programme is not active yet. When it opens, real points and rewards will appear here."
        />
        <div className="rounded-2xl border border-dashed border-gold/35 bg-gold/[0.05] px-6 py-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/30 text-gold">
            <Gift className="h-6 w-6" strokeWidth={1.3} />
          </span>
          <p className="mt-4 font-display text-2xl">Nothing to claim yet.</p>
          <p className="mx-auto mt-2 max-w-md text-[0.75rem] leading-relaxed text-muted-foreground">
            Rewards will be enabled once the programme is ready. No points, tiers or credit
            are being offered in the meantime.
          </p>
        </div>
      </div>
    );
  }

  const redemptionHistory = data.ledger.filter((row) => row.kind === "redemption");

  return (
    <div>
      <AccountHeading
        eyebrow="A little more"
        title="Rewards"
        description="Points add up on delivered orders and approved reviews. Redeem them for a real code you can use at checkout."
      />

      <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(120deg,var(--color-indigo)_0%,var(--color-indigo)_55%,var(--color-magenta)_100%)] p-6 text-ivory sm:p-8">
        <JamdaniField id="rewards-hero" color="var(--color-saffron)" opacity={0.15} size={56} />
        <SealStamp
          size={180}
          className="stamp-spin absolute -bottom-12 right-4 hidden opacity-20 md:block"
          text="THE ROYAL CIRCLE · BENGALOT · SALTHA · FARIDPUR · "
        />
        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow text-indigo">{data.tier.name} member</p>
            <div className="mt-3 flex items-end gap-3">
              <p className="font-display text-[4.5rem] leading-none text-ivory">
                {data.points.toLocaleString("en-US")}
              </p>
              <p className="mb-2 text-[0.8rem] text-ivory/45">points</p>
            </div>
            <div className="mt-5 max-w-md">
              <div className="flex items-center justify-between text-[0.56rem] text-ivory/50">
                <span>{data.tier.name}</span>
                <span>
                  {data.next
                    ? `${Math.max(0, data.next.min - data.points).toLocaleString("en-US")} points to ${data.next.name}`
                    : "Highest tier reached"}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ivory/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-saffron)] to-[var(--color-gold-ink)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-ivory/15 bg-ivory/[0.06] px-4 py-2 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-ivory/60">
              {data.rewards.filter((reward) => reward.affordable).length} rewards ready
            </span>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-gold">
              {data.tier.perk}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {data.config.tiers.map((tier) => {
          const current = tier.name === data.tier.name;
          return (
            <div
              key={tier.name}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-5",
                current
                  ? "border-gold/50 bg-gold/[0.05]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              )}
            >
              {current && (
                <span className="absolute right-3 top-3 rounded-full bg-gold px-2 py-0.5 text-[0.44rem] font-bold uppercase tracking-[0.08em] text-midnight">
                  You are here
                </span>
              )}
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.18em] text-gold">
                {tier.name}
              </p>
              <p className="mt-1 font-display text-lg leading-tight">
                {tier.min.toLocaleString("en-US")}+ points
              </p>
              <p className="mt-2 text-[0.64rem] leading-relaxed text-muted-foreground">
                {tier.perk}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Ways to earn
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Gift,
                title: "Shop",
                text: `Earn ${data.config.pointsPerHundred} point${data.config.pointsPerHundred === 1 ? "" : "s"} for every ৳100 spent, when an order is delivered.`,
              },
              {
                icon: Star,
                title: "Review",
                text: `Earn ${data.config.reviewPoints} points when an approved review is published.`,
              },
              {
                icon: Sparkles,
                title: "Celebrate",
                text: "Occasional birthday and seasonal points, added by the house.",
              },
              {
                icon: Truck,
                title: "Keep it simple",
                text: "Points are added automatically — no code to remember.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[0.68rem] font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-[0.6rem] leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Redeem your points
          </p>
          <div className="mt-4 space-y-2.5">
            {data.rewards.map((reward) => (
              <div
                key={reward.key}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3",
                  reward.affordable ? "border-gold/40" : "border-[var(--border)]"
                )}
              >
                <div className="min-w-0">
                  <p className="text-[0.7rem] font-semibold">{reward.label}</p>
                  <p className="text-[0.56rem] text-muted-foreground">{rewardNote(reward)}</p>
                </div>
                <button
                  type="button"
                  disabled={!reward.affordable || redeeming === reward.key}
                  onClick={() => void redeem(reward)}
                  className={cn(
                    "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.52rem] font-bold uppercase tracking-[0.08em] transition",
                    reward.affordable
                      ? "bg-midnight text-ivory hover:bg-royal"
                      : "cursor-not-allowed bg-[var(--muted)] text-muted-foreground opacity-60"
                  )}
                >
                  <TicketPercent className="h-3 w-3" />
                  {redeeming === reward.key ? "Creating…" : `${reward.points.toLocaleString("en-US")} pts`}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[0.56rem] leading-relaxed text-muted-foreground">
            Redeeming creates a one-use coupon code for your account. Codes are valid for 90
            days and can be used once at checkout.
          </p>
        </div>
      </div>

      {data.coupons.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold">
                Reward codes
              </p>
              <h2 className="mt-1 font-display text-xl">Ready to use</h2>
            </div>
            <Link
              href="/account/coupons"
              className="text-[0.54rem] font-bold uppercase tracking-[0.1em] text-indigo hover:underline"
            >
              All coupons
            </Link>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2">
            {data.coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3"
              >
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold">{coupon.title}</p>
                  <p className="font-mono text-[0.62rem] tracking-[0.06em] text-indigo">
                    {coupon.code}
                  </p>
                  <p className="mt-0.5 text-[0.52rem] text-muted-foreground">
                    {coupon.status === "active" ? "Active" : coupon.status}
                    {coupon.expires_at ? ` · until ${when(coupon.expires_at)}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copy(coupon.code)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground transition hover:border-indigo hover:text-indigo"
                  aria-label="Copy reward code"
                >
                  {copied === coupon.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Activity
            </p>
            <h2 className="mt-1 font-display text-xl">Points ledger</h2>
          </div>
          <span className="text-[0.54rem] uppercase tracking-[0.1em] text-muted-foreground">
            {data.ledger.length} entries
          </span>
        </div>
        {data.ledger.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Star className="mx-auto h-6 w-6 text-muted-foreground/35" />
            <p className="mt-3 font-display text-xl">No points yet.</p>
            <p className="mt-1 text-[0.64rem] text-muted-foreground">
              Points appear when a delivered order or approved review is recorded.
            </p>
          </div>
        ) : (
          <div className="max-h-[360px] divide-y divide-[var(--border)] overflow-y-auto">
            {data.ledger.map((row) => (
              <div key={row.id} className="flex items-center gap-3 px-5 py-3">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                    row.points >= 0 ? "bg-jade/10 text-jade" : "bg-rosewood/10 text-rosewood"
                  )}
                >
                  {row.points >= 0 ? <Sparkles className="h-3.5 w-3.5" /> : <TicketPercent className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.66rem] font-medium">
                    {row.note ?? row.kind.replace(/_/g, " ")}
                  </p>
                  <p className="text-[0.52rem] uppercase tracking-[0.06em] text-muted-foreground">
                    {when(row.created_at)}
                    {row.reference ? ` · ${row.reference}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-[0.72rem] font-semibold tabular-nums",
                    row.points >= 0 ? "text-jade" : "text-rosewood"
                  )}
                >
                  {row.points >= 0 ? "+" : ""}
                  {row.points.toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        <p className="flex items-center gap-2 text-[0.6rem] text-muted-foreground">
          <Truck className="h-3.5 w-3.5 text-gold" /> Points are added after delivery, once
          the order is marked Delivered.
        </p>
        <p className="text-[0.56rem] text-muted-foreground">
          {redemptionHistory.length} reward{redemptionHistory.length === 1 ? "" : "s"} redeemed
        </p>
      </div>
    </div>
  );
}
