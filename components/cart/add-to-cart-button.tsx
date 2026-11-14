"use client";

import { Check, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { hasDigitalContent } from "@/lib/bundles";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function toCartLine(product: Product) {
  return {
    slug: product.slug,
    title: product.title,
    price: product.price,
    compare_at: product.compare_at,
    type: product.type,
    format: product.format,
    art_key: product.art_key,
    palette: product.palette,
    stock: product.stock,
    has_digital_content: hasDigitalContent(product),
  };
}

export function AddToCartButton({
  product,
  mode = "full",
  className,
  label = "Add to bag",
}: {
  product: Product;
  mode?: "full" | "icon";
  className?: string;
  label?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [added]);

  function handleAdd() {
    addItem(toCartLine(product));
    setAdded(true);
  }

  if (mode === "icon") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`${label}: ${product.title}`}
        className={cn(
          "relative grid size-11 place-items-center rounded-full border border-white/40 bg-cream/92 text-ink shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-butter active:scale-95",
          added && "bg-teal text-cream hover:bg-teal",
          className,
        )}
      >
        <span className="sr-only">{added ? "Added to bag" : label}</span>
        {added ? (
          <Check className="size-4.5" aria-hidden="true" />
        ) : (
          <Plus className="size-4.5" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleAdd}
      size="lg"
      className={cn(
        "w-full overflow-hidden transition-colors",
        added && "!bg-teal !text-cream",
        className,
      )}
    >
      {added ? (
        <Check className="size-4.5" aria-hidden="true" />
      ) : (
        <ShoppingBag className="size-4.5" aria-hidden="true" />
      )}
      <span aria-live="polite">{added ? "Added to bag" : label}</span>
    </Button>
  );
}
