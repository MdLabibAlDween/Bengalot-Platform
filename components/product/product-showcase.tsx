"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Heart,
  MessageCircle,
  PackageCheck,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Thermometer,
  Truck,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/brand/product-art";
import { DemoBadge, DemoOrderNotice } from "@/components/storefront/demo-product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuantityStepper } from "@/components/storefront/quantity-stepper";
import { RatingStars } from "@/components/storefront/rating-stars";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { SizeGuideDrawer } from "@/components/product/size-guide-drawer";
import { DISTRICTS, SITE, productWhatsAppLink } from "@/lib/constants";
import { STORE_SETTINGS } from "@/lib/settings";
import { useCart, useLocale, useWishlist } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import { isLightHex, mixHex, shadeHex } from "@/lib/theme";
import type {
  Product,
  SizeGuideTemplate,
} from "@/lib/types";
import {
  colorStock,
  totalVariantStock,
  variantStock,
} from "@/lib/variants";
import {
  cn,
  deliveryChargeFor,
  discountedPrice,
  formatBDT,
} from "@/lib/utils";

type ProductCollection = {
  label: string;
  href: string;
  note: string;
};

type GalleryImage = {
  id: string;
  label: string;
  palette: [string, string];
  url?: string;
  alt?: string;
  color?: string;
};

function splitLines(value?: string, fallback?: string[]) {
  if (fallback && fallback.length > 0) return fallback;
  if (!value) return [];
  return value
    .split(/[·•|]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function careIcon(line: string) {
  if (/bleach/i.test(line)) return Ban;
  if (/iron|heat/i.test(line)) return Thermometer;
  if (/dry|sun/i.test(line)) return Sun;
  if (/wash|water/i.test(line)) return Droplets;
  if (/air|ventilat/i.test(line)) return Wind;
  return Sparkles;
}

function Price({ amount }: { amount: number }) {
  const formatted = formatBDT(amount);
  const symbol = formatted.startsWith("৳") ? "৳" : "";
  return (
    <span className="font-numeric tabular-nums">
      <span
        lang="bn"
        style={{ fontFamily: "var(--font-hind), var(--font-jakarta), sans-serif" }}
      >
        {symbol}
      </span>
      {formatted.slice(symbol.length)}
    </span>
  );
}

function GalleryVisual({
  image,
  product,
  selectedColor,
  priority = false,
  thumb = false,
}: {
  image: GalleryImage;
  product: Product;
  selectedColor: string;
  priority?: boolean;
  thumb?: boolean;
}) {
  if (image.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image.url}
        alt={image.alt || `${product.name} — ${selectedColor}`}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <ProductArt
      id={`product-${product.slug}-${image.id}${thumb ? "-thumb" : ""}`}
      art={product.art}
      paletteOverride={image.palette}
      colorName={selectedColor}
      showCaption={false}
      showMonogram={!thumb}
    />
  );
}

function focusSibling(
  event: KeyboardEvent<HTMLButtonElement>,
  selector: string
) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    return;
  }
  event.preventDefault();
  const container = event.currentTarget.parentElement;
  if (!container) return;
  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>(selector)
  ).filter((button) => !button.disabled);
  const index = buttons.indexOf(event.currentTarget);
  if (index < 0) return;
  const direction =
    event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
  const next = buttons[(index + direction + buttons.length) % buttons.length];
  next?.focus();
}

