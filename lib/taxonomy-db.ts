import "server-only";

import { cache } from "react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  collectionConfigs,
  getCollectionProducts,
  type StoreCollection,
} from "@/lib/collections";
import { bundles, publishedBundles } from "@/lib/bundles";
import { categories, products } from "@/lib/data";
import { getSetting } from "@/lib/admin/settings";
import { STORE_SETTINGS } from "@/lib/settings";
import type { ArtIcon, Bundle, Category, Product } from "@/lib/types";
import { discountedPrice } from "@/lib/utils";

export type StoreCategoryRow = {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  department: string;
  icon: string;
  tagline: string;
  image_url: string | null;
  status: "published" | "hidden";
  is_demo: boolean;
  sort: number;
  created_at: string;
};

export type StoreCollectionRow = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  palette: string[] | null;
  note: string | null;
  closing_title: string;
  closing_text: string;
  meta_title: string;
  meta_description: string;
  kind: StoreCollection["kind"];
  status: "published" | "hidden";
  is_demo: boolean;
  sort: number;
  product_slugs: string[] | null;
  created_at: string;
};

export type StoreBundleRow = {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  department: string;
  short_description: string;
  description: string;
  cover_art: string;
  cover_palette: string[] | null;
  discount_type: Bundle["discountType"];
  discount_value: number;
  status: "draft" | "published";
  featured: boolean;
  allow_partial_purchase: boolean;
  items: { productSlug: string; quantity: number; sort: number }[] | null;
  seo_title: string;
  seo_description: string;
  is_demo: boolean;
  sort: number;
  created_at: string;
};

function audienceFor(department: string) {
  return department === "men" || department === "women" || department === "kids"
    ? department
    : "unisex";
}

export function mapCategoryRow(row: StoreCategoryRow): Category {
  return {
    slug: row.slug,
    name: row.name,
    nameBn: row.name_bn ?? "",
    department: row.department,
    audience: audienceFor(row.department),
    isDemo: row.is_demo,
    icon: (row.icon || "tshirt") as ArtIcon,
    tagline: row.tagline,
    imageUrl: row.image_url ?? undefined,
  };
}

function paletteOf(values: string[] | null | undefined): [string, string] {
  if (Array.isArray(values) && values.length >= 2) {
    return [values[0], values[1]];
  }
  return ["var(--color-indigo)", "var(--color-magenta)"];
}

async function taxonomyTableHasRows(
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>,
  table: "store_categories" | "store_collections" | "store_bundles"
) {
  const { count } = await admin.from(table).select("id", { count: "exact", head: true });
  return (count ?? 0) > 0;
}

export function mapCollectionRow(row: StoreCollectionRow): StoreCollection {
  return {
    slug: row.slug,
    eyebrow: row.eyebrow,
    title: row.title,
    accent: row.accent,
    description: row.description,
    palette: paletteOf(row.palette),
    note: row.note ?? undefined,
    closingTitle: row.closing_title,
    closingText: row.closing_text,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    kind: row.kind,
    isDemo: row.is_demo,
  };
}

export function mapBundleRow(row: StoreBundleRow): Bundle {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameBn: row.name_bn ?? undefined,
    department: row.department,
    isDemo: row.is_demo,
    shortDescription: row.short_description,
    description: row.description,
    coverArt: (row.cover_art || "jacket") as ArtIcon,
    coverPalette: paletteOf(row.cover_palette),
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    status: row.status,
    featured: Boolean(row.featured),
    allowPartialPurchase: Boolean(row.allow_partial_purchase),
    items: Array.isArray(row.items)
      ? row.items.map((item, index) => ({
          productSlug: String(item.productSlug),
          quantity: Math.max(1, Number(item.quantity ?? 1)),
          sort: Number(item.sort ?? index + 1),
        }))
      : [],
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    createdAt: row.created_at,
    sort: Number(row.sort ?? 0),
  };
}

