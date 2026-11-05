"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }}
      className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 pl-5 shadow-[0_20px_50px_-35px_rgba(20,10,40,0.45)] focus-within:border-gold"
    >
      <Search className="h-5 w-5 shrink-0 text-gold" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for sarees, panjabis, sneakers…"
        aria-label="Search products"
        className="h-11 min-w-0 flex-1 bg-transparent text-[0.9rem] outline-none placeholder:text-muted-foreground/60"
      />
      <button
        type="submit"
        className="cta-primary h-11 shrink-0 rounded-full px-6 text-xs font-bold uppercase tracking-[0.12em]"
      >
        Search
      </button>
    </form>
  );
}
