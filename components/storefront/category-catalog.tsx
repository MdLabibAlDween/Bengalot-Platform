"use client";

import { useMemo, useState } from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
} from "@/components/ui/input";
import type { Product } from "@/lib/types";
import { cn, formatBDT } from "@/lib/utils";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

const sortLabels: Record<SortKey, string> = {
  featured: "Featured",
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border)] py-5 last:border-0">
      <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

export function CategoryCatalog({
  products,
}: {
  products: Product[];
}) {
  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    const min = Math.floor(Math.min(...prices) / 500) * 500;
    const max = Math.ceil(Math.max(...prices) / 500) * 500;
    return { min, max: Math.max(max, min + 500) };
  }, [products]);

  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes.map((s) => s.label)))),
    [products]
  );
  const colors = useMemo(() => {
    const seen = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => seen.set(c.name, c.hex)));
    return Array.from(seen.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  const [sort, setSort] = useState<SortKey>("featured");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [shown, setShown] = useState(9);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleSize = (size: string) =>
    setSelectedSizes((current) =>
      current.includes(size) ? current.filter((s) => s !== size) : [...current, size]
    );
  const toggleColor = (color: string) =>
    setSelectedColors((current) =>
      current.includes(color) ? current.filter((c) => c !== color) : [...current, color]
    );

  const clearAll = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(priceBounds.max);
    setInStockOnly(false);
  };

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      if (product.price > maxPrice) return false;
      if (inStockOnly && product.stock <= 0) return false;
      if (
        selectedSizes.length > 0 &&
        !product.sizes.some((s) => selectedSizes.includes(s.label) && s.stock > 0)
      )
        return false;
      if (
        selectedColors.length > 0 &&
        !product.colors.some((c) => selectedColors.includes(c.name))
      )
        return false;
      return true;
    });

    switch (sort) {
      case "newest":
        return result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      case "price-asc":
        return result.sort((a, b) => a.price - b.price);
      case "price-desc":
        return result.sort((a, b) => b.price - a.price);
      default:
        return result;
    }
  }, [products, sort, selectedSizes, selectedColors, maxPrice, inStockOnly]);

  const activeCount =
    selectedSizes.length +
    selectedColors.length +
    (maxPrice < priceBounds.max ? 1 : 0) +
    (inStockOnly ? 1 : 0);
  const activeChips: { label: string; onRemove: () => void }[] = [
    ...selectedSizes.map((size) => ({
      label: `Size ${size}`,
      onRemove: () => toggleSize(size),
    })),
    ...selectedColors.map((color) => ({
      label: color,
      onRemove: () => toggleColor(color),
    })),
    ...(maxPrice < priceBounds.max
      ? [
          {
            label: `Up to ${formatBDT(maxPrice)}`,
            onRemove: () => setMaxPrice(priceBounds.max),
          },
        ]
      : []),
    ...(inStockOnly
      ? [{ label: "In stock", onRemove: () => setInStockOnly(false) }]
      : []),
  ];

  const FilterPanel = (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em]">Refinements</p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 transition hover:text-gold-ink hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                aria-pressed={active}
                className={cn(
                  "min-w-[42px] rounded-lg border px-2.5 py-1.5 text-[0.65rem] font-semibold transition",
                  active
                    ? "border-midnight bg-midnight text-ivory"
                    : "border-[var(--border)] text-muted-foreground hover:border-[var(--line-strong)] hover:text-foreground"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2.5">
          {colors.map((color) => {
            const active = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleColor(color.name)}
                aria-pressed={active}
                title={color.name}
                className={cn(
                  "relative grid h-7 w-7 place-items-center rounded-full border-2 transition",
                  active
                    ? "border-gold ring-2 ring-gold/20 ring-offset-2 ring-offset-[var(--background)]"
                    : "border-transparent hover:scale-110"
                )}
              >
                <span
                  className="h-full w-full rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                {active && (
                  <Check
                    className="absolute h-3.5 w-3.5"
                    style={{
                      color:
                        ["#EFE5D2", "#B7A184", "#C8A15A"].includes(color.hex)
                          ? "var(--color-ink)"
                          : "#FFFFFF",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
          <span>{formatBDT(priceBounds.min)}</span>
          <span className="font-semibold text-foreground">{formatBDT(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          aria-label="Maximum price"
          className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--border)] accent-[var(--color-saffron)]"
        />
      </FilterSection>

      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 text-[0.72rem] text-muted-foreground">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-saffron)]"
          />
          In stock only
        </label>
      </FilterSection>

      <div className="mt-5 rounded-xl bg-[var(--muted)] p-4">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-indigo">
          Fit advice
        </p>
        <p className="mt-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
          Not sure between two sizes? Message us on WhatsApp and we will help.
        </p>
        <a
          href="https://wa.me/8801341739202"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-[0.58rem] font-bold uppercase tracking-[0.12em] underline-offset-4 hover:underline"
        >
          Ask the atelier →
        </a>
      </div>
    </div>
  );

  return (
    <div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "piece" : "pieces"}
            {activeCount > 0 && " · refined"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 items-center gap-2 rounded-full border border-[var(--border)] px-3.5 text-[0.62rem] font-semibold transition hover:border-gold"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.5rem] text-midnight">
                  {activeCount}
                </span>
              )}
            </button>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="h-9 w-auto rounded-full border-[var(--border)] py-0 pl-3.5 pr-9 text-[0.64rem] font-semibold"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onRemove}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.62rem] font-medium transition hover:border-gold"
              >
                {chip.label}
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-gold-ink hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length > 0 ? (
          <>
            <ProductGrid className="mt-6">
              {filtered.slice(0, shown).map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ProductGrid>
            {filtered.length > shown && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShown((n) => n + 6)}
                  className="min-w-[180px]"
                >
                  Load more pieces
                </Button>
                <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Showing {Math.min(shown, filtered.length)} of {filtered.length}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] py-16 text-center">
            <p className="font-display text-2xl">Nothing matches those refinements.</p>
            <p className="mx-auto mt-2 max-w-sm text-[0.78rem] leading-relaxed text-muted-foreground">
              Try removing a filter. The whole collection is still worth a look.
            </p>
            <Button variant="gold" onClick={clearAll} className="mt-5">
              Clear refinements
            </Button>
          </div>
        )}
      </div>

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent side="right" className="p-0">
          <div className="border-b border-[var(--border)] px-5 py-5">
            <DialogTitle className="font-display text-2xl">Refine the collection</DialogTitle>
            <DialogDescription className="sr-only">
              Filter products by size, color, price and availability.
            </DialogDescription>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-24">{FilterPanel}</div>
          <div className="absolute inset-x-0 bottom-0 border-t border-[var(--border)] bg-[var(--surface)] p-4">
            <Button
              variant="gold"
              className="w-full"
              onClick={() => setDrawerOpen(false)}
            >
              Show {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
