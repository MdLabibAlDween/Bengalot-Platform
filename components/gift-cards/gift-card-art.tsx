import { Gift, Sparkles } from "lucide-react";
import { JamdaniField } from "@/components/brand/ornaments";
import { cn, formatBDT } from "@/lib/utils";

const tones = {
  indigo: "linear-gradient(135deg, var(--color-indigo) 0%, var(--color-magenta) 100%)",
  magenta: "linear-gradient(135deg, var(--color-magenta) 0%, var(--color-terracotta) 100%)",
  teal: "linear-gradient(135deg, var(--color-teal) 0%, var(--color-indigo) 100%)",
  jade: "linear-gradient(135deg, var(--color-jade) 0%, var(--color-teal) 100%)",
} as const;

export function GiftCardArt({
  amount,
  recipient,
  code,
  tone = "indigo",
  className,
  compact = false,
}: {
  amount: number;
  recipient?: string;
  code?: string;
  tone?: keyof typeof tones;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[24px] text-ivory shadow-[0_30px_70px_-40px_rgba(15,11,30,0.7)] ring-1 ring-white/15",
        compact ? "p-4" : "p-5 sm:p-6",
        className
      )}
      style={{ background: tones[tone] }}
    >
      <JamdaniField
        id={`gift-card-art-${tone}-${amount}-${(code ?? "preview").replace(/[^a-zA-Z0-9_-]/g, "")}`}
        color="var(--color-saffron)"
        opacity={0.14}
        size={compact ? 34 : 44}
      />
      <span
        className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border border-white/15"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full border border-white/10"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl leading-none tracking-tight sm:text-2xl">Bengalot</p>
          <p className="mt-1 text-[0.52rem] font-bold uppercase tracking-[0.22em] text-ivory/65">
            Gift card
          </p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
          <Gift className="h-4 w-4 text-saffron" aria-hidden="true" />
        </span>
      </div>

      <div className={compact ? "relative mt-7" : "relative mt-10"}>
        <p className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-ivory/55">
          Value
        </p>
        <p
          className={cn(
            "mt-1 font-display leading-none tabular-nums",
            compact ? "text-3xl" : "text-4xl sm:text-5xl"
          )}
        >
          {formatBDT(amount)}
        </p>
      </div>

      <div className="relative mt-7 flex items-end justify-between gap-4 border-t border-white/15 pt-3.5">
        <div className="min-w-0">
          <p className="text-[0.46rem] font-bold uppercase tracking-[0.16em] text-ivory/50">
            {recipient ? "For" : "The whole house"}
          </p>
          <p className="mt-0.5 truncate text-[0.72rem] font-semibold text-ivory/90">
            {recipient || "Someone thoughtful"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.46rem] font-bold uppercase tracking-[0.16em] text-ivory/50">
            Code
          </p>
          <p className="mt-0.5 font-mono text-[0.62rem] font-semibold tracking-[0.08em] text-ivory/90">
            {code || "BG-GIFT-••••-••••"}
          </p>
        </div>
      </div>

      <span className="absolute bottom-4 right-5 text-saffron/80" aria-hidden="true">
        <Sparkles className="h-4 w-4" />
      </span>
    </div>
  );
}
