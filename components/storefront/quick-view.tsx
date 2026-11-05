"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/brand/product-art";
import { DemoBadge, DemoOrderNotice } from "@/components/storefront/demo-product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCategory, getDepartment } from "@/lib/data";
import { productColorPalette } from "@/lib/theme";
import { useCart, useWishlist } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { Product } from "@/lib/types";
import { reviewsFor } from "@/lib/data";
import { colorStock, variantStock } from "@/lib/variants";
import { cn, discountedPrice, formatBDT } from "@/lib/utils";
import { RatingStars } from "./rating-stars";

export function ProductQuickView({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { profile, catalog } = useSiteConfig();
  const wishlist = useWishlist();
  const category = catalog?.loaded
    ? catalog.categories.find(
        (item) =>
          item.department === product.department && item.slug === product.category
      ) ?? getCategory(product.department, product.category)
    : getCategory(product.department, product.category);
  const department = getDepartment(product.department);
  const variants = product.variants ?? [];
  const firstAvailable = variants.length
    ? variants.find((variant) => variant.stock > 0)?.size ??
      product.sizes[0]?.label ??
      ""
    : product.sizes.find((s) => s.stock > 0)?.label ?? product.sizes[0]?.label ?? "";
  const [color, setColor] = useState(product.colors[0]?.name ?? "Default");
  const [size, setSize] = useState(firstAvailable);
  const showColors = product.colors.length > 1;
  const showSizes = product.sizes.length > 1;
  const colorHex = product.colors.find((option) => option.name === color)?.hex;
  const { addLine } = useCart();
  const selectedVariant = variants.find(
    (variant) => variant.size === size && variant.color === color
  );
  const activePrice = selectedVariant?.price ?? product.price;
  const activeCompareAt = selectedVariant?.compareAt ?? product.compareAt;
  const off = discountedPrice(activePrice, activeCompareAt);
  const selectedStock = variants.length
    ? variantStock(variants, size, color) ?? 0
    : product.sizes.find((option) => option.label === size)?.stock ?? 0;
  const isDemo = Boolean(product.isDemo);

  const add = () => {
    if (isDemo) {
      toast.error("Demo product — ordering is disabled.", {
        description: "This is a preview listing while the real product is prepared.",
      });
      return;
    }
    if (selectedStock <= 0) {
      toast.error("That combination is sold out.");
      return;
    }
    addLine(
      { productSlug: product.slug, size, color, qty: 1, snapshot: product },
      { openDrawer: true }
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Quick view for {product.name}
        </DialogDescription>
        <div className="grid max-h-[88vh] overflow-y-auto md:grid-cols-[0.92fr_1.08fr] md:overflow-hidden">
          <div className="relative h-56 md:h-auto md:min-h-[520px]">
            {product.images?.[0]?.url || product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images?.[0]?.url || product.imageUrl || ""}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ProductArt
                id={`qv-${product.slug}`}
                art={product.art}
                paletteOverride={
                  colorHex ? productColorPalette(colorHex) : undefined
                }
                colorName={color}
                showCaption={false}
                rounded={false}
              />
            )}
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
              {isDemo && <DemoBadge compact />}
              {product.compareAt && <Badge variant="sale">Sale</Badge>}
              {product.badge && (
                <Badge variant={product.badge === "Bestseller" ? "bestseller" : product.badge === "Limited" ? "limited" : "new"}>
                  {product.badge}
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 md:max-h-[88vh] md:overflow-y-auto">
            <div className="mb-4 flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span>{department?.name}</span>
              <span className="h-1 w-1 rounded-full bg-gold" />
              <span>{category?.name}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-3xl leading-tight">{product.name}</h3>
              <button
                type="button"
                aria-label={wishlist.has(product.slug) ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => wishlist.toggle(product.slug)}
                className={cn(
                  "mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition",
                  wishlist.has(product.slug)
                    ? "border-rosewood/30 bg-rosewood/10 text-rosewood"
                    : "border-[var(--border)] text-muted-foreground hover:border-rosewood hover:text-rosewood"
                )}
              >
                <Heart className={cn("h-4 w-4", wishlist.has(product.slug) && "fill-current")} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-3">
              {(() => {
                const productReviews = reviewsFor(product.slug);
                if (productReviews.length === 0) return null;
                const average =
                  productReviews.reduce((sum, review) => sum + review.rating, 0) /
                  productReviews.length;
                return (
                  <RatingStars
                    rating={average}
                    showValue
                    count={productReviews.length}
                  />
                );
              })()}
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-xl font-semibold tabular-nums">{formatBDT(activePrice)}</span>
              {activeCompareAt && (
                <>
                  <span className="text-sm text-muted-foreground line-through tabular-nums">
                    {formatBDT(activeCompareAt)}
                  </span>
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-rosewood">
                    {off}% off
                  </span>
                </>
              )}
            </div>
            <p className="mt-4 text-[0.86rem] leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>

            {isDemo && <DemoOrderNotice compact className="mt-4" />}

            {showColors && (
            <div className="mt-6">
              <p className="mb-2.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Color · <span className="text-foreground">{color}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => {
                  const unavailable = variants.length
                    ? (colorStock(variants, c.name) ?? 0) <= 0
                    : product.stock <= 0;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      disabled={unavailable}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      className={cn(
                        "h-7 w-7 rounded-full border-2 transition",
                        color === c.name
                          ? "border-gold ring-2 ring-gold/25 ring-offset-2 ring-offset-[var(--surface)]"
                          : "border-white/40 hover:scale-105",
                        unavailable && "cursor-not-allowed opacity-40"
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  );
                })}
              </div>
            </div>
            )}

            {showSizes && (
            <div className="mt-5">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Size
                </p>
                <Link
                  href={`/product/${product.slug}#size-guide`}
                  className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-indigo underline-offset-4 hover:underline "
                >
                  Size guide
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const stock = variants.length
                    ? variantStock(variants, s.label, color) ?? 0
                    : s.stock;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      disabled={stock === 0}
                      onClick={() => setSize(s.label)}
                      className={cn(
                        "min-w-[46px] rounded-lg border px-3 py-2 text-[0.72rem] font-semibold transition",
                        size === s.label
                          ? "border-midnight bg-midnight text-ivory"
                          : "border-[var(--border)] hover:border-[var(--line-strong)]",
                        stock === 0 && "cursor-not-allowed line-through opacity-35"
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={add}
                className="flex-1"
                variant="gold"
                size="lg"
                disabled={isDemo || selectedStock <= 0}
              >
                <ShoppingBag className="h-4 w-4" />
                {isDemo ? "Ordering disabled" : selectedStock <= 0 ? "Sold out" : "Add to bag"}
              </Button>
            </div>
            <Link
              href={`/product/${product.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition hover:text-gold-ink"
            >
              Full details <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <div className="mt-7 border-t border-[var(--border)] pt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
              {isDemo
                ? "Demo listing · no payment, shipping or delivery will be arranged."
                : `Cash on delivery available · Delivery ${formatBDT(profile.deliveryInside)} inside Faridpur, ${formatBDT(profile.deliveryOutside)} elsewhere.`}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
