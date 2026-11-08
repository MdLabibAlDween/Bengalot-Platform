import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { FlashcardPreview } from "@/components/product/flashcard-preview";
import type { Product } from "@/lib/types";

export function FlashcardFeature({ product }: { product: Product }) {
  return (
    <section className="relative overflow-hidden bg-lavender-soft py-20 sm:py-24 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 dot-paper opacity-25"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-28 top-20 size-[26rem] rounded-full border border-ink/[0.06]"
        aria-hidden="true"
      />
      <div className="container-wide relative grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow">
              <Sparkles className="size-3 text-teal" aria-hidden="true" />
              A five-minute ritual
            </p>
          </Reveal>
          <h2 className="display-xl mt-5 max-w-[13ch] text-ink">
            <MaskedLine>Small cards.</MaskedLine>
            <MaskedLine delay={0.08}>
              <span className="display-italic text-teal">Serious recall.</span>
            </MaskedLine>
          </h2>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-[30rem] text-[0.94rem] leading-[1.8] text-ink-soft">
              Rereading feels productive. Recall proves it. Our study cards put
              the question in your hand and the screen out of reach — 120
              everyday English words, written for the way we actually speak.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-line border-y border-line py-4">
              {[
                ["120", "printed cards"],
                ["350", "GSM paper"],
                ["06", "topic dividers"],
              ].map(([value, label]) => (
                <div key={label} className="px-4 first:pl-0">
                  <p className="font-display text-[1.9rem] leading-none tracking-[-0.04em] text-ink">
                    {value}
                  </p>
                  <p className="mt-1.5 text-[0.58rem] font-bold uppercase tracking-[0.13em] text-muted">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href={`/product/${product.slug}`}
                className="btn btn-primary group"
              >
                Meet the vocabulary cards
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/shop/study-cards"
                className="group inline-flex items-center gap-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.12em] text-ink-soft"
              >
                All study cards
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-8 max-w-[25rem] border-l-2 border-teal/30 pl-4 text-[0.78rem] italic leading-relaxed text-ink-soft/80">
              “The phone goes away. The deck comes out. Fifteen minutes later,
              something has actually stuck.”
            </p>
          </Reveal>
        </div>

        <div className="relative order-1 lg:order-2 lg:pl-8">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/15 sm:size-[32rem]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-[58%] top-[8%] size-24 rounded-full bg-butter/70 blur-[2px]"
            aria-hidden="true"
          />
          <Reveal delay={0.1} className="relative">
            <FlashcardPreview product={product} />
          </Reveal>
          <div className="mt-4 flex items-center justify-center gap-2 sm:mt-6">
            <span className="size-1.5 rounded-full bg-coral" />
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-muted">
              Front and back · tap the card to preview
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
