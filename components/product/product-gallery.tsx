"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, ImageIcon, ListChecks, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { ProductArt } from "@/components/product/product-art";
import { productImages } from "@/lib/product-media";
import { productShelfLabel } from "@/lib/catalog-meta";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type View = "cover" | "inside" | "contents";

const viewMeta: { id: View; label: string; icon: typeof ImageIcon }[] = [
  { id: "cover", label: "Cover", icon: ImageIcon },
  { id: "inside", label: "Inside", icon: BookOpen },
  { id: "contents", label: "Contents", icon: ListChecks },
];

function GalleryFrame({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  return (
    <div className="relative aspect-[4/4.9] overflow-hidden rounded-[1.8rem] border border-line bg-surface shadow-[0_30px_70px_-42px_rgba(21,34,50,0.4)] sm:aspect-[4/4.6]">
      <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-wrap gap-1.5">
        {product.badge ? (
          <span className="chip !border-cream/30 !bg-cream/90 !text-ink">
            {product.badge}
          </span>
        ) : null}
        <span className="chip !border-cream/20 !bg-ink/40 !text-cream backdrop-blur">
          {productShelfLabel(product)}
        </span>
      </div>
      {children}
    </div>
  );
}

function ContentsView({ product }: { product: Product }) {
  const palette = product.palette;
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[inherit] p-6 sm:p-8"
      style={{
        backgroundImage: `linear-gradient(145deg, ${palette[0] ?? "#0d6f6d"}, ${palette[1] ?? "#0e7c7b"})`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 dot-paper opacity-20 mix-blend-soft-light"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between">
        <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-cream/80 backdrop-blur">
          What arrives
        </span>
        <span className="font-display text-3xl italic text-cream/40">B.</span>
      </div>
      <div className="relative my-auto w-full">
        <div className="mx-auto w-full max-w-[22rem] rotate-[-1.5deg] rounded-[1.2rem] border border-white/40 bg-[#ffffff] p-5 shadow-[0_28px_55px_-24px_rgba(0,0,0,0.5)] sm:p-6">
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-teal">
            {product.format}
          </p>
          <p className="mt-2 font-display text-[1.7rem] leading-[1.02] tracking-[-0.03em] text-ink">
            Everything inside.
          </p>
          <ul className="mt-4 space-y-2.5">
            {product.includes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 border-b border-line/70 pb-2.5 last:border-0 last:pb-0"
              >
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-teal text-cream">
                  <ListChecks className="size-2.5" aria-hidden="true" />
                </span>
                <span className="text-[0.72rem] leading-snug text-ink-soft">{item}</span>
              </li>
            ))}
          </ul>
          {product.requirements.length ? (
            <p className="mt-4 rounded-lg bg-paper px-3 py-2 text-[0.62rem] leading-relaxed text-muted">
              <span className="font-bold uppercase tracking-[0.08em] text-ink-soft">You will need: </span>
              {product.requirements.join(" · ")}
            </p>
          ) : null}
        </div>
      </div>
      <p className="relative text-center text-[0.55rem] font-bold uppercase tracking-[0.16em] text-cream/55">
        {product.title} · Bengalot
      </p>
    </div>
  );
}

