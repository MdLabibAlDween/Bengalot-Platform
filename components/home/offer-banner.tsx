"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Sparkles, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import type { OfferCampaign } from "@/lib/homepage";
import type { Coupon } from "@/lib/types";
import { couponScopeCount } from "@/lib/coupons";
import { formatBDT } from "@/lib/utils";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function OfferBanner({
  campaign,
  coupon,
}: {
  campaign?: OfferCampaign;
  coupon?: Coupon;
}) {
  const [now, setNow] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);

  const end = campaign?.endAt ? new Date(campaign.endAt).getTime() : null;

  useEffect(() => {
    if (!end) return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time >= end) setExpired(true);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [end]);

  if (!campaign || !coupon || expired) return null;

  const remaining = end && now !== null ? Math.max(0, end - now) : 0;
  const units = [
    {
      label: "Days",
      value: now === null ? "--" : pad(Math.floor(remaining / (1000 * 60 * 60 * 24))),
    },
    {
      label: "Hours",
      value: now === null ? "--" : pad(Math.floor((remaining / (1000 * 60 * 60)) % 24)),
    },
    {
      label: "Minutes",
      value: now === null ? "--" : pad(Math.floor((remaining / (1000 * 60)) % 60)),
    },
    {
      label: "Seconds",
      value: now === null ? "--" : pad(Math.floor((remaining / 1000) % 60)),
    },
  ];

  const amount =
    coupon.type === "percent"
      ? `${coupon.value}% off`
      : coupon.type === "shipping"
        ? "Free delivery"
        : `${formatBDT(coupon.value)} off`;
  const minimum =
    coupon.minSpend > 0
      ? `on orders over ${formatBDT(coupon.minSpend)}`
      : "with no minimum order";
  const scopedCount = couponScopeCount(coupon);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success("Code copied", {
        description: `${coupon.code} · ${amount} ${minimum}`,
      });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error(`The code is ${coupon.code}`);
    }
  };

  return (
    <section className="bg-[var(--color-ivory)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(118deg,var(--color-indigo)_0%,var(--color-magenta)_100%)] px-6 py-9 text-ivory shadow-[0_40px_90px_-48px_rgba(30,15,60,0.65)] sm:px-10 lg:px-14 lg:py-12">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-[340px] w-[340px] rounded-full bg-gold/20 blur-[100px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/4 h-[280px] w-[280px] rounded-full bg-[var(--color-magenta)]/20 blur-[90px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(251,247,239,0.35) 1px, transparent 0)",
              backgroundSize: "28px 28px",
              maskImage: "linear-gradient(90deg, transparent, black 20%, black 80%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 20%, black 80%, transparent)",
            }}
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">
                <span className="h-px w-7 bg-gold" />
                {campaign.eyebrow}
              </p>
              <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(2.1rem,3.6vw,3.4rem)] leading-[1.02] text-ivory">
                {campaign.title.replace(campaign.accentWord ?? "", "")}
                <span className="italic text-gold">{campaign.accentWord}</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/70">
                {campaign.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={copy}
                  className="group flex items-center gap-3 rounded-xl border border-dashed border-gold/50 bg-gold/[0.08] px-4 py-3 transition hover:bg-gold/[0.14]"
                  aria-label={`Copy coupon code ${coupon.code}`}
                >
                  <span className="text-xs uppercase tracking-[0.12em] text-ivory/55">
                    Code
                  </span>
                  <span className="font-mono text-base font-bold tracking-[0.08em] text-gold">
                    {coupon.code}
                  </span>
                  {copied ? (
                    <Check className="h-4 w-4 text-gold" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4 text-ivory/45 transition group-hover:text-gold" aria-hidden="true" />
                  )}
                </button>
                <Link
                  href={campaign.ctaHref}
                  className="cta-primary group flex h-12 items-center gap-3 rounded-full px-6 text-xs font-bold uppercase tracking-[0.12em] ring-1 ring-white/20"
                >
                  {campaign.ctaLabel}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ivory/60">
                <TicketPercent className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                <span className="font-semibold text-ivory/80">{amount}</span>
                <span>{minimum}</span>
              </p>
              {scopedCount > 0 && (
                <p className="mt-2 text-xs text-ivory/55">
                  Valid on {scopedCount} selected product{scopedCount === 1 ? "" : "s"} only.
                </p>
              )}
            </div>

            {end && (
              <div className="rounded-2xl border border-ivory/15 bg-midnight/25 p-5 backdrop-blur-md sm:p-6">
                <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-ivory/55">
                  Offer ends in
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {units.map((unit) => (
                    <div
                      key={unit.label}
                      className="rounded-xl border border-ivory/10 bg-ivory/[0.06] py-3 text-center sm:py-4"
                    >
                      <p className="font-display text-[1.8rem] tabular-nums leading-none text-ivory sm:text-[2.1rem]">
                        {unit.value}
                      </p>
                      <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.1em] text-gold/80">
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs uppercase tracking-[0.08em] text-ivory/60">
                  <Sparkles className="h-3 w-3 text-gold" aria-hidden="true" />
                  Ends {new Date(campaign.endAt!).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
