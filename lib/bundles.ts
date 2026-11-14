import type { Product, ProductPreview } from "@/lib/types";

/**
 * Legacy fallback for bundles created before component selection lived in the
 * admin. New bundles store their digital components in
 * `preview.productSlugs`, so owners can change them without a code change.
 */
export const bundleDigitalComponents: Record<string, string[]> = {
  "student-starter-bundle": ["notion-student-os", "deep-work-study-guide"],
};

type BundleLike = {
  slug: string;
  type: string;
  preview?: ProductPreview | Record<string, unknown> | null;
  has_digital_content?: boolean;
};

export function getBundleComponentSlugs(item: BundleLike) {
  const preview = item.preview as { productSlugs?: unknown } | null | undefined;
  const configured = Array.isArray(preview?.productSlugs)
    ? preview.productSlugs.filter(
        (slug): slug is string => typeof slug === "string" && slug.length > 0,
      )
    : [];

  if (configured.length) {
    return [...new Set(configured)].filter((slug) => slug !== item.slug);
  }

  return bundleDigitalComponents[item.slug] ?? [];
}

export function getBundleDigitalComponents(item: BundleLike) {
  return getBundleComponentSlugs(item);
}

export function isBundleProduct(
  product: Pick<Product, "type" | "category_slug">,
) {
  return product.type === "bundle" || product.category_slug === "bundles";
}

export function hasDigitalContent(item: BundleLike) {
  if (typeof item.has_digital_content === "boolean") {
    return item.has_digital_content;
  }
  if (item.type !== "physical") return true;
  return getBundleComponentSlugs(item).length > 0;
}