function ArtGallery({ product }: { product: Product }) {
  const [view, setView] = useState<View>("cover");
  const reduceMotion = useReducedMotion();

  return (
    <>
      <GalleryFrame product={product}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            {view === "contents" ? (
              <ContentsView product={product} />
            ) : (
              <ProductArt
                product={product}
                view={view === "inside" ? "back" : "front"}
                showCaption
              />
            )}
          </motion.div>
        </AnimatePresence>
        <span className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-cream/25 bg-ink/35 px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-cream/80 backdrop-blur">
          View {viewMeta.findIndex((item) => item.id === view) + 1} / 3
        </span>
      </GalleryFrame>

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {viewMeta.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            aria-pressed={view === item.id}
            className={cn(
              "group flex items-center gap-2 rounded-xl border p-2 text-left transition-all duration-200 sm:gap-2.5",
              view === item.id
                ? "border-teal bg-teal-soft/40 ring-1 ring-teal/20"
                : "border-line bg-surface hover:border-line-strong",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg border sm:size-9",
                view === item.id
                  ? "border-teal/20 bg-cream text-teal"
                  : "border-line bg-paper text-muted",
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.58rem] font-extrabold uppercase tracking-[0.1em] text-muted">
                0{viewMeta.findIndex((meta) => meta.id === item.id) + 1}
              </span>
              <span className="block truncate text-[0.66rem] font-semibold text-ink sm:text-[0.74rem]">
                {item.label}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3.5 py-2.5">
        <p className="flex items-center gap-2 text-[0.62rem] font-semibold text-muted">
          <span className="size-1.5 rounded-full bg-teal" />
          Original Bengalot artwork — no stock photography
        </p>
        <span className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
          {product.sku}
        </span>
      </div>
    </>
  );
}

function PhotoGallery({ product, photos }: { product: Product; photos: string[] }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const reduceMotion = useReducedMotion();
  const activeIndex = Math.min(Math.max(active, 0), photos.length - 1);
  const current = photos[activeIndex];

  useEffect(() => {
    if (!zoom) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  if (!current) return null;

  return (
    <>
      <GalleryFrame product={product}>
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="group absolute inset-0 cursor-zoom-in"
          aria-label={`Zoom photo ${active + 1} of ${photos.length}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={current}
                alt={`${product.title} — photo ${active + 1} of ${photos.length}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                preload={active === 0}
              />
            </motion.div>
          </AnimatePresence>
          <span className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-cream/25 bg-ink/35 px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-cream/85 backdrop-blur">
            <ImageIcon className="size-3" aria-hidden="true" />
            {active + 1} / {photos.length} · Tap to zoom
          </span>
        </button>
      </GalleryFrame>

      {photos.length > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              aria-label={`Show photo ${index + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border transition-all sm:size-[4.6rem]",
                index === active
                  ? "border-teal ring-1 ring-teal/25"
                  : "border-line opacity-80 hover:opacity-100",
              )}
            >
              <Image
                src={photo}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3.5 py-2.5">
        <p className="flex items-center gap-2 text-[0.62rem] font-semibold text-muted">
          <span className="size-1.5 rounded-full bg-teal" />
          Real product photos — taken by the Bengalot studio
        </p>
        <span className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
          {product.sku}
        </span>
      </div>

      <AnimatePresence>
        {zoom ? (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setZoom(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${product.title} photo viewer`}
          >
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-cream/25 bg-cream/10 text-cream transition-colors hover:bg-cream/20"
              aria-label="Close photo viewer"
            >
              <X className="size-4.5" aria-hidden="true" />
            </button>
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActive((value) => (value - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-3 z-10 grid size-10 place-items-center rounded-full border border-cream/25 bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:left-6"
                  aria-label="Previous photo"
                >
                  <BookOpen className="size-4 rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActive((value) => (value + 1) % photos.length);
                  }}
                  className="absolute right-3 z-10 grid size-10 place-items-center rounded-full border border-cream/25 bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:right-6"
                  aria-label="Next photo"
                >
                  <BookOpen className="size-4" aria-hidden="true" />
                </button>
              </>
            ) : null}
            <motion.div
              key={current}
              className="relative max-h-[86dvh] w-full max-w-3xl"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-cream/15">
                <Image
                  src={current}
                  alt={`${product.title} — photo ${active + 1} of ${photos.length}`}
                  fill
                  sizes="(max-width: 768px) 92vw, 48rem"
                  className="object-contain"
                />
              </div>
              <p className="mt-3 text-center text-[0.62rem] font-semibold text-cream/70">
                {active + 1} / {photos.length} · {product.title}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const photos = productImages(product);

  return (
    <div>
      {photos.length ? (
        <PhotoGallery product={product} photos={photos} />
      ) : (
        <ArtGallery product={product} />
      )}
    </div>
  );
}
