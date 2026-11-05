import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { JamdaniField, SealStamp } from "@/components/brand/ornaments";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Reveal } from "@/components/storefront/reveal";
import { getStoreCollectionSummaries } from "@/lib/taxonomy-db";
import { getDbProducts } from "@/lib/catalog-db";
import { products } from "@/lib/data";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Collections — Curated by Bengalot",
  description:
    "Explore the Bengalot collections: new arrivals, selected pieces, the sale archive, the Royal Collection and the Heirloom Collection.",
  alternates: { canonical: `${SITE.url}/collections` },
};

export default async function CollectionsPage() {
  const dbProducts = await getDbProducts();
  const catalogue = [
    ...dbProducts,
    ...products.filter((product) => !dbProducts.some((item) => item.slug === product.slug)),
  ];
  const collections = await getStoreCollectionSummaries(catalogue);

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)]">
        <JamdaniField id="collections-index-hero" color="var(--color-saffron)" opacity={0.11} size={62} />
        <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-rosewood/[0.08] blur-[100px]" />
        <div className="container-luxe relative py-10 md:py-14">
          <Breadcrumbs items={[{ label: "Collections" }]} />
          <div className="mt-7 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow flex items-center gap-3 text-indigo">
                <span className="h-px w-8 bg-saffron" /> Curated by the house
              </p>
              <h1 className="display-1 mt-4">
                The <span className="italic text-gold-ink">collections.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
                Seasonal selections, quiet archives and pieces grouped by a point of view.
                Explore the collections — or wander through the departments.
              </p>
            </div>
            <div className="hidden items-center gap-8 border-l border-[var(--border)] pl-8 lg:flex">
              <div>
                <p className="font-display text-3xl leading-none">0{collections.length}</p>
                <p className="mt-1 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Collections
                </p>
              </div>
              <SealStamp
                size={98}
                className="stamp-spin opacity-60"
                text="BENGALOT · CURATED · SALTHA · FARIDPUR · "
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-luxe py-14 md:py-20">
        <ProductGrid>
          {collections.map((collection, index) => {
            const cover = collection.coverProduct;
            return (
              <Reveal
                key={collection.slug}
                delay={(index % 3) * 0.06}
                className="w-full max-w-[300px]"
              >
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group relative flex aspect-[4/5] w-full max-w-[300px] flex-col justify-between overflow-hidden rounded-[22px] border border-white/10 p-5 text-ivory shadow-[0_30px_60px_-40px_rgba(20,10,40,0.6)] transition-transform duration-500 hover:-translate-y-1 sm:p-6"
                  style={{
                    background: `linear-gradient(145deg, ${collection.palette[0]}, ${collection.palette[1]})`,
                  }}
                >
                  {cover && (
                    <div className="absolute inset-0 opacity-60 transition-transform duration-[900ms] group-hover:scale-[1.04]">
                      <ProductArt
                        id={`collection-index-${collection.slug}`}
                        art={cover.art}
                        palette={collection.palette}
                        showCaption={false}
                        showMonogram={false}
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/95 via-midnight/25 to-midnight/10" />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="rounded-full border border-ivory/20 bg-ivory/10 px-2.5 py-1 text-[0.48rem] font-bold uppercase tracking-[0.16em] text-ivory/75 backdrop-blur">
                      {collection.kind === "sale" ? "Sale" : "Collection"}
                    </span>
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-ivory/25 bg-ivory/10 backdrop-blur transition group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-midnight">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="relative">
                    <p className="flex items-center gap-1.5 text-[0.5rem] font-bold uppercase tracking-[0.18em] text-gold">
                      <Sparkles className="h-3 w-3" /> {collection.eyebrow}
                    </p>
                    <h2 className="mt-2 font-display text-[2rem] leading-none text-ivory">
                      {collection.title}
                      <br />
                      <span className="italic text-gold">{collection.accent}</span>
                    </h2>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-ivory/10 pt-3">
                      <p className="text-[0.56rem] uppercase tracking-[0.14em] text-ivory/45">
                        {collection.productCount} pieces
                      </p>
                      <span className="flex items-center gap-2 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-ivory/70 transition group-hover:text-gold">
                        View collection <span className="h-px w-5 bg-current" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}

          <Reveal delay={0.12} className="w-full max-w-[300px]">
            <Link
              href="/lookbook"
              className="group relative flex aspect-[4/5] w-full max-w-[300px] flex-col justify-between overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--background)] p-5 transition-transform duration-500 hover:-translate-y-1 sm:p-6"
            >
              <JamdaniField id="collections-lookbook" color="var(--color-saffron)" opacity={0.12} size={46} />
              <div className="relative flex items-start justify-between">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[0.48rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Editorial
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line-strong)] transition group-hover:rotate-45 group-hover:border-indigo group-hover:bg-indigo group-hover:text-ivory">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="relative">
                <p className="eyebrow text-indigo">The lookbook</p>
                <h2 className="mt-2 font-display text-[2rem] leading-none">
                  Stories in <span className="italic text-gold-ink">color.</span>
                </h2>
                <p className="mt-3 max-w-[240px] text-[0.72rem] leading-relaxed text-muted-foreground">
                  Notes on craft, color and the quiet details behind each collection.
                </p>
                <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)] pt-3 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-foreground/70 transition group-hover:text-gold">
                  Enter the lookbook <span className="h-px w-5 bg-current" />
                </div>
              </div>
            </Link>
          </Reveal>
        </ProductGrid>
      </section>
    </>
  );
}
