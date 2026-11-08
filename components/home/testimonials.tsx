import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import type { Product, Review } from "@/lib/types";

const cardStyles = [
  "bg-white border-line",
  "bg-teal-soft/70 border-teal/10",
  "bg-butter-soft/75 border-butter/30",
];

export function Testimonials({
  reviews,
  products,
}: {
  reviews: Review[];
  products: Product[];
}) {
  const chosen = reviews.slice(0, 3);
  if (!chosen.length) return null;

  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-24">
      <div
        className="pointer-events-none absolute right-8 top-16 font-display text-[18rem] leading-none text-ink/[0.025]"
        aria-hidden="true"
      >
        ”
      </div>
      <div className="container-wide relative">
        <div className="flex flex-col gap-7 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <p className="eyebrow">From the weekly review</p>
            </Reveal>
            <h2 className="display-xl mt-4 max-w-[15ch] text-ink">
              <MaskedLine>Small tools.</MaskedLine>
              <MaskedLine delay={0.08}>
                <span className="display-italic text-coral">Real weeks.</span>
              </MaskedLine>
            </h2>
          </div>
          <Reveal delay={0.12} className="flex items-center gap-5 lg:pb-1">
            <div>
              <div className="flex items-center gap-1 text-coral" role="img" aria-label="Rated 4.9 out of 5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="size-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-2 text-[0.7rem] font-semibold text-ink-soft">
                4.9 average · 2,400+ learners
              </p>
            </div>
            <span className="h-10 w-px bg-line" aria-hidden="true" />
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-teal"
            >
              Find yours
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-3.5 md:grid-cols-3">
          {chosen.map((review, index) => {
            const product = products.find((item) => item.id === review.product_id);
            const initials = review.author
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2);
            return (
              <Reveal key={review.id} delay={index * 0.08}>
                <figure
                  className={`flex h-full flex-col justify-between rounded-[1.45rem] border p-6 sm:p-7 ${cardStyles[index] ?? cardStyles[0]}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-0.5 text-coral" aria-hidden="true">
                        {Array.from({ length: review.rating }).map((_, star) => (
                          <Star key={star} className="size-3 fill-current" />
                        ))}
                      </span>
                      <span className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-muted">
                        0{index + 1}
                      </span>
                    </div>
                    <blockquote className="mt-5">
                      <p className="font-display text-[1.28rem] leading-[1.3] tracking-[-0.025em] text-ink sm:text-[1.4rem]">
                        “{review.body}”
                      </p>
                    </blockquote>
                  </div>
                  <figcaption className="mt-7 flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-full bg-ink text-[0.56rem] font-extrabold text-cream">
                        {initials}
                      </span>
                      <span>
                        <span className="block text-[0.7rem] font-bold text-ink">
                          {review.author}
                        </span>
                        <span className="block text-[0.58rem] text-muted">
                          {review.city ?? "Bangladesh"}
                        </span>
                      </span>
                    </div>
                    {product ? (
                      <span className="max-w-[8rem] text-right text-[0.55rem] font-semibold uppercase leading-[1.5] tracking-[0.06em] text-muted">
                        {product.title}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
