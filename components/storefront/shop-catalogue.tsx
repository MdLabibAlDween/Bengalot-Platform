"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductComingSoon } from "@/components/storefront/product-coming-soon";
import { ProductGrid } from "@/components/storefront/product-grid";
import { categoriesFor, departments } from "@/lib/data";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ShopCatalogue({ catalogue }: { catalogue: Product[] }) {
  const groups = useMemo(
    () =>
      departments
        .map((department) => {
          const products = catalogue.filter(
            (product) => product.department === department.slug
          );
          const categories = categoriesFor(department.slug)
            .map((category) => ({
              category,
              products: products.filter(
                (product) => product.category === category.slug
              ),
            }))
            .filter((group) => group.products.length > 0);
          return { department, products, categories };
        })
        .filter((group) => group.products.length > 0),
    [catalogue]
  );

  const [activeDepartment, setActiveDepartment] = useState(
    groups[0]?.department.slug ?? ""
  );
  const [activeCategory, setActiveCategory] = useState("all");

  const group =
    groups.find((item) => item.department.slug === activeDepartment) ?? groups[0];
  const activeCategoryName =
    group?.categories.find((item) => item.category.slug === activeCategory)
      ?.category.name ?? "";
  const products = group
    ? activeCategory === "all"
      ? group.products
      : group.products.filter((product) => product.category === activeCategory)
    : [];

  const chooseDepartment = (slug: string) => {
    setActiveDepartment(slug);
    setActiveCategory("all");
  };

  return (
    <section id="shop-catalogue" className="border-t border-[var(--border)] py-12 md:py-16">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-3 text-indigo">
              <span className="h-px w-8 bg-saffron" /> Shop by category
            </p>
            <h2 className="display-3 mt-3">
              The collection, <span className="italic text-gold-ink">organised.</span>
            </h2>
            <p className="mt-2 max-w-xl text-[0.8rem] leading-relaxed text-muted-foreground">
              Choose a department, then narrow by category. Every product below is
              live in the catalogue.
            </p>
          </div>
          {group && (
            <Link
              href={`/${group.department.slug}`}
              className="group inline-flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-foreground transition hover:text-gold-ink"
            >
              All {group.department.name}
              <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] transition group-hover:rotate-45 group-hover:border-gold">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}
        </div>

        {groups.length === 0 ? (
          <ProductComingSoon
            className="mt-7"
            title="The catalogue is being prepared."
            description="Pieces will appear here as soon as they are published. Explore the departments in the meantime."
            actionHref="/collections"
            actionLabel="Browse collections"
          />
        ) : (
          <>
            <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
              {groups.map((item) => {
                const active = item.department.slug === group?.department.slug;
                return (
                  <button
                    key={item.department.slug}
                    type="button"
                    onClick={() => chooseDepartment(item.department.slug)}
                    aria-pressed={active}
                    className={cn(
                      "shrink-0 snap-start rounded-full border px-4 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] transition",
                      active
                        ? "border-indigo bg-indigo text-ivory"
                        : "border-[var(--border)] bg-[var(--surface)] text-muted-foreground hover:border-indigo hover:text-foreground"
                    )}
                  >
                    {item.department.name}
                    <span className={cn("ml-1.5 tabular-nums", active ? "text-ivory/65" : "text-muted-foreground/65")}>
                      {item.products.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {group && (
              <>
                <div className="no-scrollbar -mx-4 mt-2 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    aria-pressed={activeCategory === "all"}
                    className={cn(
                      "shrink-0 snap-start rounded-full border px-3.5 py-2 text-[0.54rem] font-bold uppercase tracking-[0.08em] transition",
                      activeCategory === "all"
                        ? "border-gold bg-gold/15 text-gold-ink"
                        : "border-[var(--border)] text-muted-foreground hover:border-gold hover:text-foreground"
                    )}
                  >
                    All pieces
                    <span className="ml-1.5 tabular-nums opacity-60">{group.products.length}</span>
                  </button>
                  {group.categories.map(({ category, products: categoryProducts }) => {
                    const active = category.slug === activeCategory;
                    return (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => setActiveCategory(category.slug)}
                        aria-pressed={active}
                        className={cn(
                          "shrink-0 snap-start rounded-full border px-3.5 py-2 text-[0.54rem] font-bold uppercase tracking-[0.08em] transition",
                          active
                            ? "border-gold bg-gold/15 text-gold-ink"
                            : "border-[var(--border)] text-muted-foreground hover:border-gold hover:text-foreground"
                        )}
                      >
                        {category.name}
                        <span className="ml-1.5 tabular-nums opacity-60">{categoryProducts.length}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {products.length} {products.length === 1 ? "piece" : "pieces"}
                    {activeCategory !== "all" && ` in ${activeCategoryName}`}
                  </p>
                  {activeCategory !== "all" && (
                    <Link
                      href={`/${group.department.slug}/${activeCategory}`}
                      className="inline-flex items-center gap-1.5 text-[0.56rem] font-bold uppercase tracking-[0.1em] text-indigo transition hover:text-gold-ink"
                    >
                      View {activeCategoryName}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {products.length > 0 ? (
                  <ProductGrid className="mt-5">
                    {products.map((product) => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </ProductGrid>
                ) : (
                  <ProductComingSoon
                    compact
                    className="mt-5"
                    title="This category is being prepared."
                    description="Pieces will appear here as soon as they are published."
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
