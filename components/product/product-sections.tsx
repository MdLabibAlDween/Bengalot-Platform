import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Keep the week moving</p>
            <h2 className="display-lg mt-3 max-w-[16ch] text-ink">
              Goes well with{" "}
              <span className="display-italic text-coral">this one.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="group hidden items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-teal sm:flex"
          >
            Shop all
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="no-scrollbar -mx-[var(--page-gutter)] mt-8 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-[var(--page-gutter)] pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="w-[72vw] shrink-0 snap-start sm:w-[46vw] md:w-auto md:min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductReviews({
  reviews,
  productTitle,
}: {
  reviews: { id: string; author: string; city: string | null; rating: number; body: string }[];
  productTitle: string;
}) {
  if (!reviews.length) return null;

  return (
    <section className="border-y border-line bg-paper py-16">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">From learners</p>
            <h2 className="display-lg mt-3 text-ink">
              How it fits into a{" "}
              <span className="display-italic text-teal">real week.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2">
            <span className="flex items-center gap-0.5 text-coral" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="size-3 fill-current" />
              ))}
            </span>
            <span className="text-[0.64rem] font-semibold text-ink-soft">
              Reviews for {productTitle}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "mt-8 grid gap-3.5",
            reviews.length === 1 ? "md:grid-cols-2" : "md:grid-cols-3",
          )}
        >
          {reviews.slice(0, 3).map((review) => {
            const initials = review.author
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2);
            return (
              <figure
                key={review.id}
                className="rounded-[1.3rem] border border-line bg-cream p-6"
              >
                <div className="flex items-center gap-0.5 text-coral" aria-hidden="true">
                  {Array.from({ length: review.rating }).map((_, star) => (
                    <Star key={star} className="size-3 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 font-display text-[1.2rem] leading-[1.35] tracking-[-0.02em] text-ink">
                  “{review.body}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-2.5 border-t border-line pt-4">
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-[0.55rem] font-extrabold text-cream">
                    {initials}
                  </span>
                  <span>
                    <span className="block text-[0.68rem] font-bold text-ink">
                      {review.author}
                    </span>
                    <span className="block text-[0.56rem] text-muted">
                      {review.city ?? "Bangladesh"}
                    </span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
          {reviews.length < 3 ? (
            <aside className="relative overflow-hidden rounded-[1.3rem] bg-teal p-6 text-cream">
              <div
                className="pointer-events-none absolute inset-0 dot-paper opacity-15"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-butter-soft">
                  Our promise
                </p>
                <p className="mt-3 font-display text-[1.45rem] leading-[1.1] tracking-[-0.03em]">
                  A tool should earn its place on the desk.
                </p>
                <div className="mt-4 space-y-2 border-t border-cream/15 pt-4">
                  {[
                    "Checked by a person before dispatch",
                    "Original artwork, not stock imagery",
                    "Support that replies with a real answer",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-butter" />
                      <span className="text-[0.66rem] leading-relaxed text-cream/85">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
