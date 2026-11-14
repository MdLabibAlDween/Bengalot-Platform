import type { Product } from "@/lib/types";

/**
 * Product photos live in `preview.images` — an array of public URLs uploaded
 * through the studio. The first entry is the cover. The original SVG artwork
 * is used as the fallback wherever no photo has been uploaded yet.
 */
export function productImages(product: {
  preview?: Product["preview"] | Record<string, unknown> | null;
}): string[] {
  const preview = product.preview as { images?: unknown } | null | undefined;
  if (!Array.isArray(preview?.images)) return [];
  return preview.images.filter(
    (url): url is string =>
      typeof url === "string" &&
      url.startsWith("https://") &&
      url.length < 2048,
  );
}

export function productCoverImage(product: {
  preview?: Product["preview"] | Record<string, unknown> | null;
}) {
  return productImages(product)[0] ?? null;
}
