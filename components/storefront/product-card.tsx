"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { DemoBadge } from "@/components/storefront/demo-product";
import { Badge } from "@/components/ui/badge";
import { getCategory, getDepartment } from "@/lib/data";
import { useWishlist } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { Product } from "@/lib/types";
import { cn, discountedPrice, formatBDT } from "@/lib/utils";
import { ProductQuickView } from "./quick-view";

export function ProductCard({
  product,
  className,
  compact = false,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  const [quickOpen, setQuickOpen] = useState(false);
  const wishlist = useWishlist();
  const { media, catalog } = useSiteConfig();
  const mainImage =
    media[`product.${product.slug}.main`] ||
    media["product-default"] ||
    product.imageUrl;
  const hoverImage =
    media[`product.${product.slug}.hover`] ||
    media["product-hover-default"] ||
    product.hoverImageUrl ||
    mainImage;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const category = catalog?.loaded
    ? catalog.categories.find(
        (item) =>
          item.department === product.department && item.slug === product.category
      ) ?? getCategory(product.department, product.category)
    : getCategory(product.department, product.category);
  const department = getDepartment(product.department);
  const off = discountedPrice(product.price, product.compareAt);
  const saved = wishlist.has(product.slug);
  const soldOut = product.stock <= 0;
  const isDemo = Boolean(product.isDemo);
  const badges = [
    off
      ? {
          label: `−${off}%`,
          variant: "sale" as const,
          className: "border-transparent bg-rosewood text-white shadow-sm",
        }
      : null,
    product.badge === "New"
      ? {
          label: "New",
          variant: "new" as const,
          className: "border-transparent bg-teal text-ink shadow-sm",
        }
      : product.badge === "Bestseller"
        ? {
            label: "Bestseller",
            variant: "bestseller" as const,
            className: "border-transparent bg-gold text-midnight shadow-sm",
          }
        : null,
    soldOut
      ? {
          label: "Sold out",
          variant: "dark" as const,
          className: "border-transparent bg-midnight text-ivory shadow-sm",
        }
      : null,
  ]
    .filter(Boolean)
    .slice(0, 2);

  return (
    <>
      <article
        className={cn(
          "group relative flex h-full w-full max-w-[300px] flex-col transition duration-500 hover:-translate-y-1",
          className
        )}
      >
        <div className="relative overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-sand)] shadow-[0_18px_44px_-34px_rgba(36,26,80,0.34)] transition duration-500 group-hover:border-[var(--color-border)] group-hover:shadow-[0_26px_54px_-34px_rgba(36,26,80,0.4)]">
          <Link
            href={`/product/${product.slug}`}
            className="block aspect-[4/5] overflow-hidden"
            aria-label={`View ${product.name}`}
          >
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImage}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ProductArt
                  id={`card-${uid}-${product.slug}-a`}
                  art={product.art}
                  palette={product.palette}
                  showCaption={false}
                  showMonogram={false}
                />
              )}
            </div>
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
              {hoverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hoverImage}
                  alt={`${product.name} alternate view`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ProductArt
                  id={`card-${uid}-${product.slug}-b`}
                  art={product.art}
                  palette={[product.palette[1], product.palette[0]]}
                  showCaption={false}
                  showMonogram={false}
                />
              )}
            </div>
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-4.5rem)] flex-col items-start gap-1.5">
            {isDemo && <DemoBadge compact />}
            {badges.map((badge) =>
              badge ? (
                <Badge
                  key={badge.label}
                  variant={badge.variant}
                  className={badge.className}
                >
                  {badge.label}
                </Badge>
              ) : null
            )}
          </div>

          <button
            type="button"
            onClick={() => wishlist.toggle(product.slug)}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={saved}
            className={cn(
              "absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/30 backdrop-blur-md transition-all duration-300",
              saved
                ? "bg-rosewood text-white"
                : "bg-white/85 text-midnight hover:bg-rosewood hover:text-white"
            )}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-current")} />
          </button>

          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className="absolute inset-x-3 bottom-3 z-10 flex h-10 items-center justify-center gap-2 rounded-full bg-ivory/95 text-xs font-bold uppercase tracking-[0.12em] text-midnight backdrop-blur-md transition-all duration-300 hover:bg-indigo hover:text-ivory md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Quick view
          </button>
        </div>

        <div className={cn("flex flex-1 flex-col pt-3.5", compact && "pt-3")}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="line-clamp-2 min-w-0 break-words text-xs font-bold uppercase leading-snug tracking-[0.1em] text-[var(--color-muted-foreground)]">
              {department?.name} · {category?.name}
            </p>
            <div className="flex shrink-0 items-center -space-x-1">
              {product.colors.slice(0, 3).map((color) => (
                <span
                  key={color.name}
                  title={color.name}
                  className="h-3 w-3 rounded-full border-2 border-[var(--color-ivory)]"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="line-clamp-2 font-display text-[15px] leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-gold-ink)] sm:text-base">
              {product.name}
            </h3>
          </Link>
          {isDemo && (
            <p className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
              Demo product · ordering disabled
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-2">
            <span className="text-[15px] font-semibold tabular-nums text-[var(--color-ink)]">
              {formatBDT(product.price)}
            </span>
            {product.compareAt && (
              <span className="text-xs text-[var(--color-muted-foreground)] line-through tabular-nums">
                {formatBDT(product.compareAt)}
              </span>
            )}
            {off && (
              <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-magenta)]">
                Save {off}%
              </span>
            )}
          </div>
        </div>
      </article>

      <ProductQuickView
        product={product}
        open={quickOpen}
        onOpenChange={setQuickOpen}
      />
    </>
  );
}
