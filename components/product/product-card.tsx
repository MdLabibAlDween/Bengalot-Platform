"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductArt } from "@/components/product/product-art";
import { productShelfLabel } from "@/lib/catalog-meta";
import type { Product } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

export function ProductCard({
  product,
  className,
  compact = false,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  const discount =
    product.compare_at && product.compare_at > product.price
      ? Math.round((1 - product.price / product.compare_at) * 100)
      : null;

  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[1.55rem] bg-sand shadow-[0_20px_50px_-38px_rgba(21,34,50,0.5)] transition-shadow duration-300 group-hover:shadow-[0_28px_62px_-32px_rgba(21,34,50,0.5)]">
        <Link
          href={`/product/${product.slug}`}
          className="block focus-visible:outline-offset-[-4px]"
        >
          <div className={cn("relative", compact ? "aspect-[4/4.6]" : "aspect-[4/4.9]")}>
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.025]">
              <ProductArt
                product={product}
                view="front"
                showCaption
                className="transition-opacity duration-300"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 translate-y-2 scale-[1.015] opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100">
              <ProductArt product={product} view="back" showCaption />
            </div>

            <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
              {product.badge ? (
                <span className="chip !border-cream/30 !bg-cream/90 !text-ink">
                  {product.badge}
                </span>
              ) : null}
              {discount && !product.badge?.toLowerCase().includes("save") ? (
                <span className="chip !border-transparent !bg-coral !text-cream">
                  −{discount}%
                </span>
              ) : null}
            </div>

            <div className="absolute right-3.5 top-3.5">
              <span className="chip !border-cream/20 !bg-ink/45 !text-cream backdrop-blur-md">
                {productShelfLabel(product)}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-3 items-center justify-center pb-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/92 px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink shadow-lg backdrop-blur">
                See inside
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>

        <AddToCartButton
          product={product}
          mode="icon"
          className="absolute bottom-3.5 right-3.5 z-30 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 max-lg:translate-y-0 max-lg:opacity-100"
        />
      </div>

      <div className="flex flex-1 items-start justify-between gap-3 px-1 pt-4">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-muted">
            {product.format}
          </p>
          <h3 className="mt-1.5 font-display text-[1.23rem] leading-[1.12] tracking-[-0.025em] text-ink">
            <Link
              href={`/product/${product.slug}`}
              className="link-line decoration-ink/30"
            >
              {product.title}
            </Link>
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="price font-display text-[1.1rem] font-semibold text-ink">
            {formatMoney(product.price)}
          </p>
          {product.compare_at ? (
            <p className="price mt-0.5 text-[0.72rem] text-muted line-through">
              {formatMoney(product.compare_at)}
            </p>
          ) : (
            <p className="mt-0.5 text-[0.68rem] font-medium text-muted">
              {product.type === "physical" ? "Ships in 2–4 days" : "Instant access"}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
