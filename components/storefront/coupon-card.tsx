"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Coupon } from "@/lib/types";
import { couponScopeLabel } from "@/lib/coupons";
import { cn } from "@/lib/utils";

const tones: Record<string, { bg: string; accent: string; text: string }> = {
  royal: {
    bg: "linear-gradient(140deg, var(--color-indigo) 0%, var(--color-indigo-luminous) 100%)",
    accent: "var(--color-saffron)",
    text: "var(--color-ivory)",
  },
  magenta: {
    bg: "linear-gradient(140deg, var(--color-magenta) 0%, var(--color-magenta-luminous) 100%)",
    accent: "var(--color-saffron)",
    text: "var(--color-ivory)",
  },
  teal: {
    bg: "linear-gradient(140deg, var(--color-teal) 0%, var(--color-teal-luminous) 100%)",
    accent: "var(--color-saffron)",
    text: "var(--color-ivory)",
  },
};

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);
  const tone = tones[coupon.tone] ?? tones.royal;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success(`${coupon.code} copied`, { description: coupon.title });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Could not copy — use code ${coupon.code}`);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-[22px] text-ivory shadow-[0_30px_60px_-40px_rgba(20,10,40,0.6)]"
      style={{ background: tone.bg }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: `color-mix(in srgb, ${tone.accent} 20%, transparent)` }}
      />
      <div className="relative flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.16em]"
            style={{ borderColor: `color-mix(in srgb, ${tone.accent} 34%, transparent)`, color: tone.accent }}
          >
            <Sparkles className="h-3 w-3" /> Limited offer
          </span>
          <span className="text-[0.52rem] uppercase tracking-[0.12em] text-ivory/40">
            {coupon.expires ? `Valid till ${coupon.expires}` : "No expiry"}
          </span>
        </div>

        <h3 className="mt-5 max-w-[260px] font-display text-[1.8rem] leading-tight text-ivory">
          {coupon.title}
        </h3>
        <p className="mt-2 max-w-[290px] flex-1 text-[0.74rem] leading-relaxed text-ivory/50">
          {coupon.description}
        </p>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-ivory/15" />
          <span className="h-2 w-2 rounded-full bg-ivory/20" />
          <span className="h-px flex-1 bg-ivory/15" />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.48rem] font-bold uppercase tracking-[0.18em] text-ivory/35">
              Use code
            </p>
            <p
              className="mt-1 font-mono text-lg font-bold tracking-[0.08em]"
              style={{ color: tone.accent }}
            >
              {coupon.code}
            </p>
          </div>
          <button
            type="button"
            onClick={copy}
            className={cn(
              "flex h-9 items-center gap-2 rounded-full bg-ivory/10 px-4 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-ivory backdrop-blur transition hover:bg-ivory hover:text-midnight"
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
        <p className="mt-3 text-[0.55rem] text-ivory/30">
          Minimum spend ৳{coupon.minSpend.toLocaleString("en-US")} · {couponScopeLabel(coupon).toLowerCase()} · one use per customer
        </p>
      </div>
    </div>
  );
}