export function ProductShowcase({
  product,
  collection,
  sizeGuide,
  reviewRating,
  reviewCount,
  breadcrumbs = [],
}: {
  product: Product;
  collection: ProductCollection;
  sizeGuide: SizeGuideTemplate;
  reviewRating: number;
  reviewCount: number;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { t } = useLocale();
  const { addLine } = useCart();
  const { profile } = useSiteConfig();
  const wishlist = useWishlist();
  const saved = wishlist.has(product.slug);
  const [colorIndex, setColorIndex] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [district, setDistrict] = useState("");
  const [lightbox, setLightbox] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [shakeSizes, setShakeSizes] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  const buyRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const selectedColor = product.colors[colorIndex]?.name ?? product.colors[0]?.name ?? "";
  const selectedColorHex = product.colors[colorIndex]?.hex ?? product.palette[0];
  const gallery = useMemo<GalleryImage[]>(() => {
    const photos = product.images ?? [];
    const relevant = photos.filter(
      (image) => !image.color || image.color === selectedColor
    );
    const chosen = relevant.length > 0 ? relevant : photos;
    if (chosen.length > 0) {
      return chosen
        .slice()
        .sort((a, b) => a.sort - b.sort)
        .map((image, index) => ({
          id: image.id || `photo-${index + 1}`,
          label: image.alt || `View ${index + 1}`,
          palette: [selectedColorHex, selectedColorHex],
          url: image.url,
          alt: image.alt,
          color: image.color,
        }));
    }
    if (product.imageUrl) {
      return [
        {
          id: "primary-photo",
          label: "Front",
          palette: [selectedColorHex, selectedColorHex],
          url: product.imageUrl,
          alt: product.name,
        },
      ];
    }

    const base = selectedColorHex;
    const light = isLightHex(base);
    const shift = (amount: number) => shadeHex(base, light ? -amount : amount);

    return [
      { id: "front", label: "Front", palette: [base, shift(0.12)] },
      { id: "detail", label: "Detail", palette: [shift(0.2), base] },
      {
        id: "fabric",
        label: "Fabric",
        palette: [base, mixHex(base, "#C89B45", 0.22)],
      },
      {
        id: "atelier",
        label: "Atelier",
        palette: [mixHex(base, "#17112E", light ? 0.22 : 0.45), base],
      },
    ];
  }, [product.images, product.imageUrl, product.art, product.name, product.palette, selectedColor, selectedColorHex]);

  const active = gallery[activeImage] ?? gallery[0];
  const selectedSize = product.sizes.find((option) => option.label === size);
  const variants = product.variants ?? [];
  const selectedVariant = variants.find(
    (variant) => variant.size === size && variant.color === selectedColor
  );
  const activePrice = selectedVariant?.price ?? product.price;
  const activeCompareAt = selectedVariant?.compareAt ?? product.compareAt;
  const off = discountedPrice(activePrice, activeCompareAt);
  const availableStock = variants.length
    ? variantStock(variants, size, selectedColor) ?? 0
    : selectedSize?.stock ?? product.stock;
  const fee = district
    ? deliveryChargeFor(district, profile.deliveryInside, profile.deliveryOutside)
    : null;
  const soldOut = variants.length ? totalVariantStock(variants) <= 0 : product.stock <= 0;
  const demo = Boolean(product.isDemo);
  const materialLines = splitLines(product.materials, product.materialLines);
  const careLines = splitLines(product.care, product.careLines);
  const fitCopy = product.fitNote ?? sizeGuide.note;
  const hasMaterials = materialLines.length > 0;
  const hasCare = careLines.length > 0;
  const hasFit = Boolean(fitCopy);
  const highlights = product.highlights ?? [];
  const maxQty =
    availableStock && availableStock > 0 ? Math.min(10, availableStock) : 10;
  const hasPhotos = Boolean(product.images?.length || product.imageUrl);

  const selectColor = (index: number) => {
    setColorIndex(index);
    setActiveImage(0);
    const nextColor = product.colors[index]?.name ?? "";
    if (size && variants.length > 0) {
      const next = variantStock(variants, size, nextColor) ?? 0;
      if (next <= 0) {
        setSize("");
        setQty(1);
      }
    }
  };

  const selectImage = (index: number) => {
    setActiveImage(index);
  };

  const selectSize = (nextSize: string, stock: number) => {
    setSize(nextSize);
    if (stock > 0 && qty > Math.min(10, stock)) {
      setQty(Math.min(10, stock));
    }
  };

  const goImage = (direction: -1 | 1) => {
    selectImage((activeImage + direction + gallery.length) % gallery.length);
  };

  useEffect(() => {
    const onScroll = () => {
      const rect = buyRef.current?.getBoundingClientRect();
      setShowSticky(Boolean(rect && rect.bottom < 0));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveImage((current) => (current - 1 + gallery.length) % gallery.length);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveImage((current) => (current + 1) % gallery.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, gallery.length]);

  const requireSize = () => {
    if (!size) {
      setShakeSizes(true);
      toast.error("Please choose a size", {
        description: "Select a size to add this piece to your bag.",
      });
      window.setTimeout(() => setShakeSizes(false), 550);
      return false;
    }
    if (variants.length > 0 && (!selectedVariant || availableStock <= 0)) {
      toast.error("That combination is sold out", {
        description: `Choose another size or colour for ${product.name}.`,
      });
      return false;
    }
    return true;
  };

  const add = (openDrawer = true) => {
    if (demo) {
      toast.error("Demo product — ordering is disabled.", {
        description: "This is a preview listing while the real product is prepared.",
      });
      return;
    }
    if (soldOut || !requireSize()) return;
    addLine(
      {
        productSlug: product.slug,
        size,
        color: selectedColor,
        qty,
        snapshot: product,
      },
      { openDrawer }
    );
  };

  const buyNow = () => {
    if (demo) {
      toast.error("Demo product — ordering is disabled.", {
        description: "This is a preview listing while the real product is prepared.",
      });
      return;
    }
    if (soldOut || !requireSize()) return;
    add(false);
    router.push("/checkout");
  };

  const shareUrl = `${SITE.url}/product/${product.slug}`;
  const whatsappOrder = productWhatsAppLink({
    productName: product.name,
    sku: product.sku,
    color: selectedColor,
    size: size || "Not selected yet",
    quantity: qty,
    price: formatBDT(activePrice),
    url: shareUrl,
  });

  const copySku = async () => {
    try {
      await navigator.clipboard.writeText(product.sku);
      toast.success("Product code copied", { description: product.sku });
    } catch {
      toast.error("Could not copy the product code");
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `${product.name} — Bengalot`,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Product link copied");
    } catch {
      /* sharing cancelled */
    }
  };

  return (
    <>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-7 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10 xl:gap-14"
      >
        {/* Gallery */}
        <section aria-label={`${product.name} main image`} className="min-w-0 md:sticky md:top-[88px] md:self-start lg:top-[96px]">
          <div className="relative -mx-5 sm:mx-0">
            <div className="relative h-[105vw] overflow-hidden border-y border-[var(--border)] bg-[var(--surface-2)] sm:aspect-[4/5] sm:h-auto sm:rounded-[24px] sm:border">
              <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label={`Open fullscreen image of ${product.name} in ${selectedColor}`}
                className="absolute inset-0 z-0 block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
                onTouchStart={(event) => {
                  touchStart.current = event.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  if (touchStart.current === null) return;
                  const end = event.changedTouches[0]?.clientX ?? touchStart.current;
                  const delta = end - touchStart.current;
                  if (Math.abs(delta) > 45) goImage(delta > 0 ? -1 : 1);
                  touchStart.current = null;
                }}
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`${active.id}-${colorIndex}`}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="absolute inset-0"
                  >
                    <GalleryVisual
                      image={active}
                      product={product}
                      selectedColor={selectedColor}
                      priority={activeImage === 0}
                    />
                  </motion.div>
                </AnimatePresence>
              </button>

              <div className="pointer-events-none absolute left-4 top-4 z-10">
                {product.badge && (
                  <Badge
                    className={cn(
                      "border-transparent shadow-sm",
                      product.badge === "Bestseller" && "bg-gold text-midnight",
                      product.badge === "Limited" && "bg-royal text-ivory",
                      product.badge === "New" && "bg-teal text-ink"
                    )}
                  >
                    {product.badge}
                  </Badge>
                )}
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 z-10">
                <span className="rounded-full border border-ivory/20 bg-midnight/35 px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-ivory/90 backdrop-blur">
                  {String(activeImage + 1).padStart(2, "0")} /{" "}
                  {String(gallery.length).padStart(2, "0")}
                </span>
              </div>

              <div className="absolute right-3 top-4 z-20 flex flex-col gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={() => wishlist.toggle(product.slug)}
                  aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                  aria-pressed={saved}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border border-white/20 backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                    saved
                      ? "bg-rosewood text-white"
                      : "bg-midnight/30 text-ivory hover:bg-rosewood hover:text-white"
                  )}
                >
                  <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                </button>
                <button
                  type="button"
                  onClick={() => void share()}
                  aria-label="Share this product"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-midnight/30 text-ivory backdrop-blur-md transition hover:bg-gold hover:text-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => goImage(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-midnight/35 text-ivory backdrop-blur-md transition hover:bg-gold hover:text-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:left-4"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goImage(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ivory/20 bg-midnight/35 text-ivory backdrop-blur-md transition hover:bg-gold hover:text-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:right-4"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 px-4 sm:hidden">
              <p className="text-[0.54rem] uppercase tracking-[0.14em] text-muted-foreground">
                {hasPhotos ? "Photography · open fullscreen" : "Illustrated preview · photography coming soon"}
              </p>
            </div>
            <div className="mt-3 hidden items-center justify-between gap-3 sm:flex">
              <div className="space-y-1">
                <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {hasPhotos ? "Photography · open fullscreen" : "Illustrated preview · photography coming soon"}
                </p>
                <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground/70">
                  {gallery.length} views · open fullscreen
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => wishlist.toggle(product.slug)}
                  aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                  aria-pressed={saved}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    saved
                      ? "border-rosewood/30 bg-rosewood/10 text-rosewood"
                      : "border-[var(--border)] bg-[var(--surface)] text-muted-foreground hover:border-gold hover:text-gold-ink"
                  )}
                >
                  <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                </button>
                <button
                  type="button"
                  onClick={() => void share()}
                  aria-label="Share this product"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-muted-foreground transition hover:border-gold hover:text-gold-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Purchase panel */}
        <section aria-labelledby="product-title" className="min-w-0">
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              items={breadcrumbs}
              className="mb-4 flex sm:hidden"
            />
          )}
          <Link
            href={collection.href}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo transition hover:text-foreground"
          >
            <span className="h-px w-6 bg-gold" />
            {collection.label}
          </Link>

          <h1
            id="product-title"
            className="mt-3 font-display text-[2.35rem] leading-[1.02] sm:text-[2.55rem] lg:text-[3rem]"
          >
            {product.name}
          </h1>

          {demo && (
            <div className="mt-3">
              <DemoBadge />
            </div>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copySku}
              className="group flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground transition hover:text-gold-ink"
              title="Copy product code"
            >
              SKU · {product.sku}
              <Copy className="h-3 w-3 opacity-50 transition group-hover:opacity-100" />
            </button>
            {reviewCount > 0 && (
              <>
                <span className="h-3 w-px bg-[var(--border)]" />
                <a href="#reviews" className="flex items-center gap-2">
                  <RatingStars rating={reviewRating} />
                  <span className="text-[0.66rem] text-muted-foreground underline-offset-4 hover:underline">
                    {reviewRating.toFixed(1)} · {reviewCount}{" "}
                    {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </a>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-[2rem] leading-none tabular-nums">
              <Price amount={activePrice} />
            </span>
            {activeCompareAt && (
              <>
                <span className="text-[0.95rem] text-muted-foreground line-through tabular-nums">
                  <Price amount={activeCompareAt} />
                </span>
                <span className="rounded-full bg-rosewood/10 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-rosewood ">
                  −{off}% off
                </span>
              </>
            )}
          </div>

          <p className="mt-4 max-w-xl text-[0.86rem] leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>

          {demo && <DemoOrderNotice className="mt-4" />}

          {/* Gallery */}
          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Gallery · <span className="text-foreground">{active.label}</span>
              </p>
              <span className="text-[0.64rem] text-muted-foreground">
                {gallery.length} views
              </span>
            </div>
            <div
              className="grid max-w-[430px] grid-cols-4 gap-2.5"
              role="group"
              aria-label="Choose a product image"
            >
              {gallery.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => selectImage(index)}
                  onKeyDown={(event) =>
                    focusSibling(event, "button[data-gallery-thumb]")
                  }
                  data-gallery-thumb
                  aria-label={`View ${image.label} in ${selectedColor}`}
                  aria-pressed={activeImage === index}
                  className={cn(
                    "relative aspect-[4/5] overflow-hidden rounded-lg border-2 bg-[var(--surface-2)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    activeImage === index
                      ? "border-gold ring-2 ring-gold/15"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <GalleryVisual
                    image={image}
                    product={product}
                    selectedColor={selectedColor}
                    thumb
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/75 to-transparent px-1.5 pb-1 pt-4 text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-ivory">
                    {image.label}
                  </span>
                </button>
              ))}
            </div>
            {product.videoUrl && (
              <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-black">
                <video
                  src={product.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="max-h-[360px] w-full object-contain"
                >
                  Your browser does not support the product video.
                </video>
              </div>
            )}
          </div>

          {/* Color */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Color · <span className="text-foreground">{selectedColor}</span>
              </p>
              <span className="text-[0.64rem] text-muted-foreground">
                {product.colors.length} colors
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {product.colors.map((color, index) => {
                const stock = variants.length
                  ? colorStock(variants, color.name) ?? 0
                  : product.stock;
                const unavailable = stock <= 0;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => selectColor(index)}
                    disabled={unavailable}
                    aria-label={color.name}
                    aria-pressed={colorIndex === index}
                    title={unavailable ? "Out of stock" : color.name}
                    className={cn(
                      "relative h-9 w-9 overflow-hidden rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                      colorIndex === index
                        ? "border-gold ring-2 ring-gold/20 ring-offset-2 ring-offset-[var(--background)]"
                        : "border-transparent hover:scale-105",
                      unavailable && "cursor-not-allowed opacity-55"
                    )}
                  >
                    <span
                      className="block h-full w-full rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                    {unavailable && (
                      <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_46%,var(--foreground)_47%,var(--foreground)_53%,transparent_54%)] opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Size
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-indigo underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <Ruler className="h-3.5 w-3.5" /> Size Guide
              </button>
            </div>
            <motion.div
              animate={
                shakeSizes && !reduceMotion
                  ? { x: [0, -7, 7, -5, 5, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.45 }}
              className="flex flex-wrap gap-2"
              aria-invalid={!size}
            >
              {product.sizes.map((sizeOption) => {
                const optionStock = variants.length
                  ? variantStock(variants, sizeOption.label, selectedColor) ?? 0
                  : sizeOption.stock;
                const disabled = optionStock === 0;
                const low = optionStock > 0 && optionStock <= 4;
                return (
                  <button
                    key={sizeOption.label}
                    type="button"
                    disabled={disabled}
                    data-size-pill
                    onClick={() => selectSize(sizeOption.label, optionStock)}
                    onKeyDown={(event) =>
                      focusSibling(event, "button[data-size-pill]")
                    }
                    aria-pressed={size === sizeOption.label}
                    title={
                      disabled
                        ? "Out of stock in this colour"
                        : low
                          ? `Only ${optionStock} left`
                          : undefined
                    }
                    className={cn(
                      "relative min-w-[58px] rounded-full border px-4 py-2.5 text-[0.74rem] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                      size === sizeOption.label
                        ? "border-midnight bg-midnight text-ivory shadow-sm"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--line-strong)]",
                      disabled &&
                        "cursor-not-allowed text-muted-foreground opacity-45 line-through decoration-rosewood/60"
                    )}
                  >
                    {sizeOption.label}
                    {low && (
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-gold ring-2 ring-[var(--background)]" />
                    )}
                  </button>
                );
              })}
            </motion.div>
            {!size && (
              <p className="mt-2 text-[0.66rem] text-muted-foreground">
                Choose a size to add this piece to your bag.
              </p>
            )}
            {selectedSize && availableStock > 0 && availableStock <= 4 && (
              <p className="mt-2.5 flex items-center gap-1.5 text-[0.66rem] font-semibold text-rosewood ">
                <Sparkles className="h-3 w-3" /> Only {availableStock} left in {selectedColor} ·{" "}
                {selectedSize.label}
              </p>
            )}
          </div>

          <div ref={buyRef} className="mt-7 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Quantity
              </p>
              <QuantityStepper value={qty} onChange={setQty} max={maxQty} />
            </div>
            <Button
              onClick={() => add(true)}
              disabled={soldOut || demo}
              size="lg"
              className="w-full"
            >
              <ShoppingBag className="h-4 w-4" />
              {demo
                ? "Ordering disabled (demo)"
                : soldOut
                  ? t("common.outOfStock")
                  : "Add to Cart"}
            </Button>
            <Button
              onClick={buyNow}
              disabled={soldOut || demo}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Buy Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.62rem] text-muted-foreground">
            {STORE_SETTINGS.codEnabled && (
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-gold" /> Cash on delivery
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <PackageCheck className="h-3.5 w-3.5 text-gold" /> Quality checked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-gold" /> Easy support
            </span>
          </div>

          {!demo && (
            <a
              href={whatsappOrder}
              target="_blank"
              rel="noopener noreferrer"
              title={`WhatsApp · ${SITE.whatsapp}`}
              className="mt-4 inline-flex items-center gap-2 text-[0.64rem] font-semibold text-[var(--color-jade)] underline-offset-4 transition hover:underline"
            >
              <WhatsAppIcon className="h-4 w-4" /> {t("common.whatsapp")}
            </a>
          )}

          {/* Delivery check */}
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold" />
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em]">
                  Delivery
                </p>
              </div>
              <select
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                aria-label="Select delivery district"
                className="field h-9 flex-1 py-0 text-[0.72rem] lg:max-w-[200px]"
              >
                <option value="">Select your district</option>
                {DISTRICTS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="text-[0.68rem] lg:ml-auto lg:text-right">
                {fee === null ? (
                  <span className="text-muted-foreground">
                    {formatBDT(profile.deliveryInside)} Faridpur ·{" "}
                    {formatBDT(profile.deliveryOutside)} elsewhere
                  </span>
                ) : (
                  <>
                    <span className="font-semibold"><Price amount={fee} /></span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {district === "Faridpur" ? "1–2 days" : "2–4 days"}
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-[0.62rem] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-jade" /> Cash on delivery available ·{" "}
              <Link href="/shipping-policy" className="underline underline-offset-2 hover:text-gold-ink">
                Shipping policy
              </Link>
            </p>
          </div>

          {/* Details */}
          <Accordion
            type="single"
            collapsible
            className="mt-6 border-t border-[var(--border)]"
          >
            {product.description && (
              <AccordionItem value="details">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <p>{product.description}</p>
                  {collection.note && (
                    <p className="mt-3 border-l-2 border-gold/50 pl-3 text-[0.72rem] leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">{collection.label}.</span>{" "}
                      {collection.note}
                    </p>
                  )}
                  {highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <span className="mt-1 text-gold">◆</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            {hasMaterials && (
              <AccordionItem value="materials">
                <AccordionTrigger>Materials</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5">
                    {materialLines.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span className="mt-1 text-gold">◆</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            {hasCare && (
              <AccordionItem value="care">
                <AccordionTrigger>Care</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {careLines.map((line) => {
                      const Icon = careIcon(line);
                      return (
                        <li key={line} className="flex items-start gap-2.5">
                          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                          <span>{line}</span>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            {hasFit && (
              <AccordionItem value="fit">
                <AccordionTrigger>Size &amp; Fit</AccordionTrigger>
                <AccordionContent>
                  <p>{fitCopy}</p>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="mt-3 inline-flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-gold-ink underline-offset-4 hover:underline"
                  >
                    <Ruler className="h-3.5 w-3.5" /> Open the measurement guide
                  </button>
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
              <AccordionContent>
                <p>
                  Delivery is {formatBDT(profile.deliveryInside)} inside Faridpur district
                  and {formatBDT(profile.deliveryOutside)} elsewhere in Bangladesh. Orders
                  placed before 2pm are usually dispatched the same day.
                </p>
                <p className="mt-3">
                  {STORE_SETTINGS.exchangeWindowEnabled && STORE_SETTINGS.exchangeWindowDays > 0
                    ? `Unused pieces with tags intact can be exchanged within ${STORE_SETTINGS.exchangeWindowDays} days. Contact us on WhatsApp to arrange a pickup.`
                    : "Contact us on WhatsApp to check the options for your item under the current return policy."}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </motion.div>

      {/* Mobile sticky purchase bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-[calc(63px+env(safe-area-inset-bottom))] z-30 border-t border-[var(--border)] bg-[var(--glass)] p-3 backdrop-blur-xl transition-transform duration-300 md:hidden",
          showSticky ? "translate-y-0" : "pointer-events-none translate-y-full"
        )}
        aria-hidden={!showSticky}
        inert={!showSticky}
      >
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[0.72rem] font-semibold tabular-nums">
              <Price amount={activePrice} />
            </p>
            <p className="truncate text-[0.66rem] text-muted-foreground">
              {selectedColor} · {size || "Choose a size"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => wishlist.toggle(product.slug)}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full border transition",
              saved
                ? "border-rosewood/30 bg-rosewood/10 text-rosewood"
                : "border-[var(--border)] text-muted-foreground"
            )}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
          <Button
            onClick={() => add(true)}
            disabled={soldOut || demo}
            size="sm"
            className="shrink-0 px-4"
          >
            <ShoppingBag className="h-3.5 w-3.5" />{" "}
            {demo ? "Demo" : "Add to cart"}
          </Button>
        </div>
      </div>

      <SizeGuideDrawer
        product={product}
        guide={sizeGuide}
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
      />

      {/* Lightbox */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-[min(94vw,860px)] overflow-hidden border-gold/20 bg-midnight p-0">
          <DialogTitle className="sr-only">{product.name} gallery in {selectedColor}</DialogTitle>
          <DialogDescription className="sr-only">
            Fullscreen product gallery. Use the arrow keys or the thumbnails to change view.
          </DialogDescription>
          <div className="relative aspect-[4/5] max-h-[78vh] w-full sm:aspect-[4/4.2]">
            <GalleryVisual
              image={active}
              product={product}
              selectedColor={selectedColor}
              priority
            />
            <button
              type="button"
              onClick={() => goImage(-1)}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-midnight/50 text-ivory backdrop-blur transition hover:bg-gold hover:text-midnight"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goImage(1)}
              aria-label="Next image"
              className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-midnight/50 text-ivory backdrop-blur transition hover:bg-gold hover:text-midnight"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-midnight/55 px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-ivory/70 backdrop-blur">
              {activeImage + 1} / {gallery.length}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 overflow-x-auto p-4">
            {gallery.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`View ${image.label} in ${selectedColor}`}
                aria-pressed={activeImage === index}
                className={cn(
                  "h-12 w-10 shrink-0 overflow-hidden rounded border transition",
                  activeImage === index
                    ? "border-gold"
                    : "border-ivory/15 opacity-60 hover:opacity-100"
                )}
              >
                <GalleryVisual
                  image={image}
                  product={product}
                  selectedColor={selectedColor}
                  thumb
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
