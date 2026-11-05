"use client";

import Link from "next/link";
import { ArrowRight, Layers, Lock, ShoppingBag, Trash2, X } from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { BengalotMark } from "@/components/brand/logo";
import { JamdaniField } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { products } from "@/lib/data";
import { productForLine } from "@/lib/cart";
import { DemoBadge } from "@/components/storefront/demo-product";
import { productColorPalette } from "@/lib/theme";
import { useCart, useLocale } from "@/lib/providers";
import {
  FREE_DELIVERY_ENABLED,
  FREE_DELIVERY_THRESHOLD,
  cn,
  formatBDT,
} from "@/lib/utils";
import { QuantityStepper } from "@/components/storefront/quantity-stepper";

export function CartDrawer() {
  const { t } = useLocale();
  const {
    isCartOpen,
    closeCart,
    lines,
    subtotal,
    coupon,
    eligibleSubtotal,
    bundleSavings,
    itemCount,
    updateQty,
    removeLine,
    freeShipping,
  } = useCart();

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const inCartDepartments = new Set(
    lines.map((line) => productForLine(line)?.department).filter(Boolean)
  );
  const demoLines = lines.filter((line) => Boolean(productForLine(line)?.isDemo));
  const suggestions = products
    .filter(
      (p) =>
        !lines.some((line) => line.productSlug === p.slug) &&
        (inCartDepartments.size === 0 || inCartDepartments.has(p.department))
    )
    .slice(0, 2);

  return (
    <Dialog open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <DialogContent
        side="right"
        showClose={false}
        className="max-w-[440px] p-0"
      >
        <DialogTitle className="sr-only">{t("cart.title")}</DialogTitle>
        <DialogDescription className="sr-only">
          Items currently in your shopping bag.
        </DialogDescription>

        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo">
              Bengalot
            </p>
            <h2 className="mt-0.5 font-display text-2xl">
              {t("cart.title")}{" "}
              <span className="text-base text-muted-foreground">({itemCount})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] transition hover:border-gold hover:text-gold-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {lines.length > 0 && FREE_DELIVERY_ENABLED && (
          <div className="border-b border-[var(--border)] bg-[var(--muted)]/40 px-5 py-3">
            <p className="text-[0.65rem] text-muted-foreground">
              {freeShipping ? (
                <span className="font-semibold text-jade ">
                  ✦ {t("cart.freeDeliveryUnlocked")}
                </span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{formatBDT(remaining)}</span>{" "}
                  {t("cart.freeDelivery")}
                </>
              )}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  freeShipping
                    ? "bg-jade"
                    : "bg-saffron"
                )}
                style={{ width: `${freeShipping ? 100 : progress}%` }}
              />
            </div>
          </div>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-[var(--border)]">
              <JamdaniField id="cart-empty" color="var(--color-saffron)" opacity={0.14} size={30} />
              <ShoppingBag className="relative h-10 w-10 text-gold" strokeWidth={1.2} />
            </div>
            <h3 className="font-display text-3xl">{t("cart.empty")}</h3>
            <p className="mt-3 max-w-[260px] text-[0.82rem] leading-relaxed text-muted-foreground">
              {t("cart.emptyText")}
            </p>
            <Button asChild variant="gold" className="mt-7">
              <Link href="/collections/new-arrivals" onClick={closeCart}>
                Explore new arrivals <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Link
              href="/offers"
              onClick={closeCart}
              className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-gold-ink"
            >
              View current offers
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {lines.map((line) => {
                const product = productForLine(line);
                if (!product) return null;
                const colorHex = product.colors.find(
                  (color) => color.name === line.color
                )?.hex;
                return (
                  <div
                    key={`${line.productSlug}-${line.size}-${line.color}-${line.bundleId ?? "solo"}`}
                    className="flex gap-3.5 border-b border-[var(--border)] py-4 last:border-0"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={closeCart}
                      className="h-[100px] w-[78px] shrink-0 overflow-hidden rounded-xl"
                    >
                      <ProductArt
                        id={`drawer-${product.slug}-${line.color}`}
                        art={product.art}
                        paletteOverride={
                          colorHex ? productColorPalette(colorHex) : undefined
                        }
                        colorName={line.color}
                        showCaption={false}
                        showMonogram={false}
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={closeCart}
                          className="text-[0.83rem] font-medium leading-snug hover:text-gold-ink"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            removeLine(line.productSlug, line.size, line.color, line.bundleId)
                          }
                          aria-label={`Remove ${product.name}`}
                          className="shrink-0 text-muted-foreground transition hover:text-rosewood"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {line.bundleId && (
                        <p className="mt-1 flex items-center gap-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-gold">
                          <Layers className="h-2.5 w-2.5" /> Bundle: {line.bundleName}
                        </p>
                      )}
                      {product.isDemo && <DemoBadge compact className="mt-1.5" />}
                      <p className="mt-1 text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground">
                        {line.color} · {line.size}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <QuantityStepper
                          value={line.qty}
                          min={1}
                          max={10}
                          size="sm"
                          onChange={(qty) =>
                            updateQty(
                              line.productSlug,
                              line.size,
                              line.color,
                              qty,
                              line.bundleId
                            )
                          }
                        />
                        <span className="text-[0.82rem] font-semibold tabular-nums">
                          {formatBDT(product.price * line.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {lines.length < 3 && suggestions.length > 0 && (
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <p className="text-[0.52rem] font-bold uppercase tracking-[0.18em] text-gold-ink">
                    Complete the look
                  </p>
                  <div className="mt-2.5 space-y-2">
                    {suggestions.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/product/${product.slug}`}
                        onClick={closeCart}
                        className="group flex items-center gap-3 rounded-xl border border-[var(--border)] p-2 transition hover:border-gold"
                      >
                        <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md">
                          <ProductArt
                            id={`drawer-suggest-${product.slug}`}
                            art={product.art}
                            palette={product.palette}
                            showCaption={false}
                            showMonogram={false}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.68rem] font-medium transition group-hover:text-gold-ink-ink">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-[0.6rem] tabular-nums text-muted-foreground">
                            {formatBDT(product.price)}
                          </p>
                        </div>
                        <ArrowRight className="mr-1 h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-gold-ink-ink" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)] bg-[var(--surface)] px-5 pb-6 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums">{formatBDT(subtotal)}</span>
              </div>
              {coupon && (coupon.productSlugs?.length ?? 0) > 0 && (
                <div className="mt-1 flex items-center justify-between text-[0.62rem] text-muted-foreground">
                  <span>Eligible for {coupon.code}</span>
                  <span className="tabular-nums">{formatBDT(eligibleSubtotal)}</span>
                </div>
              )}
              {bundleSavings > 0 && (
                <div className="mt-1 flex items-center justify-between text-[0.72rem] text-jade ">
                  <span>Bundle savings</span>
                  <span className="tabular-nums">−{formatBDT(bundleSavings)}</span>
                </div>
              )}
              <p className="mt-1 text-[0.65rem] text-muted-foreground">
                Delivery calculated at checkout · Cash on delivery available
              </p>
              {demoLines.length > 0 && (
                <div className="mt-3 rounded-xl border border-gold/35 bg-gold/[0.07] p-3">
                  <p className="text-[0.56rem] leading-relaxed text-gold-ink">
                    <span className="font-bold">Demo items are not orderable.</span>{" "}
                    Remove them in your bag to continue to checkout.
                  </p>
                </div>
              )}
              <div className="mt-4 grid gap-2">
                {demoLines.length > 0 ? (
                  <Button disabled variant="gold" size="lg">
                    Remove demo items to checkout
                  </Button>
                ) : (
                  <Button asChild variant="gold" size="lg" onClick={closeCart}>
                    <Link href="/checkout">
                      {t("common.checkout")} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" onClick={closeCart}>
                  <Link href="/cart">{t("common.viewCart")}</Link>
                </Button>
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.6rem] text-muted-foreground">
                <Lock className="h-3 w-3" /> {t("cart.secure")}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 opacity-60">
                <BengalotMark className="h-5 w-5" />
                <span className="text-[0.52rem] font-semibold uppercase tracking-[0.22em]">
                  Bengalot
                </span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
