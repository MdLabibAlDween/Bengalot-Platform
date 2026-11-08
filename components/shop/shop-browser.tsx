"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { productShelfType } from "@/lib/catalog-meta";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";
type TypeFilter = "all" | "digital" | "physical" | "bundle";

const typeLabels: Record<TypeFilter, string> = {
  all: "All formats",
  digital: "Digital",
  physical: "Physical",
  bundle: "Bundles",
};

export function ShopBrowser({
  products,
  categories,
  lockedCategory,
}: {
  products: Product[];
  categories: Category[];
  lockedCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(lockedCategory ?? "all");
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const deferredQuery = useDeferredValue(query);
  const reduceMotion = useReducedMotion();

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(
        product.category_slug,
        (counts.get(product.category_slug) ?? 0) + 1,
      );
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const result = products.filter((product) => {
      if (category !== "all" && product.category_slug !== category) return false;
      if (type !== "all" && productShelfType(product) !== type) return false;
      if (!needle) return true;
      return [
        product.title,
        product.subtitle,
        product.format,
        product.category_slug,
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    if (sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      result.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else {
      result.sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort - b.sort);
    }

    return result;
  }, [products, category, type, deferredQuery, sort]);

  function reset() {
    setQuery("");
    setType("all");
    if (!lockedCategory) setCategory("all");
    setSort("featured");
  }

  const hasFilters =
    query.trim().length > 0 || type !== "all" || (!lockedCategory && category !== "all");

  return (
    <section id="the-shelf" className="relative bg-cream pb-20 pt-8 sm:pb-24">
      <div className="container-wide">
        <div className="relative z-30 -mx-2 rounded-2xl border border-line bg-cream/90 px-2 py-3 backdrop-blur-xl sm:mx-0 sm:px-4 lg:sticky lg:top-[4.1rem]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 lg:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <label htmlFor="shop-search" className="sr-only">
                Search products
              </label>
              <input
                id="shop-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the shelf…"
                className="field !min-h-10 !rounded-full !border-line !bg-surface !py-2 !pl-10 !pr-9 !text-[0.8rem]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-sand hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              {(Object.keys(typeLabels) as TypeFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setType(item)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-[0.66rem] font-bold transition-colors",
                    type === item
                      ? "border-ink bg-ink text-cream"
                      : "border-line bg-surface text-ink-soft hover:border-ink/30",
                  )}
                >
                  {typeLabels[item]}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 lg:ml-auto">
              <span className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted">
                <SlidersHorizontal className="size-3" aria-hidden="true" />
                {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
              </span>
              <label htmlFor="shop-sort" className="sr-only">
                Sort products
              </label>
              <select
                id="shop-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                className="h-10 rounded-full border border-line bg-surface px-3 text-[0.72rem] font-semibold text-ink outline-none transition-colors hover:border-ink/30 focus:border-teal"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Highest rated</option>
              </select>
            </div>
          </div>

          {!lockedCategory ? (
            <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto border-t border-line/70 pt-3">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[0.66rem] font-bold transition-colors",
                  category === "all"
                    ? "bg-teal text-cream"
                    : "text-ink-soft hover:bg-surface",
                )}
              >
                All collections · {products.length}
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.slug)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-[0.66rem] font-bold transition-colors",
                    category === item.slug
                      ? "bg-teal text-cream"
                      : "text-ink-soft hover:bg-surface",
                  )}
                >
                  {item.name} · {categoryCounts.get(item.slug) ?? 0}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {filtered.length ? (
          <motion.div
            layout
            className="mt-7 grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((product, index) => (
                <motion.div
                  key={product.slug}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.18),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="mt-12 rounded-[1.5rem] border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
            <p className="font-display text-3xl tracking-[-0.03em] text-ink">
              Nothing on the shelf by that name.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Try a different word, or clear the filters to see every tool in
              the collection.
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={reset}
                className="btn btn-primary mt-6"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[1.4rem] border border-line bg-paper px-6 py-5 sm:flex-row">
          <p className="text-[0.78rem] leading-relaxed text-ink-soft">
            <span className="font-display text-[1.05rem] text-ink">
              Every digital tool has a 7-day access guarantee.
            </span>{" "}
            If a link does not work, we will reset it for you.
          </p>
          <a
            href="https://wa.me/8801341739202"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-teal"
          >
            Talk to support →
          </a>
        </div>
      </div>
    </section>
  );
}
