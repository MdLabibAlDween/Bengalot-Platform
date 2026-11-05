import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, TicketPercent } from "lucide-react";
import { AccountHeading } from "@/components/account/account-heading";
import { CouponCard } from "@/components/storefront/coupon-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getRewardsConfig } from "@/lib/account-db";
import type { Coupon } from "@/lib/types";

export const metadata: Metadata = {
  title: "My coupons",
  robots: { index: false, follow: false },
};

function mapCoupon(row: Record<string, unknown>): Coupon {
  return {
    code: String(row.code),
    title: String(row.title),
    description: String(row.description ?? ""),
    type: row.type as Coupon["type"],
    value: Number(row.value),
    minSpend: Number(row.min_spend),
    expires: row.expires_at ? String(row.expires_at).slice(0, 10) : "",
    tone: row.type === "shipping" ? "teal" : row.type === "fixed" ? "indigo" : "magenta",
    isDemo: Boolean(row.is_demo),
    productSlugs: Array.isArray(row.product_slugs) ? (row.product_slugs as string[]) : [],
  };
}

export default async function AccountCouponsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const admin = createAdminSupabaseClient();
  const rewardsEnabled = (await getRewardsConfig()).enabled;
  const [publicResponse, personalResponse] = admin
    ? await Promise.all([
        admin
          .from("coupons")
          .select("code,title,description,type,value,min_spend,expires_at,is_demo,is_reward,product_slugs")
          .eq("status", "active")
          .is("profile_id", null)
          .order("created_at", { ascending: false })
          .limit(50),
        user
          ? admin
              .from("coupons")
              .select("code,title,description,type,value,min_spend,expires_at,is_demo,is_reward,product_slugs")
              .eq("status", "active")
              .eq("profile_id", user.id)
              .order("created_at", { ascending: false })
              .limit(50)
          : Promise.resolve({ data: [] }),
      ])
    : [{ data: [] }, { data: [] }];

  const now = Date.now();
  const valid = (row: Record<string, unknown>) => {
    if (!row.expires_at) return true;
    const expiry = new Date(`${String(row.expires_at).slice(0, 10)}T23:59:59`).getTime();
    return Number.isNaN(expiry) || expiry >= now;
  };
  const personal = (personalResponse.data ?? [])
    .filter(valid)
    .filter((row) => rewardsEnabled || row.is_reward !== true)
    .map(mapCoupon);
  const publicCoupons = (publicResponse.data ?? []).filter(valid).map(mapCoupon);

  return (
    <div>
      <AccountHeading
        eyebrow="A little extra"
        title="Your coupons"
        description={
          rewardsEnabled
            ? "Private reward codes and live offers, all in one place. One code per order — we keep the fine print fair."
            : "Live offers and private codes, all in one place. One code per order — we keep the fine print fair."
        }
        action={
          <Link
            href="/offers"
            className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] transition hover:border-gold hover:text-gold"
          >
            All offers <ArrowUpRight className="h-3 w-3" />
          </Link>
        }
      />

      {personal.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold">
                {rewardsEnabled ? "Reward codes" : "Private codes"}
              </p>
              <h2 className="mt-1 font-display text-xl">Earned by you</h2>
            </div>
            {rewardsEnabled && (
              <Link
                href="/account/rewards"
                className="text-[0.52rem] font-bold uppercase tracking-[0.08em] text-indigo hover:underline"
              >
                Rewards →
              </Link>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {personal.map((coupon) => (
              <CouponCard key={coupon.code} coupon={coupon} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {publicCoupons.map((coupon) => (
          <CouponCard key={coupon.code} coupon={coupon} />
        ))}

        {publicCoupons.length === 0 && personal.length === 0 && (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/40 p-6 text-center md:col-span-2 xl:col-span-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--line-strong)] text-muted-foreground">
              <TicketPercent className="h-5 w-5" strokeWidth={1.4} />
            </span>
            <p className="mt-3 font-display text-xl">No live coupons right now.</p>
            <p className="mt-1 max-w-sm text-[0.65rem] leading-relaxed text-muted-foreground">
              {rewardsEnabled
                ? "Check the offers page for current campaigns, or redeem reward points for a personal code."
                : "Check the offers page for current campaigns and limited-time savings."}
            </p>
          </div>
        )}

        {rewardsEnabled && (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/40 p-6 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--line-strong)] text-muted-foreground">
              <TicketPercent className="h-5 w-5" strokeWidth={1.4} />
            </span>
            <p className="mt-3 font-display text-xl">More ways to save</p>
            <p className="mt-1 max-w-[200px] text-[0.65rem] leading-relaxed text-muted-foreground">
              Earn points on delivered orders and approved reviews, then turn them into codes.
            </p>
            <Link
              href="/account/rewards"
              className="mt-3 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-indigo hover:underline"
            >
              Open rewards
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <TicketPercent className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-[0.74rem] font-semibold">How to use a coupon</p>
              <p className="mt-1 max-w-lg text-[0.66rem] leading-relaxed text-muted-foreground">
                Add your pieces to the bag, enter the code in the summary, and the discount
                applies instantly. Codes cannot be combined and some exclusions apply.
              </p>
            </div>
          </div>
          <Link
            href="/faq"
            className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-gold"
          >
            Coupon FAQ →
          </Link>
        </div>
      </div>
    </div>
  );
}
