"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ProductRowActions({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    if (
      !window.confirm(
        `Delete “${name}”? This removes the product from the catalogue and storefront. This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    const response = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json().catch(() => ({}));
    setDeleting(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not delete the product.");
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/catalogue/products/${id}`}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border)] px-3 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-indigo transition hover:border-indigo hover:bg-indigo/5"
      >
        Edit <ArrowUpRight className="h-3 w-3" />
      </Link>
      <button
        type="button"
        onClick={() => void remove()}
        disabled={deleting}
        aria-label={`Delete ${name}`}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-rosewood/25 px-3 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-rosewood transition hover:bg-rosewood hover:text-white disabled:opacity-50"
      >
        {deleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
        {deleting ? "Deleting" : "Delete"}
      </button>
    </div>
  );
}
