"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { ProductArt } from "@/components/product/product-art";
import type { Category, Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function SearchDialog({
  open,
  onClose,
  products,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) {
      return products.filter((product) => product.featured).slice(0, 4);
    }
    return products
      .filter((product) => {
        const haystack = [
          product.title,
          product.subtitle,
          product.format,
          product.category_slug,
          ...product.tags,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
      .slice(0, 6);
  }, [deferredQuery, products]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center p-0 sm:p-6 md:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-navy/55 backdrop-blur-sm"
            aria-label="Close search"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search Bengalot"
            className="relative flex h-dvh w-full max-w-[46rem] flex-col overflow-hidden border border-line bg-cream shadow-[0_40px_100px_-25px_rgba(16,28,42,0.7)] sm:h-auto sm:max-h-[82vh] sm:rounded-[1.8rem]"
            initial={{ opacity: 0, y: -18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-7 sm:py-5">
              <Search className="size-5 text-teal" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates, cards, planners…"
                className="h-10 min-w-0 flex-1 bg-transparent text-[0.98rem] text-ink outline-none placeholder:text-muted"
                aria-label="Search products"
              />
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-teal hover:text-teal"
                aria-label="Close search"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
              {!query.trim() ? (
                <div>
                  <p className="eyebrow eyebrow-no-dot text-[0.62rem] text-muted">
                    Explore by room
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/shop/${category.slug}`}
                        onClick={onClose}
                        className="rounded-full border border-line bg-surface px-3.5 py-2 text-[0.72rem] font-semibold text-ink-soft transition-colors hover:border-teal hover:text-teal"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between">
                <p className="eyebrow eyebrow-no-dot !text-[0.62rem]">
                  {query.trim()
                    ? `${results.length} result${results.length === 1 ? "" : "s"}`
                    : "Popular right now"}
                </p>
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-[0.68rem] font-semibold text-muted underline underline-offset-4 hover:text-ink"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="mt-3 space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 rounded-2xl border border-transparent p-2 transition-colors hover:border-line hover:bg-surface"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl">
                      <ProductArt product={product} view="front" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[1.02rem] leading-tight text-ink">
                        {product.title}
                      </p>
                      <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-muted">
                        {product.format}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="price text-[0.82rem] font-semibold text-ink">
                        {formatMoney(product.price)}
                      </p>
                      <ArrowRight className="ml-auto mt-1 size-3.5 text-muted transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>

              {query.trim() && results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
                  <p className="font-display text-2xl text-ink">
                    Nothing by that name yet.
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                    Try “cards”, “planner”, “Notion” or browse every tool in the
                    shop.
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-5 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-teal"
                  >
                    Open the shop
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="hidden items-center justify-between border-t border-line bg-paper px-7 py-3.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted sm:flex">
              <span>Search the Bengalot shelf</span>
              <span className="rounded border border-line-strong px-1.5 py-0.5 text-[0.58rem]">
                ESC to close
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
