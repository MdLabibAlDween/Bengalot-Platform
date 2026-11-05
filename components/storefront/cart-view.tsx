"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Heart,
  Layers,
  Lock,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/brand/product-art";
import { JamdaniField, SealStamp } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { DemoBadge } from "@/components/storefront/demo-product";
import { QuantityStepper } from "@/components/storefront/quantity-stepper";
import { getBundleCartGroups } from "@/lib/bundles";
import { products } from "@/lib/data";
import { productForLine } from "@/lib/cart";
import { productColorPalette } from "@/lib/theme";
import {
  useCart,
  useLocale,
  useWishlist,
} from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { CartLine } from "@/lib/types";
import {
  cn,
  deliveryChargeFor,
  formatBDT,
  FREE_DELIVERY_ENABLED,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/utils";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { DISTRICTS, WHATSAPP_LINK } from "@/lib/constants";
import { deliveryNotice, exchangeNotice } from "@/lib/settings";

export function CartView() {
  const {
    lines,
    subtotal,
    discount,
    bundleSavings,
    coupon,
    couponCode,
    eligibleSubtotal,
    freeShipping,
    itemCount,
    updateQty,
    removeLine,
    updateLineVariant,
    applyCoupon,
    removeCoupon,
    hydrated,
  } = useCart();
  const { t } = useLocale();
  const { profile } = useSiteConfig();
  const wishlist = useWishlist();
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [district, setDistrict] = useState("");

  const fee = district
    ? deliveryChargeFor(district, profile.deliveryInside, profile.deliveryOutside)
    : null;
  const deliveryCost = freeShipping ? 0 : fee;
  const total = Math.max(0, subtotal - discount - bundleSavings) + (deliveryCost ?? 0);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const bundleGroups = getBundleCartGroups(lines);
  const knownBundleIds = new Set(bundleGroups.map((group) => group.bundle.slug));
  const standaloneLines = lines.filter(
    (line) => !line.bundleId || !knownBundleIds.has(line.bundleId)
  );
  const incompleteGroups = bundleGroups.filter((group) => !group.complete);
  const demoLines = lines.filter((line) => Boolean(productForLine(line)?.isDemo));

  const removeDemoLines = () => {
    demoLines.forEach((line) =>
      removeLine(line.productSlug, line.size, line.color, line.bundleId)
    );
    toast.success("Demo items removed", {
      description: "You can now continue with any real products in your bag.",
    });
  };

  const inCartDepartments = new Set(
    lines.map((line) => productForLine(line)?.department).filter(Boolean)
  );
  const suggestions = products
    .filter(
      (p) =>
        !lines.some((line) => line.productSlug === p.slug) &&
        (inCartDepartments.size === 0 || inCartDepartments.has(p.department))
    )
    .slice(0, 4);

  const submitCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const result = applyCoupon(code);
    if (result.ok) {
      setCouponError("");
      setCode("");
      toast.success(result.message);
    } else {
      setCouponError(result.message);
    }
  };

  const moveToWishlist = (line: CartLine) => {
    const product = productForLine(line);
    if (!product) return;
    if (!wishlist.has(product.slug)) wishlist.toggle(product.slug);
    removeLine(line.productSlug, line.size, line.color, line.bundleId);
    toast("Moved to wishlist", { description: product.name });
  };

  if (!hydrated) {
    return (
      <div className="container-luxe py-20">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-luxe py-14 md:py-20">
        <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)] px-6 py-16 text-center md:py-24">
          <JamdaniField id="empty-cart" color="var(--color-saffron)" opacity={0.12} size={54} />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-gold/30">
            <ShoppingBag className="h-9 w-9 text-gold" strokeWidth={1.2} />
          </div>
          <p className="relative mt-6 font-display text-4xl">Your bag is quiet.</p>
          <p className="relative mx-auto mt-3 max-w-sm text-[0.84rem] leading-relaxed text-muted-foreground">
            Beautiful things are waiting. Start with the new season collection, or let us help you
            find something on WhatsApp.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href="/collections/new-arrivals">
                Explore new arrivals <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/shop">Browse departments</Link>
            </Button>
          </div>
          <p className="relative mt-8 text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Cash on delivery · {deliveryNotice()}
            {exchangeNotice() ? ` · ${exchangeNotice()}` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-luxe py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-3 text-indigo">
              <span className="h-px w-8 bg-gold" /> Your selection
            </p>
            <h1 className="display-2 mt-3">
              Your bag{" "}
              <span className="font-sans text-lg font-medium text-muted-foreground">
                ({itemCount})
              </span>
            </h1>
          </div>
          <Link
            href="/collections/new-arrivals"
            className="group flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-gold-ink"
          >
            Continue shopping
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_370px] lg:gap-10">
          <div>
            {/* delivery progress — only when free delivery is enabled in settings */}
            {FREE_DELIVERY_ENABLED && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-[0.68rem] font-semibold">
                    <Truck className="h-3.5 w-3.5 text-gold" />
                    {freeShipping ? (
                      <span className="text-jade ">
                        Complimentary delivery unlocked
                      </span>
                    ) : (
                      <>
                        You&apos;re {formatBDT(remaining)} away from complimentary delivery
                      </>
                    )}
                  </p>
                  <span className="text-[0.75rem] uppercase tracking-[0.1em] text-muted-foreground">
                    Threshold {formatBDT(FREE_DELIVERY_THRESHOLD)}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
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

            <div className="mt-4 space-y-4">
              {bundleGroups.map((group) => (
                <div
                  key={group.bundle.slug}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-[var(--surface)]",
                    group.complete ? "border-gold/35" : "border-rosewood/25"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-2)]/70 px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                        <Layers className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[0.76rem] font-semibold">
                          Bundle: {group.bundle.name}
                        </p>
                        <p className="mt-0.5 text-[0.56rem] text-muted-foreground">
                          {group.lines.reduce((sum, line) => sum + line.qty, 0)} pieces ·{" "}
                          {group.complete
                            ? `You save ${formatBDT(group.savings)}`
                            : "Complete-outfit saving removed"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]",
                          group.complete
                            ? "bg-jade/10 text-jade "
                            : "bg-rosewood/10 text-rosewood "
                        )}
                      >
                        {group.complete ? "Complete outfit" : "Incomplete"}
                      </span>
                      <Link
                        href={`/bundle/${group.bundle.slug}`}
                        className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:text-gold-ink hover:underline"
                      >
                        View bundle
                      </Link>
                    </div>
                  </div>

                  {!group.complete && (
                    <div className="flex items-start gap-2.5 border-b border-rosewood/15 bg-rosewood/[0.03] px-4 py-3">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rosewood" />
                      <p className="text-[0.6rem] leading-relaxed text-muted-foreground">
                        This outfit is incomplete, so the bundle saving has been removed.
                        {group.missing.length > 0 &&
                          ` Add ${group.missing
                            .map((item) => item.product.name)
                            .join(", ")} to restore it.`}
                      </p>
                    </div>
                  )}

                  <div className="divide-y divide-[var(--border)] px-4">
                    {group.lines.map((line) => {
                      const product = productForLine(line);
                      if (!product) return null;
                      const colorHex = product.colors.find(
                        (color) => color.name === line.color
                      )?.hex;
                      return (
                        <div
                          key={`${line.productSlug}-${line.size}-${line.color}`}
                          className="flex gap-3 py-4"
                        >
                          <Link
                            href={`/product/${product.slug}`}
                            className="h-[110px] w-[84px] shrink-0 overflow-hidden rounded-xl border border-[var(--border)]"
                          >
                            <ProductArt
                              id={`cart-bundle-${group.bundle.slug}-${product.slug}-${line.color}`}
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
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                  Bundle piece
                                </p>
                                <Link
                                  href={`/product/${product.slug}`}
                                  className="mt-0.5 block font-display text-lg leading-tight transition hover:text-gold-ink"
                                >
                                  {product.name}
                                </Link>
                                {product.isDemo && <DemoBadge compact className="mt-1.5" />}
                              </div>
                              <p className="shrink-0 text-[0.8rem] font-semibold tabular-nums">
                                {formatBDT(product.price * line.qty)}
                              </p>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <select
                                value={line.color}
                                onChange={(event) => {
                                  updateLineVariant(
                                    line.productSlug,
                                    line.size,
                                    line.color,
                                    line.bundleId,
                                    line.size,
                                    event.target.value
                                  );
                                  toast("Bundle variant updated", {
                                    description: "The complete-outfit saving has been recalculated.",
                                  });
                                }}
                                aria-label={`Color for ${product.name}`}
                                className="field h-8 py-0 text-[0.6rem]"
                              >
                                {product.colors.map((color) => (
                                  <option key={color.name} value={color.name}>
                                    {color.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={line.size}
                                onChange={(event) => {
                                  updateLineVariant(
                                    line.productSlug,
                                    line.size,
                                    line.color,
                                    line.bundleId,
                                    event.target.value,
                                    line.color
                                  );
                                  toast("Bundle variant updated", {
                                    description: "The complete-outfit saving has been recalculated.",
                                  });
                                }}
                                aria-label={`Size for ${product.name}`}
                                className="field h-8 py-0 text-[0.6rem]"
                              >
                                {product.sizes.map((size) => (
                                  <option
                                    key={size.label}
                                    value={size.label}
                                    disabled={size.stock <= 0}
                                  >
                                    {size.label}
                                    {size.stock <= 0 ? " — sold out" : ""}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
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
                              <button
                                type="button"
                                onClick={() => {
                                  removeLine(
                                    line.productSlug,
                                    line.size,
                                    line.color,
                                    line.bundleId
                                  );
                                  toast("Bundle piece removed", {
                                    description:
                                      "The bundle saving will be removed if the outfit is no longer complete.",
                                  });
                                }}
                                className="flex items-center gap-1 text-[0.56rem] font-medium text-muted-foreground transition hover:text-rosewood"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {standaloneLines.length > 0 && (
                <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 sm:px-5">
                  {standaloneLines.map((line) => {
                    const product = productForLine(line);
                    if (!product) return null;
                    const colorHex = product.colors.find(
                      (color) => color.name === line.color
                    )?.hex;
                    return (
                      <div
                        key={`${line.productSlug}-${line.size}-${line.color}-${line.bundleId ?? "solo"}`}
                        className="flex gap-4 py-5"
                      >
                        <Link
                          href={`/product/${product.slug}`}
                          className="h-[132px] w-[102px] shrink-0 overflow-hidden rounded-xl border border-[var(--border)]"
                        >
                          <ProductArt
                            id={`cart-${product.slug}-${line.color}`}
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
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                {product.tags[0]}
                              </p>
                              <Link
                                href={`/product/${product.slug}`}
                                className="mt-0.5 block font-display text-xl leading-tight transition hover:text-gold-ink"
                              >
                                {product.name}
                              </Link>
                              {product.isDemo && <DemoBadge compact className="mt-1.5" />}
                              <p className="mt-1 text-[0.64rem] uppercase tracking-[0.1em] text-muted-foreground">
                                {line.color} · {line.size}
                              </p>
                            </div>
                            <p className="shrink-0 text-[0.88rem] font-semibold tabular-nums">
                              {formatBDT(product.price * line.qty)}
                            </p>
                          </div>

                          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                            <div className="flex items-center gap-3">
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
                              <button
                                type="button"
                                onClick={() =>
                                  removeLine(
                                    line.productSlug,
                                    line.size,
                                    line.color,
                                    line.bundleId
                                  )
                                }
                                className="flex items-center gap-1 text-[0.6rem] font-medium text-muted-foreground transition hover:text-rosewood"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => moveToWishlist(line)}
                              className="flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-rosewood"
                            >
                              <Heart className="h-3.5 w-3.5" /> Move to wishlist
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
                  Every order is packed by hand and includes a care card. Need to add a gift
                  note? Write it at checkout.
                </p>
              </div>
              <Link
                href="/contact"
                className="shrink-0 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-gold-ink underline-offset-4 hover:underline"
              >
                Need help?
              </Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_25px_60px_-45px_rgba(20,10,40,0.4)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">Order summary</h2>
                <span className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-[0.8rem]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold tabular-nums">{formatBDT(subtotal)}</span>
                </div>
                {coupon && (coupon.productSlugs?.length ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-[0.62rem] text-muted-foreground">
                    <span>Eligible subtotal for {coupon.code}</span>
                    <span className="tabular-nums">{formatBDT(eligibleSubtotal)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex items-center justify-between text-jade ">
                    <span>Discount · {couponCode}</span>
                    <span className="tabular-nums">−{formatBDT(discount)}</span>
                  </div>
                )}
                {bundleSavings > 0 && (
                  <div className="flex items-center justify-between text-jade ">
                    <span>Bundle savings</span>
                    <span className="tabular-nums">−{formatBDT(bundleSavings)}</span>
                  </div>
                )}

                {incompleteGroups.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-rosewood/[0.05] px-3 py-2 text-[0.6rem] leading-relaxed text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-rosewood" />
                    <span>
                      A bundle is incomplete. Its discount has been removed until every
                      original piece is back in the bag.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-muted-foreground">Delivery</span>
                  <div className="text-right">
                    {freeShipping ? (
                      <span className="font-semibold text-jade ">
                        Complimentary
                      </span>
                    ) : deliveryCost !== null ? (
                      <span className="font-semibold tabular-nums">
                        {formatBDT(deliveryCost)}
                      </span>
                    ) : (
                      <span className="text-[0.66rem] text-muted-foreground">
                        Calculated at checkout
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    aria-label="Estimate delivery district"
                    className="field h-9 py-0 text-[0.7rem]"
                  >
                    <option value="">Estimate delivery by district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[0.58rem] text-muted-foreground">
                    {formatBDT(profile.deliveryInside)} inside Faridpur ·{" "}
                    {formatBDT(profile.deliveryOutside)} elsewhere
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em]">
                    Total
                  </span>
                  <div className="text-right">
                    <p className="text-xl font-semibold tabular-nums">{formatBDT(total)}</p>
                    {!deliveryCost && (
                      <p className="text-[0.55rem] text-muted-foreground">
                        excl. delivery
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                {coupon ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-[0.62rem] font-bold text-jade ">
                        <BadgeCheck className="h-3.5 w-3.5" /> {coupon.code}
                      </p>
                      <p className="mt-0.5 text-[0.58rem] text-muted-foreground">
                        {coupon.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        toast("Promo code removed");
                      }}
                      aria-label="Remove coupon"
                      className="grid h-6 w-6 place-items-center rounded-full border border-[var(--border)] text-muted-foreground transition hover:text-rosewood"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitCoupon}>
                    <div className="flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        placeholder={t("cart.couponPlaceholder")}
                        aria-label="Promo code"
                        className="field h-9 flex-1 py-0 text-[0.7rem] uppercase tracking-[0.06em]"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-midnight px-3 text-[0.54rem] font-bold uppercase tracking-[0.1em] text-ivory transition hover:bg-royal"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-1.5 text-[0.58rem] text-rosewood">{couponError}</p>
                    )}
                    <p className="mt-1.5 text-[0.55rem] text-muted-foreground">
                      Try <button type="button" onClick={() => setCode("BENGALOT10")} className="font-semibold underline underline-offset-2">BENGALOT10</button> or{" "}
                      <button type="button" onClick={() => setCode("FREESHIP")} className="font-semibold underline underline-offset-2">FREESHIP</button>
                    </p>
                  </form>
                )}
              </div>

              {demoLines.length > 0 && (
                <div className="mt-4 rounded-xl border border-gold/35 bg-gold/[0.07] p-3.5">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
                    Demo items in your bag
                  </p>
                  <p className="mt-1 text-[0.6rem] leading-relaxed text-muted-foreground">
                    Ordering is disabled for demo products. Remove them to continue
                    to checkout.
                  </p>
                  <button
                    type="button"
                    onClick={removeDemoLines}
                    className="mt-2 text-[0.56rem] font-bold uppercase tracking-[0.1em] text-rosewood underline-offset-4 hover:underline"
                  >
                    Remove demo items
                  </button>
                </div>
              )}

              {demoLines.length > 0 ? (
                <Button disabled variant="gold" size="lg" className="mt-4 w-full">
                  Remove demo items to checkout
                </Button>
              ) : (
                <Button asChild variant="gold" size="lg" className="mt-4 w-full">
                  <Link href="/checkout">
                    Proceed to checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.56rem] text-muted-foreground">
                <Lock className="h-3 w-3" /> Secure checkout · Cash on delivery
              </p>

              <div className="mt-4 flex items-center justify-center gap-3 border-t border-[var(--border)] pt-4 opacity-70">
                <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  COD
                </span>
                <span className="text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Delivered with Steadfast
                </span>
              </div>
            </div>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3 text-[0.6rem] font-semibold text-muted-foreground transition hover:border-gold hover:text-gold-ink"
            >
              <WhatsAppIcon className="h-4 w-4 text-[var(--color-jade)]" /> Questions? Chat with us
            </a>
          </aside>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="border-t border-[var(--border)] bg-[var(--surface-2)] py-14 md:py-16">
          <div className="container-luxe">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-indigo">You may also like</p>
                <h2 className="display-3 mt-2">Complete the look.</h2>
              </div>
              <Link
                href="/collections/new-arrivals"
                className="hidden items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-gold-ink sm:flex"
              >
                Keep exploring <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
              {suggestions.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container-luxe flex items-center justify-center gap-2 py-8 text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground/60">
        <SealStamp size={26} className="opacity-60" text="· " />
        Bengalot · Saltha, Faridpur
      </div>
    </>
  );
}
