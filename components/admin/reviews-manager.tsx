"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageSquare, Search, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function ReviewsManager({ initial }: { initial: ReviewRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initial.filter((review) => {
      if (tab !== "all" && review.status !== tab) return false;
      if (!needle) return true;
      return [review.product_slug, review.name, review.title, review.body]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [initial, query, tab]);

  const act = async (id: string, action: "approved" | "rejected" | "delete") => {
    setSaving(true);
    const response = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        action === "delete" ? { id, action: "delete" } : { id, action: "status", status: action }
      ),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not update the review.");
      return;
    }
    toast.success(action === "delete" ? "Review deleted" : `Review ${action}`);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending", value: initial.filter((r) => r.status === "pending").length, tone: "text-gold-ink" },
          { label: "Approved", value: initial.filter((r) => r.status === "approved").length, tone: "text-jade" },
          { label: "Average rating", value: initial.length ? (initial.reduce((s, r) => s + r.rating, 0) / initial.length).toFixed(1) : "—", tone: "text-indigo" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
            <p className={cn("mt-2 font-display text-[1.8rem] leading-none tabular-nums", stat.tone)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] p-3">
          <div className="flex gap-1">
            {(["pending", "approved", "rejected", "all"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-full px-3 py-2 text-[0.56rem] font-bold uppercase tracking-[0.08em] transition",
                  tab === key ? "bg-midnight text-ivory" : "text-muted-foreground hover:bg-[var(--muted)]"
                )}
              >
                {key}
                {key !== "all" && (
                  <span className="ml-1.5 opacity-60">
                    {initial.filter((r) => r.status === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reviews"
              className="h-9 w-[220px] pl-9 text-[0.66rem]"
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground/35" />
            <p className="mt-3 font-display text-xl">Nothing in this queue.</p>
            <p className="mt-1 text-[0.64rem] text-muted-foreground">
              Verified reviews will appear here after a customer submits one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((review) => (
              <div key={review.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-0.5 text-gold">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={cn("h-3 w-3", star <= review.rating && "fill-current")} />
                      ))}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[0.44rem] font-bold uppercase tracking-[0.08em]", tones[review.status])}>
                      {review.status}
                    </span>
                    <span className="font-mono text-[0.5rem] text-muted-foreground">{review.product_slug}</span>
                  </div>
                  <p className="mt-1.5 text-[0.72rem] font-semibold">{review.title}</p>
                  <p className="mt-0.5 text-[0.64rem] leading-relaxed text-muted-foreground">{review.body}</p>
                  <p className="mt-1.5 text-[0.54rem] text-muted-foreground">
                    {review.name} · {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {review.status !== "approved" && (
                    <Button type="button" size="sm" variant="gold" disabled={saving} onClick={() => act(review.id, "approved")}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {review.status !== "rejected" && (
                    <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => act(review.id, "rejected")}>
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  )}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => act(review.id, "delete")}
                    className="grid h-8 w-8 place-items-center rounded-full border border-rosewood/25 text-rosewood hover:bg-rosewood hover:text-white"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