export const getStoreCategories = cache(async (department?: string) => {
  const admin = createAdminSupabaseClient();
  if (!admin) {
    return categories.filter((category) => !department || category.department === department);
  }
  let query = admin
    .from("store_categories")
    .select("*")
    .eq("status", "published")
    .order("sort", { ascending: true });
  if (department) query = query.eq("department", department);
  const { data, error } = await query;
  if (error || !data) {
    return categories.filter((category) => !department || category.department === department);
  }
  if (data.length === 0 && !(await taxonomyTableHasRows(admin, "store_categories"))) {
    return categories.filter((category) => !department || category.department === department);
  }
  return (data as StoreCategoryRow[]).map(mapCategoryRow);
});

export async function getAllStoreCategories() {
  const admin = createAdminSupabaseClient();
  if (!admin) return categories;
  const { data, error } = await admin
    .from("store_categories")
    .select("*")
    .order("department", { ascending: true })
    .order("sort", { ascending: true });
  if (error || !data) return categories;
  return (data as StoreCategoryRow[]).map(mapCategoryRow);
}

export const getStoreCategory = cache(async (department: string, slug: string) => {
  const list = await getStoreCategories(department);
  return list.find((category) => category.slug === slug);
});

export const getStoreCollections = cache(async () => {
  const admin = createAdminSupabaseClient();
  if (!admin) return collectionConfigs;
  const { data, error } = await admin
    .from("store_collections")
    .select("*")
    .eq("status", "published")
    .order("sort", { ascending: true });
  if (error || !data) return collectionConfigs;
  if (data.length === 0 && !(await taxonomyTableHasRows(admin, "store_collections"))) {
    return collectionConfigs;
  }
  return (data as StoreCollectionRow[]).map(mapCollectionRow);
});

export const getAllStoreCollections = cache(async () => {
  const admin = createAdminSupabaseClient();
  if (!admin) return collectionConfigs;
  const { data, error } = await admin
    .from("store_collections")
    .select("*")
    .order("sort", { ascending: true });
  if (error || !data) return collectionConfigs;
  return (data as StoreCollectionRow[]).map(mapCollectionRow);
});

export async function getStoreCollection(
  slug: string,
  catalogue: Product[] = products
) {
  const admin = createAdminSupabaseClient();
  const { data, error } = admin
    ? await admin.from("store_collections").select("*").eq("slug", slug).maybeSingle()
    : { data: null, error: null };
  if (error) return undefined;
  if (!data) {
    if (admin && (await taxonomyTableHasRows(admin, "store_collections"))) return undefined;
    const fallback = collectionConfigs.find((collection) => collection.slug === slug);
    if (!fallback) return undefined;
    if (STORE_SETTINGS.hideDemoContent && fallback.isDemo) return undefined;
    const fallbackProducts = getCollectionProducts(fallback.kind, catalogue);
    return {
      ...fallback,
      products: fallbackProducts,
      stats: [
        { value: String(fallbackProducts.length), label: "pieces" },
        { value: "COD", label: "payment" },
        { value: "Online", label: "direct" },
      ],
      note: fallback.note,
      productSlugs: [],
    };
  }
  const row = data as StoreCollectionRow;
  if (row.status !== "published") return undefined;
  const config = mapCollectionRow(row);
  if (STORE_SETTINGS.hideDemoContent && config.isDemo) return undefined;

  const manualSlugs = row.product_slugs ?? [];
  const collectionProducts = manualSlugs.length
    ? manualSlugs
        .map((productSlug) => catalogue.find((product) => product.slug === productSlug))
        .filter((product): product is Product => Boolean(product))
    : getCollectionProducts(config.kind, catalogue);
  const maxOff = Math.max(
    0,
    ...collectionProducts.map(
      (product) => discountedPrice(product.price, product.compareAt) ?? 0
    )
  );

  const statsByKind: Record<StoreCollection["kind"], { value: string; label: string }[]> = {
    new: [
      { value: String(collectionProducts.length), label: "new pieces" },
      { value: "Online", label: "direct" },
      { value: "COD", label: "payment" },
    ],
    best: [
      { value: String(collectionProducts.length), label: "pieces" },
      { value: "COD", label: "payment" },
      { value: "Online", label: "direct" },
    ],
    sale: [
      { value: `−${maxOff}%`, label: "up to" },
      { value: String(collectionProducts.length), label: "pieces" },
      { value: "COD", label: "payment" },
    ],
    royal: [
      { value: String(collectionProducts.length), label: "festive pieces" },
      { value: "COD", label: "payment" },
      { value: "Online", label: "direct" },
    ],
    heirloom: [
      { value: String(collectionProducts.length), label: "handmade pieces" },
      { value: "COD", label: "payment" },
      { value: "Online", label: "direct" },
    ],
  };

  const note =
    config.kind === "sale" && !STORE_SETTINGS.exchangeWindowEnabled
      ? undefined
      : config.note;

  return {
    ...config,
    products: collectionProducts,
    stats: statsByKind[config.kind],
    note,
    productSlugs: manualSlugs,
  };
}

