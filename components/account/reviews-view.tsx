"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageSquare, PenLine, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AccountHeading } from "./account-heading";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/data";
import { cn } from "@/lib/utils";

type ReviewRow = {
  id: string;
  product_slug: string;
  name: string;
  location: string | null;
  rating: number;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  verified: boolean;
  helpful: number;
  created_at: string;
};

const tones: Record<string, string> = {
  pending: "bg-saffron/15 text-gold-ink",
  approved: "bg-jade/10 text-jade",
  rejected: "bg-rosewood/10 text-rosewood",
};

export function ReviewsView() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/account/reviews", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        if (active && Array.isArray(data.reviews)) setReviews(data.reviews);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: reviews.length,
      pending: reviews.filter((review) => review.status === "pending").length,
      published: reviews.filter((review) => review.status === "approved").length,
    }),
    [reviews]
  );

  const visible = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((review) => review.status === filter)),
    [filter, reviews]
  );

  const remove = async (review: ReviewRow) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setRemoving(review.id);
    const response = await fetch("/api/account/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id }),
    });
    const result = await response.json().catch(() => ({}));
    setRemoving(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not delete the review.");
      return;
    }
    setReviews((current) => current.filter((item) => item.id !== review.id));
    toast.success("Review deleted");
  };

  return (
    <div>
      <AccountHeading
        eyebrow="Your words"
        title="My reviews"
        description="Every review is checked before it appears on the product page. Verified purchases are marked automatically."
        action={
          <Link
            href="/account/orders"
            className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] transition hover:border-gold hover:text-gold"
          >
            Review an order <ArrowUpRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { value: stats.total, label: "Reviews written" },
          { value: stats.pending, label: "Awaiting moderation" },
          { value: stats.published, label: "Published" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <p className="font-display text-2xl leading-none">{stat.value}</p>
            <p className="mt-1.5 text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold">
              Your words
            </p>
            <h2 className="mt-1 font-display text-xl">Your reviews</h2>
          </div>
          <div className="flex rounded-full border border-[var(--border)] p-0.5">
            {(["all", "approved", "pending", "rejected"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-[0.48rem] font-bold uppercase tracking-[0.06em] transition",
                  filter === key
                    ? "bg-midnight text-ivory"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1].map((key) => (
              <div key={key} className="h-24 animate-pulse rounded-xl bg-[var(--muted)]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/30 text-gold">
              <Star className="h-6 w-6" strokeWidth={1.3} />
            </span>
            <p className="mt-4 font-display text-2xl">No reviews here yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-[0.75rem] leading-relaxed text-muted-foreground">
              When a delivered piece is ready, you can share an honest note from its product
              page. Reviews are open to verified buyers.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/account/orders">View your orders</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {visible.map((review) => {
              const product = getProduct(review.product_slug);
              return (
                <div key={review.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-0.5 text-gold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn("h-3 w-3", star <= review.rating && "fill-current")}
                          />
                        ))}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.44rem] font-bold uppercase tracking-[0.08em]",
                          tones[review.status]
                        )}
                      >
                        {review.status}
                      </span>
                      {review.verified && (
                        <span className="rounded-full bg-jade/10 px-2 py-0.5 text-[0.44rem] font-bold uppercase tracking-[0.08em] text-jade">
                          Verified buyer
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[0.72rem] font-semibold">{review.title}</p>
                    <p className="mt-0.5 text-[0.64rem] leading-relaxed text-muted-foreground">
                      {review.body}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[0.54rem] text-muted-foreground">
                      <Link
                        href={`/product/${review.product_slug}`}
                        className="font-medium text-indigo hover:underline"
                      >
                        {product?.name ?? review.product_slug}
                      </Link>
                      <span>
                        {new Date(review.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove(review)}
                    disabled={removing === review.id}
                    className="grid h-8 w-8 place-items-center rounded-full border border-rosewood/25 text-rosewood transition hover:bg-rosewood hover:text-white disabled:opacity-50"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-gold/35 bg-gold/[0.05] p-5">
        <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <div>
          <p className="text-[0.76rem] font-semibold">How reviews work</p>
          <p className="mt-1 max-w-lg text-[0.66rem] leading-relaxed text-muted-foreground">
            Reviews are open to verified buyers after delivery. Every review is moderated
            before it is published. Approved reviews earn reward points when the programme is
            active.
          </p>
        </div>
      </div>

      {reviews.length === 0 && !loading && (
        <div className="mt-4 flex items-center gap-2 text-[0.6rem] text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" /> Reviews you submit from a product page
          will appear here.
        </div>
      )}
    </div>
  );
}
