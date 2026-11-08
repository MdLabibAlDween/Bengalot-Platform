import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Heart,
  Leaf,
  MapPin,
  PenLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { ProductArt } from "@/components/product/product-art";
import { getCatalog } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Bengalot makes thoughtful tools for study, focus and the long game — designed in Saltha, Faridpur, Bangladesh.",
};

const principles = [
  {
    icon: PenLine,
    title: "Useful before beautiful",
    copy: "Every object has to earn its place in a bag, on a desk or inside a real week. Beauty is the second question, never the only one.",
  },
  {
    icon: Leaf,
    title: "Quiet over loud",
    copy: "No streak counters. No promises of effortless success. Just clear tools that make the next honest session easier to begin.",
  },
  {
    icon: MapPin,
    title: "Made from here",
    copy: "Designed in Saltha, Faridpur, for learners across Bangladesh. Local printing, local support and a long-term view.",
  },
];

export default async function AboutPage() {
  const catalog = await getCatalog();
  const showcase = catalog.products.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-cream">
        <div
          className="pointer-events-none absolute -left-40 top-0 size-[32rem] rounded-full bg-[radial-gradient(circle,rgba(216,208,231,0.55),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="container-wide relative grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <Reveal>
              <p className="eyebrow">The house of Bengalot</p>
            </Reveal>
            <h1 className="display-xl mt-4 text-ink">
              <MaskedLine immediate>We make tools for</MaskedLine>
              <MaskedLine delay={0.08} immediate>the quiet part of</MaskedLine>
              <MaskedLine delay={0.16} immediate>
                <span className="display-italic text-coral">learning.</span>
              </MaskedLine>
            </h1>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-[30rem] text-[0.98rem] leading-[1.8] text-ink-soft">
                The second attempt. The honest hour. The week you actually
                finish. Bengalot exists for the work that happens after the
                motivation has worn off — and for the small tools that make that
                work easier to return to.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link href="/shop" className="btn btn-primary">
                  Explore the shelf
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/journal" className="btn btn-outline">
                  Read the journal
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="relative mx-auto w-full max-w-[30rem]">
            <div
              className="pointer-events-none absolute inset-8 rounded-full bg-butter/50"
              aria-hidden="true"
            />
            {showcase.map((product, index) => (
              <div
                key={product.id}
                className={`absolute overflow-hidden rounded-[1.2rem] border border-line shadow-[0_28px_55px_-28px_rgba(21,34,50,0.45)] ${
                  index === 0
                    ? "left-[6%] top-[10%] z-10 h-[64%] w-[42%] -rotate-[8deg]"
                    : index === 1
                      ? "right-[2%] top-[2%] h-[68%] w-[45%] rotate-[6deg]"
                      : "bottom-[2%] left-[32%] h-[46%] w-[38%] -rotate-[1deg]"
                }`}
              >
                <ProductArt product={product} showCaption={false} />
              </div>
            ))}
            <div className="aspect-[4/4.2]" />
            <div className="absolute -bottom-2 right-[8%] z-20 rotate-[4deg] rounded-full bg-teal px-4 py-2 text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-cream shadow-lg">
              Saltha · Faridpur
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-16 sm:py-20">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Why this exists</p>
            <p className="mt-5 font-display text-[2.4rem] leading-[0.98] tracking-[-0.045em] text-ink">
              A brand born from a simple frustration.
            </p>
          </div>
          <div className="max-w-[42rem] space-y-4 text-[0.94rem] leading-[1.85] text-ink-soft">
            <p>
              Bengalot started with the gap between how learning looks online
              and how it actually feels. The beautiful systems, the perfect
              planners, the endless templates — all of it can become another
              thing to manage instead of a way to begin.
            </p>
            <p>
              We wanted fewer, better objects. A deck that asks a question. A
              planner with one honest page. A Notion workspace that opens to the
              day you are actually in. A timer that removes the phone instead of
              asking you to ignore it. Tools that respect the person using them.
            </p>
            <p>
              We are a small studio in Saltha, Faridpur. Every product is
              designed here, made with local partners where possible, and
              checked by a person before it reaches you. Our brand line is a
              reminder, not a promise of perfection:{" "}
              <span className="font-semibold text-ink">
                bring a lot to learning.
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-teal-deep py-16 text-cream sm:py-20">
        <div className="container-wide">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow !text-butter-soft">What we hold to</p>
              <h2 className="display-lg mt-3 max-w-[14ch] text-cream">
                Three quiet{" "}
                <span className="display-italic text-butter">standards.</span>
              </h2>
            </div>
            <Heart className="hidden size-10 text-butter/50 sm:block" aria-hidden="true" />
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {principles.map((principle, index) => (
              <Reveal key={principle.title} delay={index * 0.08}>
                <div className="h-full rounded-[1.3rem] border border-cream/10 bg-cream/[0.045] p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-full bg-cream/10 text-butter">
                      <principle.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="font-display text-2xl italic text-cream/20">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-[1.4rem] leading-tight text-cream">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-[0.76rem] leading-[1.7] text-cream/55">
                    {principle.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-lavender-soft p-8">
            <div
              className="pointer-events-none absolute inset-0 dot-paper opacity-30"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="eyebrow">The studio</p>
              <p className="mt-5 font-display text-[2.2rem] leading-[1.02] tracking-[-0.04em] text-ink">
                Small enough to answer the phone.
              </p>
              <p className="mt-3 max-w-[26rem] text-[0.84rem] leading-[1.75] text-ink-soft/80">
                We are online-only, but never anonymous. Support is handled by
                the same small team that makes the tools.
              </p>
              <div className="mt-6 space-y-2 text-[0.72rem] text-ink-soft">
                <p className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-teal" aria-hidden="true" />
                  Saltha, Faridpur, Bangladesh
                </p>
                <p className="flex items-center gap-2">
                  <BookOpen className="size-3.5 text-teal" aria-hidden="true" />
                  Online store · delivered across Bangladesh
                </p>
                <p className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-teal" aria-hidden="true" />
                  Founded 2026 · independent
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">A note from the studio</p>
            <p className="mt-5 font-display text-[1.9rem] leading-[1.1] tracking-[-0.035em] text-ink">
              “We are not trying to make learning effortless. We are trying to
              make the effort feel worth returning to.”
            </p>
            <p className="mt-4 text-[0.78rem] leading-relaxed text-muted">
              — The Bengalot studio, Faridpur
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/product/student-starter-bundle" className="btn btn-primary">
                Start with a bundle
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Talk to us
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