export async function getStoreCollectionSummaries(catalogue: Product[] = products) {
  const configs = await getStoreCollections();
  return Promise.all(
    configs.map(async (collection) => {
      const detail = await getStoreCollection(collection.slug, catalogue);
      const collectionProducts = detail?.products ?? [];
      return {
        ...collection,
        productCount: collectionProducts.length,
        coverProduct: collectionProducts[0],
      };
    })
  );
}

export const getStoreBundles = cache(async (department?: string) => {
  const admin = createAdminSupabaseClient();
  const demoHidden = await getSetting<boolean>("demo_catalogue_hidden", false);
  const fallback = department
    ? publishedBundles.filter((bundle) => bundle.department === department)
    : publishedBundles;
  const availableFallback = demoHidden
    ? fallback.filter((bundle) => !bundle.isDemo)
    : fallback;
  if (!admin) return availableFallback;
  let query = admin
    .from("store_bundles")
    .select("*")
    .eq("status", "published")
    .order("sort", { ascending: true });
  if (department) query = query.eq("department", department);
  const { data, error } = await query;
  if (error || !data) return availableFallback;
  if (data.length === 0 && !(await taxonomyTableHasRows(admin, "store_bundles"))) {
    return availableFallback;
  }
  return (data as StoreBundleRow[])
    .map(mapBundleRow)
    .filter((bundle) => !STORE_SETTINGS.hideDemoProducts || !bundle.isDemo)
    .filter((bundle) => !demoHidden || !bundle.isDemo);
});

export async function getAllStoreBundles() {
  const admin = createAdminSupabaseClient();
  if (!admin) return bundles;
  const { data, error } = await admin
    .from("store_bundles")
    .select("*")
    .order("department", { ascending: true })
    .order("sort", { ascending: true });
  if (error || !data) return bundles;
  return (data as StoreBundleRow[]).map(mapBundleRow);
}

export const getStoreBundle = cache(async (slug: string) => {
  const admin = createAdminSupabaseClient();
  const demoHidden = await getSetting<boolean>("demo_catalogue_hidden", false);
  const { data } = admin
    ? await admin.from("store_bundles").select("*").eq("slug", slug).maybeSingle()
    : { data: null };
  if (!data) {
    if (admin && (await taxonomyTableHasRows(admin, "store_bundles"))) return undefined;
    const fallback = publishedBundles.find((bundle) => bundle.slug === slug);
    if (demoHidden && fallback?.isDemo) return undefined;
    return fallback;
  }
  const row = data as StoreBundleRow;
  if (row.status !== "published") return undefined;
  const bundle = mapBundleRow(row);
  if (STORE_SETTINGS.hideDemoProducts && bundle.isDemo) return undefined;
  if (demoHidden && bundle.isDemo) return undefined;
  return bundle;
});

export const getCatalogSnapshot = cache(async () => {
  const [storeCategories, storeBundles] = await Promise.all([
    getStoreCategories(),
    getStoreBundles(),
  ]);
  return {
    categories: storeCategories,
    bundles: storeBundles,
  };
});
