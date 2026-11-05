"use client";

import { useState } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { featuredProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import { SECTION_COPY } from "@/lib/homepage";

const tabs = [
  {
    value: "new",
    label: "New arrivals",
    href: "/collections/new-arrivals",
  },
  {
    value: "best",
    label: "More pieces",
    href: "/shop",
  },
] as const;

type TabValue = (typeof tabs)[number]["value"];

export function FeaturedProducts({ items }: { items?: Product[] }) {
  const lists =
    items && items.length > 0
      ? { new: items.slice(0, 8), best: items.slice(8, 16) }
      : {
          new: featuredProducts("new", 8),
          best: featuredProducts("best", 8),
        };
  const [activeTab, setActiveTab] = useState<TabValue>(
    lists.new.length > 0 ? "new" : "best"
  );

  if (lists.new.length === 0 && lists.best.length === 0) return null;
  const copy = SECTION_COPY.products;
  const active = tabs.find((tab) => tab.value === activeTab) ?? tabs[0];

  return (
    <section className="bg-[var(--color-ivory)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <SectionHeading
        contentKey="products"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          linkHref={active.href}
          linkLabel={copy.linkLabel}
        />

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabValue)}
          className="mt-7"
        >
          <TabsList className="flex h-auto w-fit gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={lists[tab.value].length === 0}
                className="h-9 rounded-full border-0 px-4 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-muted-foreground)] shadow-none transition data-[state=active]:bg-[var(--color-ink)] data-[state=active]:text-ivory disabled:opacity-40"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => {
            const products = lists[tab.value];
            return (
              <TabsContent key={tab.value} value={tab.value} className="mt-7">
                {products.length > 0 ? (
                  <ProductGrid className="!gap-y-8 md:!gap-y-10">
                    {products.map((product) => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </ProductGrid>
                ) : (
                  <p className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-muted-foreground)]">
                    New pieces are being added. Explore the departments in the meantime.
                  </p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
