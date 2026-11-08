import type { Category, Product } from "@/lib/types";

export const categoryAccent: Record<
  string,
  { label: string; motif: string }
> = {
  "notion-templates": { label: "Digital", motif: "A calmer workspace" },
  "study-cards": { label: "Printed", motif: "Recall, not rereading" },
  "printed-planners": { label: "Printed", motif: "A week with shape" },
  "focus-productivity": { label: "Screen-free", motif: "Protect the hour" },
  bundles: { label: "Save more", motif: "The whole system" },
};

export const categoryOrder = [
  "notion-templates",
  "study-cards",
  "printed-planners",
  "focus-productivity",
  "bundles",
] as const;

export function categoryEyebrow(category: Category) {
  return categoryAccent[category.slug]?.label ?? "Collection";
}

/**
 * Bundles are grouped together for browsing, even when their fulfilment is
 * physical. A printed + digital bundle should still appear under Bundles in
 * the shop filters and product cards.
 */
export function productShelfType(
  product: Pick<Product, "type" | "category_slug">,
): "digital" | "physical" | "bundle" {
  if (product.category_slug === "bundles") return "bundle";
  return product.type;
}

export function productShelfLabel(
  product: Pick<Product, "type" | "category_slug">,
) {
  const shelfType = productShelfType(product);
  if (shelfType === "bundle") return "Bundle";
  if (shelfType === "physical") return "Physical";
  return "Digital";
}

export function productTypeLabel(type: string) {
  if (type === "physical") return "Physical";
  if (type === "bundle") return "Bundle";
  return "Digital";
}
