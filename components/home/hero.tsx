"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ProductArt } from "@/components/brand/product-art";
import { Grain, JamdaniField } from "@/components/brand/ornaments";
import { useSiteConfig } from "@/lib/site-config-provider";
import { getDepartment, getProduct } from "@/lib/data";
import { getHeroSlides, isDemoProductVisible, type HeroSlide } from "@/lib/homepage";
import { deliveryLine } from "@/lib/settings";
import type { PlaceholderTone } from "@/lib/theme";
import type { Product } from "@/lib/types";
import { cn, formatBDT } from "@/lib/utils";

const SLOT_ACCENTS = [
  {
    color: "var(--color-indigo)",
    deep: "var(--color-indigo)",
    tint: "var(--color-indigo-tint)",
  },
  {
    color: "var(--color-magenta)",
    deep: "var(--color-magenta)",
    tint: "var(--color-magenta-tint)",
  },
  {
    color: "var(--color-terracotta)",
    deep: "var(--color-terracotta)",
    tint: "var(--color-terracotta-tint)",
  },
  {
    color: "var(--color-teal)",
    deep: "var(--color-teal)",
    tint: "var(--color-teal-tint)",
  },
];

type Slot = (typeof SLOT_ACCENTS)[number];

function HeroProductCard({
  product,
  accent,
  className,
  artClassName,
  featured = false,
  instance,
  compact = false,
  contentClassName,
  artTone,
}: {
  product?: Product;
  accent: Slot;
  className?: string;
  artClassName?: string;
  featured?: boolean;
  instance: string;
  compact?: boolean;
  contentClassName?: string;
  artTone?: PlaceholderTone;
}) {
  const department = product ? getDepartment(product.department) : undefined;
  const { media } = useSiteConfig();
  const heroImage = product
    ? media[`product.${product.slug}.main`] || product.imageUrl
    : media["hero-main"];

  return (
    <Link
      href={product ? `/product/${product.slug}` : "/shop"}
      aria-label={product ? `View ${product.name}` : "Explore the collection"}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden border border-white/80 bg-[var(--color-surface)] shadow-[0_20px_44px_-30px_rgba(36,26,80,0.4)] backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-32px_rgba(36,26,80,0.48)]",
        compact ? "rounded-[18px] p-1.5" : "rounded-[24px] p-2",
        className
      )}
    >
      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden",
          compact ? "rounded-[13px]" : "rounded-[18px]"
        )}
        style={{
          background: `linear-gradient(145deg, ${accent.tint} 0%, var(--color-surface) 100%)`,
        }}
      >
        <div className={cn("relative h-full", artClassName)}>
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={product?.name ?? "Bengalot piece"}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : product ? (
            <ProductArt
              id={`hero-${instance}-${product.slug}`}
              art={product.art}
              palette={product.palette}
              tone={artTone}
              showCaption={false}
              showMonogram={false}
            />
          ) : (
            <div
              className="grid h-full place-items-center p-8"
              style={{ color: accent.color }}
            >
              <span className="h-14 w-14 rounded-full border border-current/20 bg-white/45 p-4">
                <span className="block h-full w-full rounded-full border border-current/40" />
              </span>
            </div>
          )}
        </div>
        {!compact && (
          <span
            className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] backdrop-blur"
            style={{ color: department?.accentDeep ?? accent.deep }}
          >
            {product?.isDemo ? "Demo product" : featured ? "Featured" : "New in"}
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col",
          compact ? "px-1 pb-0.5 pt-2" : "px-1.5 pb-1 pt-3",
          contentClassName
        )}
      >
        <p
          className={cn(
            "font-bold uppercase tracking-[0.1em]",
            compact ? "text-xs" : "text-xs"
          )}
          style={{ color: department?.accentDeep ?? accent.deep }}
        >
          {department?.name ?? "Bengalot"}
        </p>
        <p
          className={cn(
            "line-clamp-2 font-semibold leading-snug text-[var(--color-ink)]",
            compact ? "mt-0.5 min-h-[2.4em] text-xs" : "mt-1 min-h-[2.55em] text-[13px]"
          )}
        >
          {product?.name ?? "A new piece is on its way"}
        </p>
        {product?.isDemo && (
          <p className="mt-0.5 text-[0.48rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
            Demo · ordering disabled
          </p>
        )}
        <div className={cn("flex items-center justify-between gap-2", compact ? "mt-1" : "mt-1.5")}>
          <p
            className={cn(
              "font-semibold tabular-nums text-[var(--color-ink)]",
              compact ? "text-xs" : "text-[13px]"
            )}
          >
            {product ? formatBDT(product.price) : "Coming soon"}
          </p>
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] transition group-hover:rotate-45 group-hover:border-transparent group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-ivory)]",
              compact ? "h-6 w-6" : "h-7 w-7"
            )}
            aria-hidden="true"
          >
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function Hero({
  slides: providedSlides,
  catalogue,
}: {
  slides?: HeroSlide[];
  catalogue?: Product[];
}) {
  const slides =
    providedSlides && providedSlides.length > 0
      ? providedSlides.filter((slide) => isDemoProductVisible(slide.isDemo))
      : getHeroSlides();
  const liveProducts = useMemo(
    () => new Map((catalogue ?? []).map((product) => [product.slug, product])),
    [catalogue]
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const touchStart = useRef<number | null>(null);
  const resumeTimer = useRef<number | null>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const sx = useSpring(pointerX, { stiffness: 60, damping: 22 });
  const sy = useSpring(pointerY, { stiffness: 60, damping: 22 });

  const x1 = useTransform(sx, [-0.5, 0.5], reduce ? [0, 0] : [-7, 7]);
  const y1 = useTransform(sy, [-0.5, 0.5], reduce ? [0, 0] : [-6, 6]);
  const x2 = useTransform(sx, [-0.5, 0.5], reduce ? [0, 0] : [5, -5]);
  const y2 = useTransform(sy, [-0.5, 0.5], reduce ? [0, 0] : [4, -4]);
  const x3 = useTransform(sx, [-0.5, 0.5], reduce ? [0, 0] : [-4, 4]);
  const y3 = useTransform(sy, [-0.5, 0.5], reduce ? [0, 0] : [-3, 3]);

  const go = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length]
  );

  const safeIndex = Math.min(index, Math.max(0, slides.length - 1));
  const slide = slides[safeIndex];
  const products = useMemo(
    () =>
      (slide?.productSlugs ?? [])
        .map((slug) => liveProducts.get(slug) ?? getProduct(slug))
        .filter((product): product is Product => Boolean(product)),
    [slide, liveProducts]
  );

  useEffect(() => {
    if (slides.length < 2 || paused || reduce) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [index, paused, reduce, slides.length]);

  useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    },
    []
  );

  if (slides.length === 0 || !slide) return null;

  const slotAccent = (slot: number): Slot =>
    slot === 0
      ? {
          color: slide.accentColor,
          deep: slide.accentDeep,
          tint: slide.tint,
        }
      : SLOT_ACCENTS[slot];

  const cards = [products[0], products[1], products[2]];
  const mobileCards = [products[0], products[1]];
  const scheduleResume = () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 6000);
  };

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[var(--color-ivory)] text-[var(--color-ink)]"
      aria-label="Bengalot featured collection"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onTouchStart={(event) => {
        setPaused(true);
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current !== null) {
          const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
          if (Math.abs(delta) > 42) go(safeIndex + (delta < 0 ? 1 : -1));
        }
        touchStart.current = null;
        scheduleResume();
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(118deg, var(--color-ivory) 0%, var(--color-ivory) 44%, var(--color-sand) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse 46% 52% at 83% 26%, color-mix(in srgb, ${slide.accentColor} 12%, transparent) 0%, transparent 70%), radial-gradient(ellipse 34% 42% at 12% 76%, color-mix(in srgb, var(--color-saffron) 9%, transparent) 0%, transparent 72%), radial-gradient(ellipse 40% 48% at 58% 92%, color-mix(in srgb, var(--color-teal) 7%, transparent) 0%, transparent 70%), radial-gradient(ellipse 28% 34% at 96% 80%, color-mix(in srgb, var(--color-magenta) 7%, transparent) 0%, transparent 72%)`,
        }}
      />
      <JamdaniField id="hero-pattern" color={slide.accentColor} opacity={0.055} size={64} />
      <Grain className="opacity-[0.025]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-indigo) 18%, transparent) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(90deg, transparent, black 25%, black 75%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 25%, black 75%, transparent)",
        }}
      />

      <div className="container-wide hero-shell relative flex flex-col justify-center gap-3 sm:gap-4 lg:grid lg:grid-cols-[45fr_55fr] lg:items-center lg:gap-10 lg:py-0 xl:gap-14">
        <div className="relative order-1 lg:order-2">
          <div className="relative mx-auto h-[clamp(210px,30svh,270px)] w-full max-w-[560px] lg:hidden">
            <div className="relative mx-auto h-full w-full max-w-[400px]">
              {mobileCards.map((product, slot) => (
                <motion.div
                  key={`${slide.id}-mobile-${slot}`}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.06 + slot * 0.07 }}
                  className={cn(
                    "absolute top-[6px] h-[calc(100%-12px)] w-[42vw] max-w-[200px]",
                    slot === 0 ? "left-[3%] z-20 -rotate-3" : "right-[3%] z-10 rotate-3"
                  )}
                >
                  <HeroProductCard
                    product={product}
                    accent={slotAccent(slot)}
                    featured={slot === 0}
                    artClassName="flex-1 min-h-0"
                    instance={`mobile-${slide.slug}`}
                    artTone={slot === 0 ? "indigo" : "magenta"}
                    compact
                    contentClassName={slot === 0 ? "pr-2" : "pl-8 pr-1"}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto hidden h-[540px] w-full max-w-[660px] lg:block">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[48px] opacity-70 blur-3xl"
              style={{
                background: `radial-gradient(circle at 60% 42%, color-mix(in srgb, ${slide.accentColor} 14%, transparent) 0%, transparent 62%), radial-gradient(circle at 22% 78%, color-mix(in srgb, var(--color-saffron) 16%, transparent) 0%, transparent 60%)`,
              }}
            />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  style={{ x: x1, y: y1 }}
                  className="absolute left-0 top-[2%] z-30 w-[55%] -rotate-2"
                >
                  <HeroProductCard
                    product={cards[0]}
                    accent={slotAccent(0)}
                    featured
                    artClassName="aspect-[4/4.5] xl:aspect-[4/4.7]"
                    instance={`desktop-main-${slide.slug}`}
                    artTone="indigo"
                  />
                </motion.div>

                <motion.div
                  style={{ x: x2, y: y2 }}
                  className="absolute right-0 top-0 z-20 w-[45%] rotate-[2.5deg]"
                >
                  <HeroProductCard
                    product={cards[1]}
                    accent={slotAccent(1)}
                    artClassName="aspect-[4/2.3] xl:aspect-[4/2.5]"
                    instance={`desktop-side-a-${slide.slug}`}
                    artTone="magenta"
                  />
                </motion.div>

                <motion.div
                  style={{ x: x3, y: y3 }}
                  className="absolute bottom-0 right-[1%] z-10 w-[43%] rotate-[-1.5deg]"
                >
                  <HeroProductCard
                    product={cards[2]}
                    accent={slotAccent(2)}
                    artClassName="aspect-[4/2.3] xl:aspect-[4/2.5]"
                    instance={`desktop-side-b-${slide.slug}`}
                    artTone="terracotta"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative z-10 order-2 max-w-[600px] lg:order-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 px-3 py-1.5 backdrop-blur-sm lg:gap-2.5 lg:px-3.5 lg:py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-saffron" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-indigo)]">
                  {slide.label}
                </span>
              </div>

              <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(1.7rem,6.4vw,2.5rem)] font-medium leading-[0.94] tracking-[-0.02em] text-[var(--color-ink)] lg:mt-5 lg:text-[clamp(2.35rem,4.7vw,4.65rem)]">
                {slide.headline}{" "}
                <span className="italic" style={{ color: slide.accentColor }}>
                  {slide.accentWord}
                </span>
              </h1>

              <p className="mt-2.5 max-w-[38ch] text-[13px] leading-snug text-[var(--color-muted-foreground)] lg:mt-4 lg:text-base lg:leading-relaxed">
                {slide.supporting}
              </p>

              <div className="mt-4 flex w-full flex-col gap-3 lg:mt-7 lg:w-auto lg:flex-row lg:items-center lg:gap-2.5">
                <Link
                  href={slide.primaryHref}
                  className="cta-primary group inline-flex h-12 w-full items-center justify-center gap-3 rounded-full px-6 text-xs font-bold uppercase tracking-[0.12em] lg:h-12 lg:w-auto"
                >
                  {slide.primaryLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={slide.secondaryHref}
                  className="cta-secondary inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-xs font-bold uppercase tracking-[0.12em] lg:w-auto"
                >
                  {slide.secondaryLabel}
                </Link>
              </div>

              <p className="mt-5 hidden flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[var(--color-muted-foreground)] lg:flex">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[var(--color-gold-ink)]" aria-hidden="true" />
                <span>{deliveryLine()}</span>
              </p>
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <div className="mt-3 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-3 lg:mt-6 lg:pt-4">
              <div className="flex items-center gap-1.5 lg:gap-2" role="tablist" aria-label="Hero slides">
                {slides.map((item, itemIndex) => {
                  const active = itemIndex === safeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`Show slide ${itemIndex + 1}: ${item.headline} ${item.accentWord}`}
                      onClick={() => go(itemIndex)}
                      className="group grid h-7 place-items-center px-0.5 lg:h-8"
                    >
                      <span
                        className={cn(
                          "block h-1 rounded-full transition-all duration-300",
                          active
                            ? "w-7"
                            : "w-2.5 bg-[var(--color-border)] group-hover:bg-[var(--color-gold-ink)]"
                        )}
                        style={{ backgroundColor: active ? item.accentColor : undefined }}
                      />
                    </button>
                  );
                })}
                <span className="ml-0.5 text-xs font-semibold tabular-nums text-[var(--color-muted-foreground)] lg:ml-1">
                  {String(safeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
              </div>

              <div className="hidden items-center gap-1.5 sm:flex">
                <button
                  type="button"
                  onClick={() => go(safeIndex - 1)}
                  aria-label="Previous slide"
                  className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 text-[var(--color-ink)] transition hover:border-[var(--color-ink)] hover:bg-[var(--color-surface)] lg:h-9 lg:w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(safeIndex + 1)}
                  aria-label="Next slide"
                  className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 text-[var(--color-ink)] transition hover:border-[var(--color-ink)] hover:bg-[var(--color-surface)] lg:h-9 lg:w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
