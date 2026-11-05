"use client";

import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";
import { SECTION_COPY } from "@/lib/homepage";
import { useRecentlyViewed } from "@/lib/providers";

export function RecentlyViewed() {
  const { items, clear } = useRecentlyViewed();
  const products = items.slice(0, 4);
  if (products.length === 0) return null;
  const copy = SECTION_COPY.recentlyViewed;

  return (
    <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <div className="flex items-start justify-between gap-4">
          <SectionHeading
        contentKey="recentlyViewed"
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
          <button
            type="button"
            onClick={clear}
            className="mt-2 shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted-foreground)] transition hover:text-[var(--color-gold-ink)]"
          >
            Clear
          </button>
        </div>
        <ProductGrid className="mt-7">
          {products.slice(0, 4).map((product) =>
            <ProductCard key={product.slug} product={product} />
          )}
        </ProductGrid>
      </div>
    </section>
  );
}
