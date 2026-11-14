"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Card = {
  front: string;
  hint?: string;
  back: string;
  example?: string;
};

export function FlashcardPreview({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const preview = product.preview as { kind?: string; cards?: Card[] };
  const cards: Card[] =
    preview.kind === "flashcards" && preview.cards?.length
      ? preview.cards
      : [
          {
            front: "serendipity",
            hint: "/ˌser.ənˈdɪp.ə.ti/",
            back: "Finding something good without looking for it.",
            example: "A happy serendipity brought me to that little bookshop.",
          },
          {
            front: "deliberate",
            hint: "/dɪˈlɪb.ər.ət/",
            back: "Done consciously and intentionally.",
            example: "She made a deliberate choice to study before sunrise.",
          },
          {
            front: "momentum",
            hint: "/məˈmen.təm/",
            back: "The force that keeps something moving forward.",
            example: "One small win gave the whole week momentum.",
          },
        ];

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const reduceMotion = useReducedMotion();
  const card = cards[index] ?? cards[0]!;

  function nextCard() {
    setFlipped(false);
    setIndex((current) => (current + 1) % cards.length);
  }

  function previousCard() {
    setFlipped(false);
    setIndex((current) => (current - 1 + cards.length) % cards.length);
  }

  return (
    <div className={cn("relative mx-auto w-full max-w-[23rem]", className)}>
      <div
        className="absolute inset-x-8 -top-4 bottom-16 rotate-[6deg] rounded-[1.5rem] border border-ink/10 bg-butter shadow-[0_28px_50px_-30px_rgba(21,34,50,0.35)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-4 -top-2 bottom-16 -rotate-[3deg] rounded-[1.5rem] border border-ink/10 bg-coral/85 shadow-[0_24px_44px_-30px_rgba(21,34,50,0.3)]"
        aria-hidden="true"
      />

      <div className="relative [perspective:1500px]">
        <motion.button
          type="button"
          onClick={() => setFlipped((current) => !current)}
          aria-pressed={flipped}
          aria-label={`Flashcard ${index + 1} of ${cards.length}. ${flipped ? "Showing definition" : "Showing word"}. Activate to flip.`}
          className="group relative block aspect-[4/5] w-full rounded-[1.6rem] text-left outline-offset-4"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : { duration: 0.72, ease: [0.16, 1, 0.3, 1] }
          }
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* front */}
          <span
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1.6rem] border border-ink/10 bg-[#ffffff] p-6 shadow-[0_36px_70px_-34px_rgba(21,34,50,0.55)] sm:p-7"
            style={{ backfaceVisibility: "hidden" }}
            aria-hidden={flipped}
          >
            <span
              className="absolute inset-0 dot-paper opacity-[0.28]"
              aria-hidden="true"
            />
            <span className="relative flex items-start justify-between gap-4">
              <span>
                <span className="block text-[0.55rem] font-extrabold uppercase tracking-[0.18em] text-teal">
                  English vocabulary
                </span>
                <span className="mt-1 block text-[0.58rem] font-medium text-muted">
                  Front · word
                </span>
              </span>
              <span className="rounded-full border border-line bg-cream px-2.5 py-1 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-muted">
                {String(index + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
              </span>
            </span>

            <span className="relative block">
              <span className="block font-display text-[3.1rem] italic leading-[0.88] tracking-[-0.055em] text-ink sm:text-[4rem]">
                {card.front}
              </span>
              {card.hint ? (
                <span className="mt-3 block text-[0.78rem] font-medium tracking-[0.03em] text-muted">
                  {card.hint}
                </span>
              ) : null}
              <span className="mt-6 block h-px w-full bg-line" />
              <span className="mt-3 block max-w-[15rem] text-[0.67rem] leading-relaxed text-muted">
                Say the meaning out loud before you turn the card.
              </span>
            </span>

            <span className="relative flex items-end justify-between">
              <span>
                <span className="block text-[0.48rem] font-extrabold uppercase tracking-[0.18em] text-muted">
                  Bengalot study cards
                </span>
                <span className="mt-0.5 block text-[0.48rem] font-semibold uppercase tracking-[0.14em] text-muted/45">
                  Durable paper · made to be handled
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.1em] text-ink-soft transition-colors group-hover:border-teal/40">
                <RotateCcw className="size-3" aria-hidden="true" />
                Turn
              </span>
            </span>
          </span>

          {/* back */}
          <span
            className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1.6rem] border border-ink/10 bg-teal p-6 text-cream shadow-[0_36px_70px_-34px_rgba(21,34,50,0.55)] sm:p-7"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            aria-hidden={!flipped}
          >
            <span
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(247,241,228,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(247,241,228,.7) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
              aria-hidden="true"
            />
            <span className="relative flex items-start justify-between gap-4">
              <span>
                <span className="block text-[0.55rem] font-extrabold uppercase tracking-[0.18em] text-butter">
                  Answer
                </span>
                <span className="mt-1 block text-[0.58rem] font-medium text-cream/55">
                  Back · meaning
                </span>
              </span>
              <span className="rounded-full border border-cream/20 px-2.5 py-1 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-cream/60">
                {String(index + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
              </span>
            </span>

            <span className="relative block">
              <span className="block font-display text-[1.85rem] leading-[1.06] tracking-[-0.035em] text-cream sm:text-[2.2rem]">
                {card.back}
              </span>
              {card.example ? (
                <span className="mt-5 block border-l-2 border-butter/60 pl-3 text-[0.72rem] italic leading-relaxed text-cream/65">
                  “{card.example}”
                </span>
              ) : null}
            </span>

            <span className="relative flex items-end justify-between">
              <span className="text-[0.48rem] font-extrabold uppercase tracking-[0.18em] text-cream/40">
                Now say it in your own sentence
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-cream/10 px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.1em] text-cream/70">
                <RotateCcw className="size-3" aria-hidden="true" />
                Back
              </span>
            </span>
          </span>
        </motion.button>
      </div>

      <span aria-live="polite" className="sr-only">
        {flipped
          ? `Definition: ${card.back}`
          : `Word: ${card.front}. Activate the card to see the definition.`}
      </span>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {cards.map((item, cardIndex) => (
            <button
              key={item.front}
              type="button"
              onClick={() => {
                setFlipped(false);
                setIndex(cardIndex);
              }}
              aria-label={`Show card ${cardIndex + 1}: ${item.front}`}
              aria-current={cardIndex === index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                cardIndex === index
                  ? "w-7 bg-teal"
                  : "w-2.5 bg-line-strong hover:bg-muted",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={previousCard}
            aria-label="Previous sample card"
            className="grid size-9 place-items-center rounded-full border border-line bg-cream text-ink-soft transition-colors hover:border-teal hover:text-teal"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={nextCard}
            aria-label="Next sample card"
            className="grid size-9 place-items-center rounded-full border border-line bg-cream text-ink-soft transition-colors hover:border-teal hover:text-teal"
          >
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

