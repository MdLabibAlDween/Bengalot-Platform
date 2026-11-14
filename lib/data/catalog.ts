import { cache } from "react";

import snapshot from "@/lib/data/snapshot.json";
import { normaliseSettings } from "@/lib/settings";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type {
  Category,
  Product,
  Promotion,
  Review,
  StoreSettings,
} from "@/lib/types";

type CatalogSnapshot = {
  categories: Category[];
  products: Product[];
  promotions: Promotion[];
  reviews: Review[];
  settings: Record<string, unknown>;
};

const fallback = snapshot as unknown as CatalogSnapshot;

export type CatalogData = {
  categories: Category[];
  products: Product[];
  promotions: Promotion[];
  reviews: Review[];
  settings: StoreSettings;
  source: "database" | "snapshot";
};

async function loadCatalog(): Promise<CatalogData> {
  try {
    const supabase = createSupabasePublicClient();
    const [productsResult, categoriesResult, promotionsResult, reviewsResult, settingsResult] =
      await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .order("sort", { ascending: true }),
        supabase
          .from("categories")
          .select("*")
          .eq("is_published", true)
          .order("sort", { ascending: true }),
        supabase
          .from("promotions")
          .select("*")
          .eq("is_active", true)
          .order("sort", { ascending: true }),
        supabase
          .from("reviews")
          .select("*")
          .eq("is_approved", true)
          .order("created_at", { ascending: false }),
        supabase.from("site_settings").select("key,value"),
      ]);

    if (
      productsResult.error ||
      categoriesResult.error ||
      promotionsResult.error ||
      !productsResult.data?.length
    ) {
      throw productsResult.error ?? categoriesResult.error ?? promotionsResult.error;
    }

    const settingsRow = settingsResult.data?.find((row) => row.key === "store");
    const promotionRows =
      promotionsResult.data?.length
        ? promotionsResult.data
        : fallback.promotions;

    return {
      products: productsResult.data as Product[],
      categories: categoriesResult.data as Category[],
      promotions: promotionRows as Promotion[],
      reviews: (reviewsResult.data ?? []) as Review[],
      settings: normaliseSettings(settingsRow?.value),
      source: "database",
    };
  } catch (error) {
    console.warn("Using local catalogue snapshot:", error);
    return {
      ...fallback,
      settings: normaliseSettings(fallback.settings.store),
      source: "snapshot",
    };
  }
}

export const getCatalog = cache(loadCatalog);

export async function getProductBySlug(slug: string) {
  const catalog = await getCatalog();
  return catalog.products.find((product) => product.slug === slug) ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const catalog = await getCatalog();
  return catalog.categories.find((category) => category.slug === slug) ?? null;
}

export function getRelatedProducts(
  catalog: CatalogData,
  product: Product,
  limit = 4,
) {
  const sameCategory = catalog.products.filter(
    (item) =>
      item.slug !== product.slug && item.category_slug === product.category_slug,
  );
  const rest = catalog.products.filter(
    (item) =>
      item.slug !== product.slug && item.category_slug !== product.category_slug,
  );

  return [...sameCategory, ...rest].slice(0, limit);
}

export function getReviewsForProduct(catalog: CatalogData, productId: string) {
  return catalog.reviews.filter((review) => review.product_id === productId);
}
