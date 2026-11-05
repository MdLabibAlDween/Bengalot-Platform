"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  ChevronRight,
  Heart,
  Layers,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { BundleArt } from "@/components/bundle/bundle-art";
import { ProductArt } from "@/components/brand/product-art";
import { DemoBadge, DemoOrderNotice } from "@/components/storefront/demo-product";
import { Button } from "@/components/ui/button";
import { getBundleItems, getBundlePricing, bundleItemCount, isDemoBundle } from "@/lib/bundles";
import { getDepartment } from "@/lib/data";
import { productColorPalette } from "@/lib/theme";
import { useCart, useWishlist } from "@/lib/providers";
import type { Bundle, Product } from "@/lib/types";
import { cn, formatBDT } from "@/lib/utils";
import { STORE_SETTINGS } from "@/lib/settings";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { WHATSAPP_LINK } from "@/lib/constants";

type Selection = { color: string; size: string };

function initialSelection(product: Product): Selection {
  return {
    color: product.colors.length === 1 ? product.colors[0].name : "",
    size:
      product.sizes.length === 1 && product.sizes[0].stock > 0
        ? product.sizes[0].label
        : "",
  };
}

export function BundleDetail({ bundle }: { bundle: Bundle }) {
  const router = useRouter();
  const { addLine, openCart } = useCart();
  const wishlist = useWishlist();
  const department = getDepartment(bundle.department);
  const items = useMemo(() => getBundleItems(bundle), [bundle]);
  const pricing = useMemo(() => getBundlePricing(bundle), [bundle]);
  const count = bundleItemCount(bundle);
  const demo = isDemoBundle(bundle);
  const [selections, setSelections] = useState<Record<string, Selection>>(() => {
    const values: Record<string, Selection> = {};
    for (const item of items) values[item.product.slug] = initialSelection(item.product);
    return values;
  });
  const [activeImage, setActiveImage] = useState(0);
  const saved = wishlist.has(bundle.slug);

  const unavailable = items.filter(({ product }) =>
    product.sizes.every((size) => size.stock <= 0)
  );

  const update = (slug: string, key: keyof Selection, value: string) => {
    setSelections((current) => ({
      ...current,
      [slug]: { ...current[slug], [key]: value },
    }));
  };

  const colorNameFor = (product: Product) =>
    selections[product.slug]?.color ?? product.colors[0]?.name ?? "";

  const paletteFor = (product: Product) => {
    const hex = product.colors.find(
      (color) => color.name === colorNameFor(product)
    )?.hex;
    return hex ? productColorPalette(hex) : undefined;
  };

  const isChosen = (item: { product: Product; quantity: number }) => {
    const selection = selections[item.product.slug];
    if (!selection?.size || !selection?.color) return false;
    const size = item.product.sizes.find((option) => option.label === selection.size);
    return Boolean(size && size.stock > 0);
  };

  const allChosen =
    unavailable.length === 0 &&
    items.every((item) => isChosen(item));
  const chosenCount = items.filter((item) => isChosen(item)).length;
  const availableItems = items.filter(({ product }) =>
    product.sizes.some((size) => size.stock > 0)
  );
  const canPartial =
    bundle.allowPartialPurchase &&
    unavailable.length > 0 &&
    availableItems.length > 0 &&
    availableItems.every((item) => isChosen(item));

  const addBundle = (options?: { silent?: boolean; partial?: boolean }) => {
    if (demo) {
      toast.error("Demo bundle — ordering is disabled.", {
        description: "This outfit is a preview while the real products are prepared.",
      });
      return;
    }
    const chosenItems = options?.partial ? availableItems : items;
    for (const item of chosenItems) {
      const selection = selections[item.product.slug];
      if (!selection?.size || !selection?.color) continue;
      addLine(
        {
          productSlug: item.product.slug,
          size: selection.size,
          color: selection.color,
          qty: item.quantity,
          bundleId: bundle.slug,
          bundleName: bundle.name,
          snapshot: item.product,
        },
        { silent: true }
      );
    }
    if (!options?.silent) {
      toast.success(options?.partial ? "Available pieces added" : "Complete outfit added", {
        description: options?.partial
          ? "The bundle saving will not apply because the outfit is incomplete."
          : `${bundle.name} · ${formatBDT(pricing.price)}`,
      });
      openCart();
    }
  };

  const buyNow = () => {
    if (demo) {
      toast.error("Demo bundle — ordering is disabled.", {
        description: "This outfit is a preview while the real products are prepared.",
      });
      return;
    }
    addBundle({ silent: true });
    router.push("/checkout");
  };

  const activeProduct = activeImage > 0 ? items[activeImage - 1]?.product : null;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10 xl:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-[24px] border border-[var(--border)]">
            <div className="aspect-[4/5]">
              {activeProduct ? (
                <ProductArt
                  id={`bundle-gallery-${bundle.slug}-${activeImage}`}
                  art={activeProduct.art}
                  paletteOverride={paletteFor(activeProduct)}
                  colorName={colorNameFor(activeProduct)}
                  showCaption={false}
                />
              ) : (
                <BundleArt
                  bundle={bundle}
                  className="h-full w-full"
                />
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <span className="rounded-full border border-gold/30 bg-midnight/45 px-3 py-1.5 text-[0.48rem] font-bold uppercase tracking-[0.16em] text-gold backdrop-blur">
                Complete outfit · {count} pieces
              </span>
              <span className="rounded-full border border-ivory/20 bg-midnight/35 px-3 py-1.5 text-[0.48rem] font-bold uppercase tracking-[0.14em] text-ivory/75 backdrop-blur">
                Save {formatBDT(pricing.savings)}
              </span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-midnight/65 to-transparent p-4 pt-12 text-ivory">
              <span className="text-[0.52rem] uppercase tracking-[0.14em] text-ivory/60">
                {activeProduct ? activeProduct.name : "The complete look"}
              </span>
              <span className="text-[0.52rem] uppercase tracking-[0.14em] text-ivory/45">
                {activeImage + 1} / {items.length + 1}
              </span>
            </div>
          </div>

          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveImage(0)}
              className={cn(
                "h-[74px] w-[60px] shrink-0 overflow-hidden rounded-lg border transition",
                activeImage === 0 ? "border-gold ring-2 ring-gold/20" : "border-[var(--border)] opacity-70 hover:opacity-100"
              )}
              aria-label="View bundle"
            >
              <BundleArt bundle={bundle} className="h-full w-full" />
            </button>
            {items.map(({ product }, index) => (
              <button
                key={product.slug}
                type="button"
                onClick={() => setActiveImage(index + 1)}
                className={cn(
                  "h-[74px] w-[60px] shrink-0 overflow-hidden rounded-lg border transition",
                  activeImage === index + 1
                    ? "border-gold ring-2 ring-gold/20"
                    : "border-[var(--border)] opacity-70 hover:opacity-100"
                )}
                aria-label={`View ${product.name}`}
              >
                <ProductArt
                  id={`bundle-thumb-${bundle.slug}-${index}`}
                  art={product.art}
                  paletteOverride={paletteFor(product)}
                  colorName={colorNameFor(product)}
                  showCaption={false}
                  showMonogram={false}
                />
              </button>
            ))}
            <div className="ml-1 hidden flex-1 border-l border-[var(--border)] pl-3 sm:block">
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                One parcel
              </p>
              <p className="mt-1 text-[0.64rem] leading-relaxed text-muted-foreground">
                All pieces are packed together as one parcel.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="flex items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.16em] text-gold">
              <Sparkles className="h-3.5 w-3.5" /> Why a complete outfit
            </p>
            <p className="mt-2 text-[0.7rem] leading-relaxed text-muted-foreground">
              The pieces in this bundle were chosen to sit together — proportions, color and
              fabric. Choose a variant for each, and we will pack the full look as one.
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.18em]">
            <Link
              href={`/${department?.slug}`}
              className="transition hover:text-gold"
              style={{ color: department?.accent }}
            >
              {department?.name}
            </Link>
            <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-muted-foreground">Bundles</span>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Bengalot complete outfit
              </p>
              <h1 className="mt-1 font-display text-[2.5rem] leading-[1.03] sm:text-[3rem]">
                {bundle.name}
              </h1>
              {demo && (
                <div className="mt-3">
                  <DemoBadge />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => wishlist.toggle(bundle.slug)}
              aria-label={saved ? "Remove bundle from wishlist" : "Save bundle to wishlist"}
              className={cn(
                "mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition",
                saved
                  ? "border-rosewood/30 bg-rosewood/10 text-rosewood"
                  : "border-[var(--border)] text-muted-foreground hover:border-rosewood hover:text-rosewood"
              )}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-current")} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-[1.65rem] font-semibold tabular-nums">
              {formatBDT(pricing.price)}
            </span>
            <span className="text-[1rem] text-muted-foreground line-through tabular-nums">
              {formatBDT(pricing.total)}
            </span>
            <span className="rounded-full bg-jade/10 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-jade ">
              Save {formatBDT(pricing.savings)}
            </span>
          </div>
          <p className="mt-1.5 text-[0.62rem] text-muted-foreground">
            Bundle price · {count} pieces · delivery calculated at checkout
          </p>

          <p className="mt-5 max-w-lg text-[0.86rem] leading-relaxed text-muted-foreground">
            {bundle.shortDescription}
          </p>

          {demo && <DemoOrderNotice className="mt-4" />}

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-gold/25 bg-gold/[0.05] p-3.5">
            <Layers className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <p className="text-[0.66rem] leading-relaxed text-muted-foreground">
              The bundle saving is applied in your bag only when every piece is present.
              Remove an item or change a variant and the saving will be recalculated.
            </p>
          </div>

          {unavailable.length > 0 && (
            <div className="mt-4 rounded-xl border border-rosewood/25 bg-rosewood/[0.04] p-4">
              <p className="flex items-center gap-2 text-[0.68rem] font-semibold text-rosewood ">
                <AlertTriangle className="h-4 w-4" /> Some pieces are currently unavailable
              </p>
              <p className="mt-1 text-[0.64rem] leading-relaxed text-muted-foreground">
                {unavailable.map((item) => item.product.name).join(", ")}{" "}
                {unavailable.length === 1 ? "is" : "are"} out of stock.{" "}
                {bundle.allowPartialPurchase
                  ? "You can continue with the available pieces, but the bundle saving will not apply."
                  : "The complete outfit cannot be added until all pieces are back."}
              </p>
            </div>
          )}

          {/* Items */}
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl">In this outfit</h2>
              <span className="text-[0.54rem] uppercase tracking-[0.12em] text-muted-foreground">
                {count} pieces
              </span>
            </div>
            <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
              {items.map(({ product, quantity }, itemIndex) => {
                const selection = selections[product.slug];
                const sizeOption = product.sizes.find(
                  (option) => option.label === selection?.size
                );
                const soldOut = product.sizes.every((option) => option.stock <= 0);
                return (
                  <div key={product.slug} className="p-4">
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/product/${product.slug}`}
                        className="h-[64px] w-[50px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)]"
                      >
                        <ProductArt
                          id={`bundle-item-${bundle.slug}-${product.slug}`}
                          art={product.art}
                          paletteOverride={paletteFor(product)}
                          colorName={colorNameFor(product)}
                          showCaption={false}
                          showMonogram={false}
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/product/${product.slug}`}
                              className="text-[0.76rem] font-semibold transition hover:text-gold"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-0.5 text-[0.56rem] uppercase tracking-[0.1em] text-muted-foreground">
                              Qty {quantity} · {formatBDT(product.price * quantity)}
                            </p>
                          </div>
                          {soldOut && (
                            <span className="rounded-full bg-rosewood/10 px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em] text-rosewood ">
                              Sold out
                            </span>
                          )}
                        </div>

                        {!soldOut && (
                          <div className="mt-3 space-y-3">
                            <div>
                              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                Color
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                {product.colors.map((color) => (
                                  <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => {
                                      update(product.slug, "color", color.name);
                                      setActiveImage(itemIndex + 1);
                                    }}
                                    aria-label={`${color.name} for ${product.name}`}
                                    aria-pressed={selection?.color === color.name}
                                    title={color.name}
                                    className={cn(
                                      "h-7 w-7 rounded-full border-2 transition",
                                      selection?.color === color.name
                                        ? "border-gold ring-2 ring-gold/20 ring-offset-2 ring-offset-[var(--background)]"
                                        : "border-transparent hover:scale-105"
                                    )}
                                    style={{ backgroundColor: color.hex }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                Size
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {product.sizes.map((size) => (
                                  <button
                                    key={size.label}
                                    type="button"
                                    disabled={size.stock <= 0}
                                    onClick={() => update(product.slug, "size", size.label)}
                                    aria-pressed={selection?.size === size.label}
                                    title={size.stock <= 0 ? "Out of stock" : size.label}
                                    className={cn(
                                      "min-w-[44px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                                      selection?.size === size.label
                                        ? "border-midnight bg-midnight text-ivory"
                                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--line-strong)]",
                                      size.stock <= 0 &&
                                        "cursor-not-allowed text-muted-foreground opacity-45 line-through"
                                    )}
                                  >
                                    {size.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {selection?.size && sizeOption && sizeOption.stock <= 3 && !soldOut && (
                          <p className="mt-2 text-[0.56rem] font-semibold text-rosewood ">
                            Only {sizeOption.stock} left in size {sizeOption.label}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold">
                  {chosenCount} of {count} pieces chosen
                </span>
                <span className="text-muted-foreground">
                  {allChosen ? "Ready to add" : "Choose each variant"}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-300"
                  style={{ width: `${(chosenCount / Math.max(1, count)) * 100}%` }}
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={() => addBundle()}
              disabled={!allChosen || demo}
              variant="gold"
              size="lg"
              className="w-full"
            >
              <ShoppingBag className="h-4 w-4" />
              {demo
                ? "Ordering disabled (demo)"
                : allChosen
                  ? "Add Complete Outfit to Cart"
                  : "Choose a variant for every piece"}
            </Button>
            <Button
              type="button"
              onClick={buyNow}
              disabled={!allChosen || demo}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Buy now <ArrowRight className="h-4 w-4" />
            </Button>
            {canPartial && (
              <Button
                type="button"
                onClick={() => addBundle({ partial: true })}
                disabled={demo}
                variant="outline"
                className="w-full"
              >
                Continue with available pieces
              </Button>
            )}
            {!allChosen && unavailable.length === 0 && (
              <p className="text-center text-[0.58rem] leading-relaxed text-muted-foreground">
                Select a color and size for each piece to unlock the complete outfit.
              </p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: Truck, label: "Delivered together" },
              { icon: Sparkles, label: "Bundle saving" },
              ...(STORE_SETTINGS.codEnabled
                ? [{ icon: Banknote, label: "Cash on delivery" }]
                : []),
            ]
              .slice(0, 3)
              .map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--border)] py-3 text-center"
                >
                  <Icon className="h-4 w-4 text-gold" />
                  <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
          </div>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-11 items-center justify-center gap-2.5 rounded-full border border-[var(--color-jade)]/25 bg-[var(--color-jade)]/[0.06] text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--color-jade)] transition hover:bg-[var(--color-jade)] hover:text-white "
          >
            <WhatsAppIcon className="h-4 w-4" /> Ask about this bundle
          </a>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              The details
            </p>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted-foreground">
              {bundle.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
