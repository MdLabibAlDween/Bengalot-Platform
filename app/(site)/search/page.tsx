import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SearchForm } from "@/components/storefront/search-form";
import { JamdaniField } from "@/components/brand/ornaments";
import {
  departments,
  products,
  trendingSearches,
} from "@/lib/data";
import { getDbProducts } from "@/lib/catalog-db";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Bengalot collection by piece, department or category.",
  alternates: { canonical: `${SITE.url}/search` },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const dbProducts = await getDbProducts();
  const catalogue = [
    ...dbProducts,
    ...products.filter((product) => !dbProducts.some((item) => item.slug === product.slug)),
  ];
  const needle = query.toLowerCase();
  const results = needle
    ? catalogue.filter((product) =>
        [product.name, product.department, product.category, product.shortDescription, ...product.tags]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : [];
  const morePieces = catalogue.filter((p) => p.sets.includes("best")).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)]">
        <JamdaniField id="search-hero" color="var(--color-saffron)" opacity={0.1} size={58} />
        <div className="container-luxe relative py-8 md:py-12">
          <Breadcrumbs items={[{ label: "Search" }]} />
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <p className="eyebrow text-indigo">Search the house</p>
            <h1 className="display-2 mt-3">
              What are you <span className="italic text-gold-ink">looking for?</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[0.8rem] leading-relaxed text-muted-foreground">
              Search by piece, fabric, category or occasion. If you can&apos;t find it, our
              team likely can.
            </p>
            <div className="mt-6">
              <SearchForm initialQuery={query} />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 text-[0.54rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-gold" /> Try searching
              </span>
              {trendingSearches.slice(0, 6).map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.62rem] text-muted-foreground transition hover:border-gold hover:text-foreground"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-luxe py-10 md:py-14">
        {query ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
              <p className="text-[0.7rem] text-muted-foreground">
                <span className="font-semibold text-foreground">{results.length}</span>{" "}
                {results.length === 1 ? "result" : "results"} for{" "}
                <span className="font-semibold text-foreground">“{query}”</span>
              </p>
              <Link
                href="/search"
                className="text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-gold"
              >
                Clear search
              </Link>
            </div>

            {results.length > 0 ? (
              <ProductGrid className="mt-8">
                {results.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </ProductGrid>
            ) : (
              <div className="mx-auto max-w-xl py-16 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--border)] text-muted-foreground">
                  <SearchX className="h-7 w-7" strokeWidth={1.4} />
                </span>
                <p className="mt-5 font-display text-3xl">No products found.</p>
                <p className="mx-auto mt-3 max-w-sm text-[0.8rem] leading-relaxed text-muted-foreground">
                  Try a different word — or send us a message. A real person can help you
                  find exactly what you need.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/shop"
                    className="cta-primary flex h-11 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
                  >
                    Browse departments <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center gap-2 rounded-full border border-[var(--border)] px-5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[var(--color-jade)] "
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Ask us
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-indigo">More to explore</p>
                  <h2 className="display-3 mt-2">From the collection.</h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-gold sm:flex"
                >
                  Browse all pieces <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ProductGrid className="mt-7">
                {morePieces.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </ProductGrid>
            </div>

            <div className="mt-16 border-t border-[var(--border)] pt-10">
              <p className="eyebrow text-indigo">Or wander by department</p>
              <h2 className="display-3 mt-2">The house, by world.</h2>
              <div className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((department) => (
                  <Link
                    key={department.slug}
                    href={`/${department.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 transition hover:border-gold"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: department.accent }}
                      />
                      <span>
                        <span className="block text-[0.82rem] font-medium">
                          {department.name}
                        </span>
                        <span className="block text-[0.58rem] text-muted-foreground">
                          {department.tagline}
                        </span>
                      </span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-muted-foreground opacity-0 transition group-hover:translate-x-0 group-hover:text-gold group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
