import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { CollectionHero } from "@/components/storefront/collection-hero";
import { JamdaniField } from "@/components/brand/ornaments";
import { getDepartment } from "@/lib/data";
import type { Product } from "@/lib/types";

export function ProductCollection({
  products,
  eyebrow,
  title,
  accent,
  description,
  palette,
  stats,
  note,
  closingTitle,
  closingText,
}: {
  products: Product[];
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  palette: [string, string];
  stats: { value: string; label: string }[];
  note?: string;
  closingTitle: string;
  closingText: string;
}) {
  const grouped = products.length >= 12;
  const groups = Array.from(
    products.reduce((map, product) => {
      const department = getDepartment(product.department);
      const current = map.get(product.department);
      if (current) {
        current.products.push(product);
      } else {
        map.set(product.department, {
          slug: product.department,
          department,
          products: [product],
        });
      }
      return map;
    }, new Map<string, {
      slug: string;
      department: ReturnType<typeof getDepartment>;
      products: Product[];
    }>())
      .values()
  );

  return (
    <>
      <CollectionHero
        eyebrow={eyebrow}
        title={title}
        accent={accent}
        description={description}
        palette={palette}
        products={products}
        stats={stats}
        note={note}
      />

      <section id="collection" className="container-luxe scroll-mt-24 py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <p className="eyebrow text-indigo">The full collection</p>
            <h2 className="mt-2 font-display text-[2.1rem] leading-none">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
              {grouped ? " by department" : ""}
            </h2>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {grouped ? "Arranged by department" : "One considered collection"}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-8 text-center">
            <p className="font-display text-2xl">The collection is being prepared.</p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-muted-foreground">
              Explore the departments in the meantime.
            </p>
            <Link
              href="/shop"
              className="cta-primary mt-5 inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
            >
              Browse departments <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : grouped ? (
          <>
            <div className="mt-5 flex flex-wrap gap-2">
              {groups.map((group) => (
                <a
                  key={group.slug}
                  href={`#department-${group.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground transition hover:border-gold hover:text-foreground"
                >
                  {group.department?.name ?? group.slug}
                  <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[0.65rem] tabular-nums">
                    {group.products.length}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-9 space-y-10">
              {groups.map((group) => (
                <section
                  key={group.slug}
                  id={`department-${group.slug}`}
                  className="scroll-mt-28 border-t border-[var(--border)] pt-7 first:border-t-0 first:pt-0"
                >
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Department
                      </p>
                      <h3 className="mt-1 font-display text-[1.8rem] leading-none">
                        {group.department?.name ?? group.slug}
                      </h3>
                    </div>
                    <Link
                      href={`/${group.slug}`}
                      className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-foreground/65 transition hover:text-gold-ink"
                    >
                      View department
                      <ArrowUpRight className="h-3 w-3 transition group-hover:rotate-45" />
                    </Link>
                  </div>
                  <ProductGrid>
                    {group.products.map((product) => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </ProductGrid>
                </section>
              ))}
            </div>
          </>
        ) : (
          <ProductGrid className="mt-8">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </ProductGrid>
        )}
      </section>

      <section className="relative overflow-hidden bg-[var(--surface-2)] py-12 md:py-16">
        <JamdaniField id={`collection-closing-${title}`} color="var(--color-saffron)" opacity={0.07} size={54} />
        <div className="container-luxe relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-indigo dark:text-saffron">{eyebrow}</p>
            <h2 className="mt-2 max-w-xl font-display text-[2rem] leading-tight text-foreground sm:text-[2.4rem]">
              {closingTitle}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {closingText}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/offers"
              className="cta-secondary flex h-10 items-center rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
            >
              Current offers
            </Link>
            <Link
              href="/shop"
              className="cta-primary flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
            >
              Keep exploring <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
