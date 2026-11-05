import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { normalizeVariants } from "@/lib/variants";
import type { Product } from "@/lib/types";

type Row = {
  slug: string;
  name: string;
  department: string;
  category: string;
  price: number;
  compare_at: number | null;
  stock: number;
  image_url: string | null;
  hover_image_url: string | null;
  payload: Record<string, unknown> | null;
};

function mapProduct(row: Row): Product {
  const payload = (row.payload ?? {}) as Partial<Product>;
  const variants = normalizeVariants(payload.variants);
  const images = Array.isArray(payload.images)
    ? payload.images
        .filter((image) => image && typeof image.url === "string" && image.url)
        .map((image, index) => ({
          id: String(image.id ?? `image-${index + 1}`),
          url: String(image.url),
          alt: String(image.alt ?? row.name),
          color: image.color ? String(image.color) : undefined,
          sort: Number(image.sort ?? index + 1),
        }))
        .sort((a, b) => a.sort - b.sort)
    : [];
  return {
    ...(payload as Product),
    id: payload.id ?? row.slug,
    slug: row.slug,
    name: row.name,
    department: row.department,
    category: row.category,
    price: Number(row.price),
    compareAt: row.compare_at ?? undefined,
    stock: Number(row.stock),
    imageUrl: row.image_url ?? payload.imageUrl ?? images[0]?.url,
    hoverImageUrl:
      row.hover_image_url ?? payload.hoverImageUrl ?? images[1]?.url,
    isDemo: payload.isDemo === true,
    colors: payload.colors ?? [{ name: "Default", hex: "#3B2A8C" }],
    sizes: payload.sizes ?? [{ label: "One size", stock: Number(row.stock) }],
    variants: variants.length > 0 ? variants : undefined,
    images: images.length > 0 ? images : undefined,
    art: payload.art ?? "tshirt",
    palette: payload.palette ?? ["var(--color-indigo)", "var(--color-magenta)"],
    shortDescription: payload.shortDescription ?? "",
    description: payload.description ?? "",
    materials: payload.materials ?? "",
    care: payload.care ?? "",
    tags: payload.tags ?? [],
    sets: payload.sets ?? [],
    rating: payload.rating ?? 0,
    reviewCount: payload.reviewCount ?? 0,
    sku: payload.sku ?? row.slug.toUpperCase(),
    sizeGuideId: payload.sizeGuideId ?? "men-tops",
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };
}

export async function getDbProducts(department?: string, category?: string) {
  const admin = createAdminSupabaseClient();
  if (!admin) return [];
  let query = admin
    .from("products")
    .select("slug,name,department,category,price,compare_at,stock,image_url,hover_image_url,payload")
    .eq("status", "published")
    .order("sort", { ascending: true });
  if (department) query = query.eq("department", department);
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map((row) => mapProduct(row as Row));
}

export async function getDbProduct(slug: string) {
  const admin = createAdminSupabaseClient();
  if (!admin) return undefined;
  const { data } = await admin
    .from("products")
    .select("slug,name,department,category,price,compare_at,stock,image_url,hover_image_url,payload")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? mapProduct(data as Row) : undefined;
}
