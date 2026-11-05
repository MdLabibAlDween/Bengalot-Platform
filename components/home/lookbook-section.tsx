import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ArtIconGlyph } from "@/components/brand/product-art";
import { JamdaniField } from "@/components/brand/ornaments";
import { SectionHeading } from "@/components/storefront/section-heading";
import { getStoreCollectionSummaries } from "@/lib/taxonomy-db";
import { getMediaMap } from "@/lib/admin/settings";
import { getFeaturedCollections, SECTION_COPY } from "@/lib/homepage";
import { cn } from "@/lib/utils";

const LOOKBOOK_SLOTS = [
  "lookbook-jamdani",
  "lookbook-midnight",
  "lookbook-golden",
  "lookbook-everyday",
];

export async function LookbookSection() {
  const copy = SECTION_COPY.collections;
  const [summaries, media] = await Promise.all([
    getStoreCollectionSummaries(),
    getMediaMap(),
  ]);
  const items = getFeaturedCollections()
    .map((featured) =>
      summaries.find((collection) => collection.slug === featured.slug)
        ? { featured, collection: summaries.find((collection) => collection.slug === featured.slug)! }
        : null
    )
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <SectionHeading
        contentKey="collections"
          eyebrow={copy.eyebrow}
          title={copy.title}
          accent={copy.accent}
          description={copy.description}
          linkHref={copy.linkHref}
          linkLabel={copy.linkLabel}
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:h-[536px] lg:grid-cols-12 lg:grid-rows-2">
          {items.map(({ featured, collection }, index) => {
            const large = index === 0;
            const image =
              media[`collection.${collection.slug}.main`] ||
              media[LOOKBOOK_SLOTS[index]] ||
              media["lookbook-default"] ||
              collection.coverProduct?.imageUrl;
            return (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                className={cn(
                  "group flex min-h-[260px] flex-col overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[0_20px_48px_-36px_rgba(36,26,80,0.34)] transition duration-500 hover:-translate-y-1 hover:border-[var(--color-border)] hover:shadow-[0_28px_58px_-36px_rgba(36,26,80,0.4)]",
                  large && "sm:col-span-2 lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1",
                  index === 1 && "lg:col-span-5 lg:col-start-8 lg:row-start-1",
                  index === 2 && "lg:col-span-5 lg:col-start-8 lg:row-start-2"
                )}
              >
                <div
                  className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[16px] px-8 py-7"
                  style={{
                    background: `linear-gradient(145deg, color-mix(in srgb, ${collection.palette[0]} 14%, transparent) 0%, color-mix(in srgb, ${collection.palette[1]} 8%, transparent) 48%, var(--color-surface) 100%)`,
                  }}
                >
                  <JamdaniField
                    id={`home-collection-${collection.slug}`}
                    color={collection.palette[1]}
                    opacity={0.1}
                    size={46}
                  />
                  <span
                    className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full border"
                    style={{ borderColor: `color-mix(in srgb, ${collection.palette[1]} 16%, transparent)` }}
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full border"
                    style={{ borderColor: `color-mix(in srgb, ${collection.palette[1]} 10%, transparent)` }}
                    aria-hidden="true"
                  />
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={collection.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <span
                      className={cn(
                        "relative transition-transform duration-700 group-hover:scale-[1.04]",
                        large ? "h-[62%] max-h-[270px] w-[58%]" : "h-[62%] max-h-[108px] w-[38%]"
                      )}
                      style={{ color: collection.palette[1] }}
                    >
                      <ArtIconGlyph
                        art={collection.coverProduct?.art ?? featured.icon}
                        className="h-full w-full"
                        strokeWidth={1.6}
                      />
                    </span>
                  )}

                  <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/80 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] backdrop-blur">
                    {collection.eyebrow}
                  </span>
                  <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/80 bg-white/70 text-[var(--color-ink)] backdrop-blur transition duration-300 group-hover:rotate-45 group-hover:bg-[var(--color-ink)] group-hover:text-ivory">
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3 px-2 pb-1.5 pt-3.5">
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        "font-display leading-tight text-[var(--color-ink)]",
                        large ? "text-[1.9rem] sm:text-[2.25rem]" : "text-[1.35rem]"
                      )}
                    >
                      {collection.title}{" "}
                      <span className="italic text-[var(--color-gold-ink)]">{collection.accent}</span>
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-[var(--color-muted-foreground)]">
                      {collection.description}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.11em] text-[var(--color-ink)] transition group-hover:text-[var(--color-gold-ink)]">
                      View collection
                      <span className="h-px w-4 bg-current transition-all group-hover:w-7" />
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--color-sand)] px-2.5 py-1.5 text-xs font-semibold tabular-nums text-[var(--color-muted-foreground)]">
                    {collection.productCount}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
