import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.filter((product) => product.featured).slice(0, 4);

  return (
    <section className="section-pad relative overflow-hidden bg-paper">
      <div
        className="pointer-events-none absolute -left-24 top-32 size-[22rem] rounded-full border border-line/70"
        aria-hidden="true"
      />
      <div className="container-wide relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal>
              <p className="eyebrow">The short list</p>
            </Reveal>
            <h2 className="display-xl mt-4 max-w-[16ch] text-ink">
              <MaskedLine>Things worth</MaskedLine>
              <MaskedLine delay={0.08}>
                <span className="display-italic text-coral">keeping close.</span>
              </MaskedLine>
            </h2>
          </div>
          <Reveal delay={0.12} className="sm:max-w-[17rem] sm:pb-2">
            <p className="text-[0.9rem] leading-[1.7] text-ink-soft">
              Four tools our learners come back to — for the desk, the bag and
              the fifteen quiet minutes between classes.
            </p>
            <Link
              href="/shop"
              className="group mt-4 inline-flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-teal"
            >
              Shop all tools
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-9 sm:mt-11">
          <div className="no-scrollbar -mx-[var(--page-gutter)] flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-[var(--page-gutter)] pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
            {featured.map((product, index) => (
              <Reveal
                key={product.id}
                delay={index * 0.07}
                className="w-[76vw] shrink-0 snap-start sm:w-[56vw] md:w-auto md:min-w-0"
              >
                <ProductCard product={product} className="h-full" />
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-center text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-muted md:hidden">
            Swipe to explore
          </p>
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-col gap-4 rounded-[1.2rem] border border-line bg-paper px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="flex items-center gap-3 text-[0.76rem] font-semibold text-ink-soft">
              <span className="grid size-7 place-items-center rounded-full bg-teal text-cream">
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
              Not sure what fits your week? Start with the Student Starter
              Bundle.
            </p>
            <Link
              href="/product/student-starter-bundle"
              className="text-[0.65rem] font-extrabold uppercase tracking-[0.13em] text-coral transition-colors hover:text-coral-deep"
            >
              See what is inside →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
