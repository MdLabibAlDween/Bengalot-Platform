"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, ImageIcon, ListChecks } from "lucide-react";
import { useState } from "react";

import { ProductArt } from "@/components/product/product-art";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type View = "cover" | "inside" | "contents";

const viewMeta: { id: View; label: string; icon: typeof ImageIcon }[] = [
  { id: "cover", label: "Cover", icon: ImageIcon },
  { id: "inside", label: "Inside", icon: BookOpen },
  { id: "contents", label: "Contents", icon: ListChecks },
];

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

export function ProductGallery({ product }: { product: Product }) {
  const [view, setView] = useState<View>("cover");
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="relative aspect-[4/4.9] overflow-hidden rounded-[1.8rem] border border-line bg-surface shadow-[0_30px_70px_-42px_rgba(21,34,50,0.4)] sm:aspect-[4/4.6]">
        <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-1.5">
          {product.badge ? (
            <span className="chip !border-cream/30 !bg-cream/90 !text-ink">
              {product.badge}
            </span>
          ) : null}
          <span className="chip !border-cream/20 !bg-ink/40 !text-cream backdrop-blur">
            {product.type === "physical" ? "Physical" : product.type === "bundle" ? "Bundle" : "Digital"}
          </span>
        </div>
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
        <span className="absolute right-4 top-4 z-20 rounded-full border border-cream/25 bg-ink/35 px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-cream/80 backdrop-blur">
          View {viewMeta.findIndex((item) => item.id === view) + 1} / 3
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {viewMeta.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            aria-pressed={view === item.id}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all duration-200",
              view === item.id
                ? "border-teal bg-teal-soft/40 ring-1 ring-teal/20"
                : "border-line bg-surface hover:border-line-strong",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg border",
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
              <span className="block truncate text-[0.74rem] font-semibold text-ink">
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
    </div>
  );
}

