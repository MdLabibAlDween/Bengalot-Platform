"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/lib/providers";
import type { Product } from "@/lib/types";

export function ProductViewTracker({ product }: { product: Product }) {
  const { add } = useRecentlyViewed();
  useEffect(() => {
    add(product);
  }, [add, product]);
  return null;
}
