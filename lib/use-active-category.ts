"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category } from "./types";

function normalizeCategoryHash(hash: string) {
  const value = decodeURIComponent(hash)
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/^category-/, "")
    .replace(/\/+$/g, "")
    .trim();
  return value.replace(/[^a-z0-9-]/g, "");
}

/**
 * The active category is owned by the URL hash, not by the strip or grid.
 * Both the strip and the grid consume the same hook state.
 */
export function useActiveCategory(deptSlug: string, categories: Category[]) {
  const fallback: string | null = null;
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const syncFromHash = useCallback(() => {
    const fromHash = normalizeCategoryHash(window.location.hash);
    const match = categories.find((category) => category.slug === fromHash);
    setActiveSlug(match?.slug ?? fallback ?? null);
    setReady(true);
  }, [categories, fallback]);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, [deptSlug, syncFromHash]);

  const selectCategory = useCallback(
    (slug: string) => {
      const match = categories.find((category) => category.slug === slug);
      if (!match) return;
      setActiveSlug(slug);
      setReady(true);
      if (window.location.hash !== `#${slug}`) {
        window.history.replaceState(null, "", `#${slug}`);
      }
      const target = document.getElementById(slug);
      if (target) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    },
    [categories]
  );

  return {
    activeSlug,
    activeCategory: categories.find((category) => category.slug === activeSlug) ?? null,
    ready,
    selectCategory,
    setActiveCategory: setActiveSlug,
  };
}
