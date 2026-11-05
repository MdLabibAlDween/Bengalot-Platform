import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductEditor, type ProductEditorValue } from "@/components/admin/product-editor";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { departments, sizeGuideTemplates } from "@/lib/data";
import { getAllStoreCategories } from "@/lib/taxonomy-db";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminSupabaseClient();
  if (!admin) notFound();
  const { data } = await admin.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const categories = await getAllStoreCategories();
  const payload = (data.payload ?? {}) as Partial<Product>;
  const images =
    Array.isArray(payload.images) && payload.images.length > 0
      ? payload.images.map((image, index) => ({
          id: image.id ?? `image-${index + 1}`,
          url: image.url,
          alt: image.alt ?? data.name,
          color: image.color ?? "",
          sort: Number(image.sort ?? index + 1),
        }))
      : data.image_url
        ? [
            {
              id: "primary",
              url: data.image_url,
              alt: data.name,
              color: "",
              sort: 1,
            },
          ]
        : [];
  const variants =
    Array.isArray(payload.variants) && payload.variants.length > 0
      ? payload.variants.map((variant, index) => ({
          id: variant.id ?? `variant-${index + 1}`,
          size: variant.size,
          color: variant.color,
          stock: Number(variant.stock ?? 0),
          sku: variant.sku ?? "",
          price: variant.price ?? null,
          compareAt: variant.compareAt ?? null,
        }))
      : [];
  const value: ProductEditorValue = {
    id: data.id,
    name: data.name,
    slug: data.slug,
    department: data.department,
    category: data.category,
    audience: (payload.audience ?? "unisex") as ProductEditorValue["audience"],
    price: Number(data.price),
    compareAt: data.compare_at ?? null,
    stock: Number(data.stock),
    status: data.status as ProductEditorValue["status"],
    isDemo: payload.isDemo === true,
    sizes:
      Array.isArray(payload.sizes) && payload.sizes.length > 0
        ? payload.sizes
        : [{ label: "One size", stock: Number(data.stock) }],
    colors:
      Array.isArray(payload.colors) && payload.colors.length > 0
        ? payload.colors
        : [{ name: "Default", hex: "#3B2A8C" }],
    variants,
    images,
    seoTitle: payload.seoTitle ?? "",
    seoDescription: payload.seoDescription ?? "",
    imageUrl: data.image_url ?? payload.imageUrl ?? "",
    hoverImageUrl: data.hover_image_url ?? "",
    videoUrl: payload.videoUrl ?? "",
    shortDescription: payload.shortDescription ?? "",
    description: payload.description ?? "",
    materials: payload.materials ?? "",
    care: payload.care ?? "",
    tags: payload.tags ?? [],
    sets: payload.sets ?? [],
    badge: (payload.badge ?? "") as ProductEditorValue["badge"],
    sku: payload.sku ?? "",
    sizeGuideId: payload.sizeGuideId ?? "men-tops",
    collectionSlug: payload.collectionSlug ?? "",
    collectionNote: payload.collectionNote ?? "",
    highlights: payload.highlights ?? [],
    materialLines: payload.materialLines ?? [],
    careLines: payload.careLines ?? [],
    fitNote: payload.fitNote ?? "",
  };
  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title={data.name}
        description="Edit product details, media, variants, inventory, content and SEO."
      />
      <ProductEditor
        initial={value}
        departments={departments.map(({ slug, name }) => ({ slug, name }))}
        categories={categories.map(({ slug, name, department }) => ({ slug, name, department }))}
        sizeGuides={Object.values(sizeGuideTemplates).map(({ id, name, unit, note, columns }) => ({
          id,
          name,
          unit,
          note,
          columns,
        }))}
      />
    </div>
  );
}
