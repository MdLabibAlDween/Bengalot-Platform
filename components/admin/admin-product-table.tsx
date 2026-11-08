"use client";

import { Search, SquarePen, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductArt } from "@/components/product/product-art";
import { productShelfLabel, productShelfType } from "@/lib/catalog-meta";
import type { Product } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

type TypeFilter = "all" | "digital" | "physical" | "bundle";
type StatusFilter = "all" | "published" | "hidden";

export function AdminProductTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      if (type !== "all" && productShelfType(product) !== type) return false;
      if (status === "published" && !product.is_published) return false;
      if (status === "hidden" && product.is_published) return false;
      if (!needle) return true;
      return `${product.title} ${product.slug} ${product.category_slug}`
        .toLowerCase()
        .includes(needle);
    });
  }, [products, query, type, status]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="admin-product-search" className="sr-only">
            Search products
          </label>
          <input
            id="admin-product-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the shelf…"
            className="field !min-h-9 !py-1.5 !pl-9 !text-[0.76rem]"
          />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {(["all", "digital", "physical", "bundle"] as TypeFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setType(item)}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1.5 text-[0.6rem] font-bold capitalize transition-colors",
                type === item
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-surface text-ink-soft hover:border-ink/30",
              )}
            >
              {item === "all" ? "All types" : item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 lg:ml-auto">
          <label htmlFor="admin-status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="admin-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="h-9 rounded-full border border-line bg-surface px-3 text-[0.68rem] font-semibold text-ink outline-none focus:border-teal"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted">
            {filtered.length} shown
          </span>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[1.2rem] border border-line bg-cream">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left">
            <thead>
              <tr className="border-b border-line bg-paper text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted">
                <th className="px-4 py-3 font-bold">Product</th>
                <th className="px-3 py-3 font-bold">Type</th>
                <th className="px-3 py-3 font-bold">Price</th>
                <th className="px-3 py-3 font-bold">Stock</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-3 py-3 text-center font-bold">Feature</th>
                <th className="px-4 py-3 text-right font-bold">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-line/70 last:border-0 hover:bg-surface/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-line">
                        <ProductArt product={product} showCaption={false} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[0.72rem] font-semibold text-ink">
                          {product.title}
                        </p>
                        <p className="mt-0.5 truncate text-[0.55rem] text-muted">
                          {product.category_slug} · {product.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-surface px-2 py-1 text-[0.52rem] font-bold capitalize text-ink-soft">
                      {productShelfLabel(product)}
                    </span>
                  </td>
                  <td className="price px-3 py-3 text-[0.68rem] font-semibold text-ink">
                    {formatMoney(product.price)}
                  </td>
                  <td className="px-3 py-3 text-[0.65rem] text-ink-soft">
                    {product.type === "physical" ? (
                      <span className={product.stock < 25 ? "font-bold text-coral" : undefined}>
                        {product.stock}
                      </span>
                    ) : (
                      <span className="text-muted">Digital</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.06em]",
                        product.is_published
                          ? "bg-teal-soft/60 text-teal"
                          : "bg-sand text-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          product.is_published ? "bg-teal" : "bg-muted",
                        )}
                      />
                      {product.is_published ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {product.featured ? (
                      <Star className="mx-auto size-3.5 fill-butter text-butter" aria-label="Featured" />
                    ) : (
                      <span className="text-[0.58rem] text-muted/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-ink-soft transition-colors hover:border-teal hover:text-teal"
                    >
                      <SquarePen className="size-3" aria-hidden="true" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[0.76rem] text-muted">No products match these filters.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
