"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Search, Sparkles, X } from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { departments, searchProducts, trendingSearches } from "@/lib/data";
import { useLocale } from "@/lib/providers";
import { formatBDT } from "@/lib/utils";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const results = useMemo(() => searchProducts(query).slice(0, 6), [query]);
  const showResults = query.trim().length > 0;

  const remember = (term: string) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 4);
    setRecent(next);
    try {
      localStorage.setItem("bengalot-recent-search", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const submit = (term?: string) => {
    const q = (term ?? query).trim();
    if (!q) return;
    remember(q);
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const openRecent = () => {
    try {
      const stored = localStorage.getItem("bengalot-recent-search");
      if (stored) setRecent(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) {
          openRecent();
        } else {
          setQuery("");
        }
      }}
    >
      <DialogContent className="max-w-2xl overflow-hidden p-0" showClose={false}>
        <DialogTitle className="sr-only">Search Bengalot</DialogTitle>
        <DialogDescription className="sr-only">
          Search the Bengalot collection by piece, department or category.
        </DialogDescription>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4"
        >
          <Search className="h-5 w-5 shrink-0 text-gold" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="h-9 flex-1 bg-transparent text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground/70"
            aria-label="Search products"
          />
          <span className="hidden items-center gap-1 rounded-md border border-[var(--border)] px-1.5 py-1 text-[0.58rem] font-semibold text-muted-foreground sm:flex">
            ESC
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground transition hover:border-gold hover:text-gold-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        <div className="max-h-[65vh] overflow-y-auto">
          {showResults ? (
            <div className="p-5">
              <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {results.length} {results.length === 1 ? "product" : "products"} found
              </p>
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/product/${p.slug}`}
                      onClick={() => {
                        remember(query);
                        onOpenChange(false);
                      }}
                      className="group flex items-center gap-3.5 rounded-xl p-2 transition hover:bg-[var(--muted)]"
                    >
                      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                        <ProductArt
                          id={`search-${p.slug}`}
                          art={p.art}
                          palette={p.palette}
                          showCaption={false}
                          showMonogram={false}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          {p.department} · {p.category.replace(/-/g, " ")}
                        </p>
                        <p className="truncate text-[0.88rem] font-medium transition group-hover:text-gold-ink-ink">
                          {p.name}
                        </p>
                        <p className="text-[0.75rem] tabular-nums text-muted-foreground">
                          {formatBDT(p.price)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 -translate-x-1 text-gold opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="font-display text-2xl">No products found for “{query}”</p>
                  <p className="mx-auto mt-2 max-w-sm text-[0.8rem] leading-relaxed text-muted-foreground">
                    Try a broader search, or browse a department. Our team on WhatsApp can
                    also help you find something specific.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => submit()}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition hover:border-gold"
              >
                {t("search.viewAll")}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-5">
              <p className="mb-3 flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-gold" /> {t("search.trending")}
              </p>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      remember(term);
                    }}
                    className="rounded-full border border-[var(--border)] px-3.5 py-1.5 text-[0.72rem] font-medium text-muted-foreground transition hover:border-gold hover:text-foreground"
                  >
                    {term}
                  </button>
                ))}
              </div>

              {recent.length > 0 && (
                <>
                  <p className="mb-3 mt-7 flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" /> {t("search.recent")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="rounded-full bg-[var(--muted)] px-3.5 py-1.5 text-[0.72rem] font-medium text-foreground transition hover:bg-gold hover:text-midnight"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                {departments.slice(0, 6).map((d) => (
                  <Link
                    key={d.slug}
                    href={`/${d.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="group flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 transition hover:border-gold hover:bg-[var(--muted)]"
                  >
                    <span className="text-[0.8rem] font-medium">{d.name}</span>
                    <span
                      className="h-2 w-2 rounded-full transition group-hover:scale-125"
                      style={{ backgroundColor: d.accent }}
                    />
                  </Link>
                ))}
              </div>

              <p className="mt-7 border-t border-[var(--border)] pt-4 text-center text-[0.65rem] text-muted-foreground">
                Press <kbd className="rounded border border-[var(--border)] px-1 py-0.5 font-sans">⌘K</kbd>{" "}
                or <kbd className="rounded border border-[var(--border)] px-1 py-0.5 font-sans">Ctrl K</kbd>{" "}
                anywhere to search · Try “jamdani”, “panjabi” or “jute”
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
