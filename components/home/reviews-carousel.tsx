"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Quote } from "lucide-react";
import { RatingStars } from "@/components/storefront/rating-stars";
import { SectionHeading } from "@/components/storefront/section-heading";
import { reviews } from "@/lib/data";
import { SECTION_COPY } from "@/lib/homepage";
import { formatDate, initials } from "@/lib/utils";

export function ReviewsCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const approved = reviews;
  const copy = SECTION_COPY.reviews;

  if (approved.length === 0) {
    return (
      <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
        <div className="container-luxe">
          <SectionHeading
        contentKey="reviews"
            eyebrow={copy.eyebrow}
            title={copy.title}
            accent={copy.accent}
            description={copy.description}
          />

          <div className="mt-8 rounded-[22px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center md:px-10 md:py-14">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/30 text-gold">
              <Quote className="h-6 w-6" strokeWidth={1.2} />
            </span>
            <p className="mt-4 font-display text-2xl leading-snug text-[var(--color-ink)]">
              No reviews yet.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              Real reviews from customers will appear here once they are submitted and
              approved.
            </p>
            <Link
              href="/collections"
              className="cta-primary mt-6 inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
            >
              Explore the collection
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const average =
    approved.reduce((sum, review) => sum + review.rating, 0) / approved.length;

  const scroll = (direction: number) =>
    scroller.current?.scrollBy({ left: direction * 380, behavior: "smooth" });

  return (
    <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
        contentKey="reviews"
            eyebrow={copy.eyebrow}
            title={copy.title}
            accent={copy.accent}
            description={copy.description}
          />
          <div className="mb-1 hidden shrink-0 items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Previous reviews"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-border)] bg-white/55 text-[var(--color-ink)] transition hover:border-[var(--color-ink)] hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Next reviews"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-border)] bg-white/55 text-[var(--color-ink)] transition hover:border-[var(--color-ink)] hover:bg-white"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
            <span className="font-display text-2xl leading-none text-[var(--color-ink)]">
              {average.toFixed(1)}
            </span>
            <RatingStars rating={average} />
            <span className="text-xs uppercase tracking-[0.08em] text-[var(--color-muted-foreground)]">
              {approved.length} {approved.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        <div
          ref={scroller}
          className="no-scrollbar -mx-5 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 md:mx-0 md:px-0"
        >
          {approved.map((review, index) => {
            return (
              <article
                key={review.id}
                className="relative flex min-w-[85vw] snap-start flex-col rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_20px_48px_-38px_rgba(36,26,80,0.36)] sm:min-w-[360px] md:p-7"
              >
                <Quote
                  className="absolute right-6 top-6 h-9 w-9 text-[var(--color-saffron)]/25"
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <RatingStars rating={review.rating} />
                <h3 className="mt-4 font-display text-xl leading-snug text-[var(--color-ink)]">
                  {review.title}
                </h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                  “{review.body}”
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-[var(--color-border)] pt-4">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-semibold text-ivory"
                    style={{
                      background:
                        index % 3 === 0
                          ? "linear-gradient(135deg,var(--color-indigo),var(--color-indigo-luminous))"
                          : index % 3 === 1
                            ? "linear-gradient(135deg,var(--color-magenta),var(--color-magenta))"
                            : "linear-gradient(135deg,var(--color-teal),var(--color-teal))",
                    }}
                  >
                    {initials(review.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink)]">
                      {review.name}
                      {review.verified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-[var(--color-jade)]" aria-label="Verified buyer" />
                      )}
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {review.location} · {formatDate(review.date)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
