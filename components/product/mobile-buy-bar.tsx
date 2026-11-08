"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { toCartLine } from "@/components/cart/add-to-cart-button";
import { useCart } from "@/components/cart/cart-provider";
import { ProductArt } from "@/components/product/product-art";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function MobileBuyBar({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max =
          document.documentElement.scrollHeight - window.innerHeight - 320;
        setShow(y > 560 && y < max);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-[70] transition-all duration-300 lg:hidden ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-cream/95 p-2 shadow-[0_20px_50px_-20px_rgba(16,28,42,0.5)] backdrop-blur-xl">
        <div className="size-11 shrink-0 overflow-hidden rounded-xl">
          <ProductArt product={product} showCaption={false} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.72rem] font-semibold text-ink">
            {product.title}
          </p>
          <p className="price text-[0.66rem] text-muted">
            {formatMoney(product.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => addItem(toCartLine(product))}
          className="btn btn-primary btn-sm shrink-0"
          aria-label={`Add ${product.title} to bag`}
        >
          <ShoppingBag className="size-3.5" aria-hidden="true" />
          Add
        </button>
      </div>
    </div>
  );
}
