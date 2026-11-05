"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Instagram,
  Music2,
  Play,
  Video,
  Youtube,
} from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { SectionHeading } from "@/components/storefront/section-heading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProduct } from "@/lib/data";
import { SECTION_COPY } from "@/lib/homepage";
import { getReelEmbed, publishedReels } from "@/lib/reels";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { Reel, ReelPlatform } from "@/lib/types";

const platformMeta: Record<
  ReelPlatform,
  { label: string; icon: typeof Instagram; tone: string }
> = {
  instagram: { label: "Instagram", icon: Instagram, tone: "text-magenta" },
  youtube: { label: "YouTube", icon: Youtube, tone: "text-rosewood" },
  tiktok: { label: "TikTok", icon: Music2, tone: "text-teal" },
  file: { label: "Bengalot", icon: Video, tone: "text-indigo" },
};

function ReelPoster({
  reel,
  className,
}: {
  reel: Reel;
  className?: string;
}) {
  const product = reel.productSlug ? getProduct(reel.productSlug) : undefined;
  const { media } = useSiteConfig();
  const poster = reel.posterUrl || media["reel-poster-default"];

  return (
    <div className={className}>
      {poster ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${poster}")` }}
          role="img"
          aria-label={reel.title}
        />
      ) : (
        <ProductArt
          id={`reel-art-${reel.id}`}
          art={product?.art ?? "tshirt"}
          palette={product?.palette}
          showCaption={false}
          showMonogram={false}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/5" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/45 px-2.5 py-1 text-[0.48rem] font-bold uppercase tracking-[0.12em] text-ivory backdrop-blur">
          {(() => {
            const meta = platformMeta[reel.platform];
            const Icon = meta.icon;
            return <Icon className={`h-3 w-3 ${meta.tone}`} />;
          })()}
          {platformMeta[reel.platform].label}
        </span>
        <span className="rounded-full border border-white/20 bg-ink/35 px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.12em] text-ivory/75 backdrop-blur">
          Model reel
        </span>
      </div>
      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-ivory/90 text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] transition duration-300 group-hover:scale-105 group-hover:bg-saffron">
        <Play className="ml-0.5 h-5 w-5 fill-current" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="font-display text-[1.25rem] leading-tight text-ivory">{reel.title}</p>
        {product && (
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.1em] text-ivory/60">
            Wearing {product.name}
          </p>
        )}
      </div>
    </div>
  );
}

export function ReelsSection({ items }: { items?: Reel[] }) {
  const reels = (items && items.length > 0 ? items : publishedReels)
    .filter((reel) => reel.status === "published")
    .slice(0, 4);
  const [active, setActive] = useState<Reel | null>(null);
  const activeEmbed = useMemo(() => (active ? getReelEmbed(active) : null), [active]);
  const activeProduct = active?.productSlug ? getProduct(active.productSlug) : undefined;
  const copy = SECTION_COPY.reels;

  if (reels.length === 0) return null;

  return (
    <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <SectionHeading
        contentKey="reels"
          eyebrow={copy.eyebrow}
          title={copy.title}
          accent={copy.accent}
          description={copy.description}
          linkHref="/lookbook"
          linkLabel="See the looks"
        />

        <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {reels.map((reel) => {
            const product = reel.productSlug ? getProduct(reel.productSlug) : undefined;

            return (
              <article key={reel.id} className="w-[76vw] shrink-0 snap-start sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActive(reel)}
                  aria-label={`Play ${reel.title}`}
                  className="group relative block aspect-[9/14] w-full overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-ink)] text-left shadow-[0_24px_54px_-34px_rgba(15,11,30,0.6)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_32px_64px_-34px_rgba(15,11,30,0.65)]"
                >
                  <ReelPoster reel={reel} className="absolute inset-0" />
                </button>
                <div className="mt-3 flex items-start justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg leading-tight">{reel.title}</h3>
                    {reel.caption && (
                      <p className="mt-0.5 line-clamp-1 text-[0.68rem] text-muted-foreground">
                        {reel.caption}
                      </p>
                    )}
                  </div>
                  {product && (
                    <Link
                      href={`/product/${product.slug}`}
                      className="group/link inline-flex shrink-0 items-center gap-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-indigo transition hover:text-magenta"
                    >
                      Shop look
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover/link:rotate-45" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent side="center" className="max-w-[420px] overflow-hidden p-0">
          <DialogTitle className="sr-only">{active?.title ?? "Bengalot reel"}</DialogTitle>
          <DialogDescription className="sr-only">
            {active?.caption ?? "A Bengalot model reel."}
          </DialogDescription>
          {active && activeEmbed ? (
            <div className="bg-ink">
              <div className="relative aspect-[9/16] w-full overflow-hidden">
                {activeEmbed.kind === "video" ? (
                  <video
                    src={activeEmbed.src}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <iframe
                    src={activeEmbed.src}
                    title={active.title}
                    className="h-full w-full border-0"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-ivory">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg">{active.title}</p>
                  {activeProduct && (
                    <Link
                      href={`/product/${activeProduct.slug}`}
                      className="mt-0.5 inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-saffron"
                    >
                      Shop {activeProduct.name}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                {active.watchUrl && (
                  <a
                    href={active.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[0.56rem] font-bold uppercase tracking-[0.1em] text-ivory/55 transition hover:text-ivory"
                  >
                    Open original
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="font-display text-2xl">Reel preview</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This reel is coming soon. Meanwhile, shop the look below or open the original
                post.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {activeProduct && (
                  <Link
                    href={`/product/${activeProduct.slug}`}
                    className="cta-primary inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-[0.1em]"
                  >
                    Shop {activeProduct.name}
                  </Link>
                )}
                {active?.watchUrl && (
                  <a
                    href={active.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-secondary inline-flex h-10 items-center rounded-full px-4 text-xs font-bold uppercase tracking-[0.1em]"
                  >
                    Open original
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
