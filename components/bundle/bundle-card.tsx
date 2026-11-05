import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { BundleArt } from "@/components/bundle/bundle-art";
import { DemoBadge } from "@/components/storefront/demo-product";
import { getBundlePricing, bundleItemCount, isDemoBundle } from "@/lib/bundles";
import { getDepartment } from "@/lib/data";
import type { Bundle } from "@/lib/types";
import { formatBDT } from "@/lib/utils";

export function BundleCard({
  bundle,
  compact = false,
}: {
  bundle: Bundle;
  compact?: boolean;
}) {
  const department = getDepartment(bundle.department);
  const pricing = getBundlePricing(bundle);
  const count = bundleItemCount(bundle);
  const demo = isDemoBundle(bundle);
  const metaLine = [department?.name, "Complete outfit", `${count} ${count === 1 ? "piece" : "pieces"}`]
    .filter(Boolean)
    .join(" · ");

  const price = (
    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-[15px] font-semibold tabular-nums text-[var(--color-ink)]">
        {formatBDT(pricing.price)}
      </span>
      <span className="text-xs text-[var(--color-muted-foreground)] line-through tabular-nums">
        {formatBDT(pricing.total)}
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-magenta)]">
        Save {pricing.percent}%
      </span>
    </div>
  );

  if (compact) {
    return (
      <article className="group flex gap-3 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border)] hover:shadow-[0_20px_40px_-32px_rgba(20,10,40,0.35)]">
        <Link
          href={`/bundle/${bundle.slug}`}
          aria-label={`View ${bundle.name}`}
          className="relative w-[118px] shrink-0 self-start overflow-hidden rounded-xl border border-[var(--color-border)]"
        >
          <div className="aspect-[4/5]">
            <BundleArt bundle={bundle} className="h-full w-full" />
          </div>
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
          <Link href={`/bundle/${bundle.slug}`}>
            <h3 className="font-display text-[1.08rem] leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-gold-ink)]">
              {bundle.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">{metaLine}</p>
          {demo && (
            <p className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
              Demo bundle · ordering disabled
            </p>
          )}
          {price}
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full w-full max-w-[300px] flex-col">
      <Link
        href={`/bundle/${bundle.slug}`}
        className="relative block overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_48px_-34px_rgba(36,26,80,0.38)] transition duration-500 hover:-translate-y-1 hover:border-[var(--color-border)] hover:shadow-[0_28px_58px_-34px_rgba(36,26,80,0.44)]"
      >
        <div className="aspect-[4/5]">
          <BundleArt bundle={bundle} className="h-full w-full" />
        </div>

        <span className="absolute left-3 top-3 z-20 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-midnight shadow-sm">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Save {formatBDT(pricing.savings)}
        </span>

        <span className="absolute bottom-3 left-3 z-20 inline-flex items-center rounded-full border border-white/25 bg-[var(--color-ink)]/35 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-ivory backdrop-blur">
          {demo ? "Demo bundle" : "Bundle"}
        </span>

        <span className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-white/15 text-ivory backdrop-blur transition duration-300 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-midnight">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-3.5">
        <Link href={`/bundle/${bundle.slug}`}>
          <h3 className="font-display text-[1.32rem] leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-gold-ink)]">
            {bundle.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted-foreground)]">{metaLine}</p>
        {demo && (
          <p className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
            Demo bundle · ordering disabled
          </p>
        )}
        {price}
      </div>
    </article>
  );
}
