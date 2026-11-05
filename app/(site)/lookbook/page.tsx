import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { Sparkle } from "@/components/brand/ornaments";
import { PageHero } from "@/components/storefront/page-hero";
import { ProductCard } from "@/components/storefront/product-card";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getProduct, lookbook } from "@/lib/data";
import { SITE } from "@/lib/constants";
import { getSiteContent } from "@/lib/site-content";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lookbook — Stories in color",
  description:
    "Editorial stories from Bengalot — the craft, color and quiet obsessions behind each collection.",
  alternates: { canonical: `${SITE.url}/lookbook` },
};

function accentTitle(title: string, accent: string) {
  if (!accent || !title.includes(accent)) return title;
  const [before, after] = title.split(accent);
  return (
    <>
      {before}
      <span className="italic text-gold-ink">{accent}</span>
      {after}
    </>
  );
}

export default async function LookbookPage() {
  const content = await getSiteContent();
  const storyProducts = lookbook
    .map((story) => getProduct(story.productSlug))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow={content.lookbook.hero.eyebrow}
        title={accentTitle(content.lookbook.hero.title, content.lookbook.hero.accent)}
        description={content.lookbook.hero.description}
        accent="var(--color-magenta)"
        breadcrumbs={[{ label: "Lookbook" }]}
        art="saree"
        imageUrl={content.lookbook.hero.imageUrl}
      >
        <a
          href="#stories"
          className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-indigo"
        >
          Enter the stories
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 transition group-hover:border-indigo group-hover:bg-indigo group-hover:text-ivory">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </a>
      </PageHero>

      <section id="stories" className="container-luxe scroll-mt-24 py-16 md:py-24">
        <div className="space-y-16 md:space-y-24">
          {lookbook.map((story, index) => {
            const product = getProduct(story.productSlug);
            const edited = content.lookbook.stories.find((item) => item.slug === story.slug);
            const reverse = index % 2 === 1;
            return (
              <article
                key={story.slug}
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
                  reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative overflow-hidden rounded-[24px] border border-[var(--border)]">
                  <div className="aspect-[4/3] sm:aspect-[4/3.3]">
                    {edited?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={edited.imageUrl} alt={edited.title} className="h-full w-full object-cover" />
                    ) : (
                      <ProductArt
                        id={`story-${story.slug}`}
                        art={product?.art ?? "saree"}
                        palette={story.palette}
                        showCaption={false}
                        showMonogram
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-ivory sm:p-7">
                    <div>
                      <p className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-gold">
                        {edited?.subtitle ?? story.subtitle}
                      </p>
                      <p className="mt-1 font-display text-2xl">{edited?.title ?? story.title}</p>
                    </div>
                    <span className="font-display text-4xl text-ivory/20">0{index + 1}</span>
                  </div>
                </div>

                <div>
                  <p className="eyebrow text-indigo">Story 0{index + 1}</p>
                  <h2 className="display-3 mt-3">{edited?.title ?? story.title}</h2>
                  <p className="mt-4 max-w-lg text-[0.88rem] leading-relaxed text-muted-foreground">
                    {edited?.description ?? story.description} Each piece in this story belongs to a small run,
                    finished with the details that matter. This is the world of Bengalot —
                    where heritage is worn, not framed.
                  </p>

                  {product && (
                    <Link
                      href={`/product/${product.slug}`}
                      className="group mt-7 flex max-w-md items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition hover:border-gold"
                    >
                      <div className="h-[78px] w-[62px] shrink-0 overflow-hidden rounded-lg">
                        <ProductArt
                          id={`story-product-${product.slug}`}
                          art={product.art}
                          palette={product.palette}
                          showCaption={false}
                          showMonogram={false}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                          From this story
                        </p>
                        <p className="truncate font-display text-lg leading-snug transition group-hover:text-gold-ink-ink">
                          {product.name}
                        </p>
                        <p className="text-[0.7rem] tabular-nums text-muted-foreground">
                          {formatBDT(product.price)}
                        </p>
                      </div>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--border)] transition group-hover:rotate-45 group-hover:border-indigo group-hover:bg-indigo group-hover:text-ivory">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  )}

                  <blockquote className="mt-7 border-l border-gold/50 pl-5">
                    <p className="font-display text-xl italic leading-snug text-foreground/80">
                      “{index === 0
                        ? "Slow cloth for a fast world."
                        : index === 1
                          ? "After dark, everything softens."
                          : index === 2
                            ? "Our golden fibre, reimagined."
                            : "The pieces you reach for first."
                        }”
                    </p>
                    <cite className="mt-2 block text-[0.52rem] font-semibold uppercase not-italic tracking-[0.18em] text-gold-ink">
                      Bengalot atelier
                    </cite>
                  </blockquote>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface-2)] py-16 md:py-20">
        <div className="container-luxe">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow flex items-center gap-3 text-indigo">
                <span className="h-px w-8 bg-gold" /> Shop the stories
              </p>
              <h2 className="display-3 mt-3">
                Pieces from the <span className="italic text-gold-ink">lookbook.</span>
              </h2>
            </div>
            <Link
              href="/shop"
              className="group flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] transition hover:text-gold-ink"
            >
              Shop all departments
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {storyProducts.map((product) =>
              product ? <ProductCard key={product.slug} product={product} /> : null
            )}
          </div>
        </div>
      </section>

      <div className="relative">
        <Sparkle className="absolute left-[8%] top-10 z-10 opacity-50" size={16} />
        <NewsletterSection />
      </div>
    </>
  );
}
