import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { JamdaniField } from "@/components/brand/ornaments";
import { Reveal } from "@/components/storefront/reveal";
import { getProduct } from "@/lib/data";
import { BRAND_STORY, isDemoVisible } from "@/lib/homepage";

export function HouseOfFashion() {
  if (!isDemoVisible(BRAND_STORY.isDemo)) return null;
  const story = BRAND_STORY;
  const products = story.productSlugs
    .map((slug) => getProduct(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <section className="relative overflow-hidden bg-[var(--color-ivory)] py-12 md:py-20 lg:py-24">
      <JamdaniField id="story-pattern" color="var(--color-saffron)" opacity={0.05} size={58} />
      <div className="container-luxe relative grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal className="relative order-2 mx-auto w-full max-w-[430px] lg:order-1 lg:mx-0">
          <div className="pointer-events-none absolute -left-5 top-12 hidden h-[74%] w-[74%] rounded-[200px_200px_26px_26px] border border-[var(--color-border)] sm:block" />
          <div className="relative w-[84%] overflow-hidden rounded-[200px_200px_22px_22px] border border-[var(--color-border)] bg-[var(--color-sand)] shadow-[0_36px_80px_-46px_rgba(36,26,80,0.45)]">
            <div className="aspect-[4/5]">
              {products[0] ? (
                <ProductArt
                  id="story-main-art"
                  art={products[0].art}
                  palette={products[0].palette}
                  showCaption={false}
                  showMonogram={false}
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(145deg,var(--color-indigo),var(--color-magenta))]" />
              )}
            </div>
          </div>

          <div className="absolute -bottom-3 right-0 w-[46%] overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-sand)] shadow-[0_24px_50px_-32px_rgba(36,26,80,0.4)]">
            <div className="aspect-[4/5]">
              {products[1] ? (
                <ProductArt
                  id="story-small-art"
                  art={products[1].art}
                  palette={products[1].palette}
                  showCaption={false}
                  showMonogram={false}
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(145deg,var(--color-terracotta),var(--color-terracotta))]" />
              )}
            </div>
          </div>

          <span className="absolute -left-2 bottom-8 h-20 w-20 rounded-full border border-[var(--color-border)]" aria-hidden="true" />
        </Reveal>

        <Reveal delay={0.08} className="order-1 lg:order-2">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-indigo)]">
            <span className="h-px w-7 bg-saffron" />
            {story.eyebrow}
          </p>
          <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(2.1rem,4vw,3.6rem)] leading-[1.03] text-[var(--color-ink)]">
            {story.title}
          </h2>
          <div className="mt-5 max-w-lg space-y-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            {story.paragraphs.slice(0, 2).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {story.points.slice(0, 3).map((point, index) => (
              <div key={point.title} className="border-t border-[var(--color-border)] pt-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg leading-snug text-[var(--color-ink)]">
                    {point.title}
                  </h3>
                  <span className="text-xs font-bold tabular-nums text-indigo">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-muted-foreground)]">{point.text}</p>
              </div>
            ))}
          </div>

          <Link
            href={story.buttonHref}
            className="cta-primary group mt-7 inline-flex h-11 items-center gap-3 rounded-full px-6 text-xs font-bold uppercase tracking-[0.12em]"
          >
            {story.buttonLabel}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
          </Link>

          {story.locationLine && (
            <p className="mt-5 text-xs uppercase tracking-[0.1em] text-[var(--color-muted-foreground)]">
              {story.locationLine}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
