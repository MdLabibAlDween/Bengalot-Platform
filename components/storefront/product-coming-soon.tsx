import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductComingSoon({
  eyebrow = "Coming soon",
  title,
  description,
  actionHref,
  actionLabel,
  className,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-dashed border-[var(--line-strong)] bg-[var(--color-surface)]/75 text-center",
        compact ? "px-6 py-8" : "px-6 py-12 md:py-14",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-gold/[0.08] text-gold-ink">
        <Sparkles className="h-4 w-4" />
      </div>
      <p className="eyebrow mt-4 text-indigo">{eyebrow}</p>
      <h3 className="mt-2 font-display text-[1.6rem] leading-tight sm:text-[1.9rem]">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-[0.78rem] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.13em] transition hover:border-indigo hover:bg-indigo hover:text-ivory"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
