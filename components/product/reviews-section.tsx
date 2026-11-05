"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { RatingStars } from "@/components/storefront/rating-stars";
import { reviewsFor } from "@/lib/data";
import { getLocalOrders } from "@/lib/order-store";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Product, Review } from "@/lib/types";
import { cn, formatDate, initials } from "@/lib/utils";

export function ReviewsSection({
  product,
  reviews: storeReviews,
}: {
  product: Product;
  reviews?: Review[];
}) {
  const initial = useMemo(
    () => (storeReviews && storeReviews.length > 0 ? storeReviews : reviewsFor(product.slug)),
    [product.slug, storeReviews]
  );
  const reviews = initial;
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const local = getLocalOrders().some((order) =>
        order.items.some((item) => item.productSlug === product.slug)
      );
      if (!active) return;
      setPurchased(local);
      if (local) return;
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch("/api/account/orders", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json().catch(() => ({}));
      if (
        active &&
        Array.isArray(data.orders) &&
        data.orders.some((order: { items?: { productSlug?: string }[] }) =>
          order.items?.some((item) => item.productSlug === product.slug)
        )
      ) {
        setPurchased(true);
      }
    })().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [product.slug]);

  const [submitting, setSubmitting] = useState(false);

  const total = reviews.length;
  const average =
    total > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
      : 0;
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length;
    return {
      stars,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchased) {
      toast.error("Only verified buyers can review this piece.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast.error("Please add a title and a few words.");
      return;
    }
    setSubmitting(true);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: product.slug,
        rating,
        title,
        body,
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSubmitting(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not submit your review.");
      return;
    }
    setOpen(false);
    setTitle("");
    setBody("");
    setRating(5);
    toast.success("Thank you — your review is awaiting moderation.", {
      description: "It will appear here once approved.",
    });
  };

  return (
    <section id="reviews" className="scroll-mt-28 border-t border-[var(--border)] py-16 md:py-20">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow flex items-center gap-3 text-indigo">
              <span className="h-px w-8 bg-gold" /> Customer reviews
            </p>
            <h2 className="display-3 mt-3">Reviews.</h2>
            <p className="mt-2 max-w-lg text-[0.8rem] leading-relaxed text-muted-foreground">
              Verified customers can share how a piece fits and feels. Reviews appear
              here after moderation.
            </p>
          </div>
          {purchased && (
            <Button variant="outline" onClick={() => setOpen(true)}>
              Write a review
            </Button>
          )}
        </div>

        <div
          className={cn(
            "mt-9 grid gap-8",
            total > 0 && "lg:grid-cols-[300px_1fr] lg:gap-12"
          )}
        >
          {total > 0 && (
            <div className="self-start rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:sticky lg:top-28">
              <div className="flex items-end gap-3">
                <p className="font-display font-numeric text-5xl leading-none">
                  {average.toFixed(1)}
                </p>
                <div className="pb-1">
                  <RatingStars rating={average} />
                  <p className="mt-1 text-[0.75rem] uppercase tracking-[0.1em] text-muted-foreground">
                    {total} {total === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {distribution.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2.5">
                    <span className="flex w-8 items-center gap-1 text-[0.75rem] tabular-nums text-muted-foreground">
                      {row.stars} <Star className="h-2.5 w-2.5 fill-gold text-gold" />
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full bg-gold transition-all duration-500"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[0.75rem] tabular-nums text-muted-foreground">
                      {row.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-royal font-display text-sm font-semibold text-ivory">
                        {initials(review.name)}
                      </span>
                      <div>
                        <p className="flex items-center gap-1.5 text-[0.78rem] font-semibold">
                          {review.name}
                          {review.verified && (
                            <BadgeCheck className="h-3.5 w-3.5 text-jade" aria-label="Verified buyer" />
                          )}
                        </p>
                        <p className="text-[0.75rem] text-muted-foreground">
                          {review.location} · {formatDate(review.date)}
                        </p>
                      </div>
                    </div>
                    <RatingStars rating={review.rating} />
                  </div>
                  <h3 className="mt-4 font-display text-lg leading-snug">{review.title}</h3>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setHelpful((current) => ({
                          ...current,
                          [review.id]: !current[review.id],
                        }))
                      }
                      className={cn(
                        "flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition",
                        helpful[review.id] ? "text-gold-ink" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ThumbsUp
                        className={cn("h-3.5 w-3.5", helpful[review.id] && "fill-current")}
                      />
                      Helpful · {review.helpful + (helpful[review.id] ? 1 : 0)}
                    </button>
                    <span className="text-[0.75rem] uppercase tracking-[0.12em] text-muted-foreground">
                      Verified purchase
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line-strong)] p-10 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/30 text-gold">
                  <Star className="h-6 w-6" strokeWidth={1.3} />
                </span>
                <p className="mt-4 font-display text-2xl">No reviews yet.</p>
                <p className="mx-auto mt-2 max-w-sm text-[0.8rem] leading-relaxed text-muted-foreground">
                  {purchased
                    ? "Share how it fits and help the next customer."
                    : "Reviews open to verified customers after delivery."}
                </p>
                {purchased && (
                  <Button
                    variant="gold"
                    className="mt-5"
                    onClick={() => setOpen(true)}
                  >
                    Write the first review
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Share your experience of the {product.name}. Reviews are moderated before
            publishing.
          </DialogDescription>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <Label>Your rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    className="p-0.5"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition",
                        star <= rating
                          ? "fill-gold text-gold"
                          : "fill-transparent text-[var(--line-strong)]"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-title">Title</Label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A few words that sum it up"
              />
            </div>
            <div>
              <Label htmlFor="review-body">Your review</Label>
              <Textarea
                id="review-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="How does it fit? How is the fabric? Would you recommend it?"
              />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
