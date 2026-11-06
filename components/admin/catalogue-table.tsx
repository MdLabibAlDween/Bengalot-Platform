"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { formatBDT } from "@/lib/utils";

export type CatalogueProduct = {
  id: string;
  slug: string;
  name: string;
  status: string;
  department: string;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  payload: Record<string, unknown> | null;
};

export function CatalogueTable({ products }: { products: CatalogueProduct[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const validIds = new Set(products.map((product) => product.id));
  const selectedCount = [...selected].filter((id) => validIds.has(id)).length;
  const allSelected = products.length > 0 && selectedCount === products.length;
  const someSelected = selectedCount > 0 && selectedCount < products.length;

  useEffect(() => {
    const ids = new Set(products.map((product) => product.id));
    setSelected((current) => {
      const next = new Set([...current].filter((id) => ids.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [products]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(products.map((product) => product.id)));
  };

  const removeSelected = async () => {
    if (selectedCount === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedCount} selected product${selectedCount === 1 ? "" : "s"}? This removes them from the catalogue and storefront. This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    const response = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected] }),
    });
    const result = await response.json().catch(() => ({}));
    setDeleting(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not delete the selected products.");
      return;
    }
    toast.success(
      `${result.deleted ?? selectedCount} product${(result.deleted ?? selectedCount) === 1 ? "" : "s"} deleted`
    );
    setSelected(new Set());
    router.refresh();
  };

  return (
    <div>
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rosewood/20 bg-rosewood/[0.04] px-5 py-3">
          <p className="text-[0.62rem] font-semibold">
            {selectedCount} selected
            <span className="ml-2 font-normal text-muted-foreground">
              Demo rows can be cleared in one go.
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              disabled={deleting}
              className="h-8 rounded-full border border-[var(--border)] px-3 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:border-foreground hover:text-foreground disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => void removeSelected()}
              disabled={deleting}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rosewood/30 px-3.5 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-rosewood transition hover:bg-rosewood hover:text-white disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              {deleting ? "Deleting" : `Delete selected (${selectedCount})`}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left">
          <thead className="bg-[var(--muted)] text-[0.48rem] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-2.5">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all products"
                  className="h-4 w-4 accent-[var(--color-saffron)]"
                />
              </th>
              {["Product", "Department", "Price", "Stock", "Status", ""].map((head) => (
                <th key={head} className="px-4 py-2.5">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-[0.66rem]">
            {products.map((product) => {
              const isDemo = Boolean(
                (product.payload as { isDemo?: boolean } | null)?.isDemo
              );
              return (
                <tr
                  key={product.id}
                  className={selected.has(product.id) ? "bg-indigo/[0.035]" : undefined}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggle(product.id)}
                      aria-label={`Select ${product.name}`}
                      className="h-4 w-4 accent-[var(--color-saffron)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--muted)] text-[0.5rem] font-bold text-muted-foreground">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          product.name.slice(0, 2).toUpperCase()
                        )}
                      </span>
                      <span>
                        <span className="block font-semibold">{product.name}</span>
                        <span className="block font-mono text-[0.5rem] text-muted-foreground">
                          {product.slug}
                        </span>
                        {isDemo && (
                          <span className="mt-1 inline-flex rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[0.44rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
                            Demo · ordering disabled
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {product.department} / {product.category}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatBDT(Number(product.price))}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[0.48rem] font-bold uppercase tracking-[0.08em] ${
                        product.status === "published"
                          ? "bg-jade/10 text-jade"
                          : "bg-[var(--muted)] text-muted-foreground"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions id={product.id} name={product.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
