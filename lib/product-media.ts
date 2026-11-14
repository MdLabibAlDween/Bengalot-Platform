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

export type ProductResource = {
  url: string;
  label: string;
};

/**
 * A digital product's delivery PDF (usually explains how to open the Notion
 * template or download the file). Stored in `preview.resource`.
 */
export function productResource(product: {
  preview?: Product["preview"] | Record<string, unknown> | null;
}): ProductResource | null {
  const preview = product.preview as { resource?: unknown } | null | undefined;
  const resource = preview?.resource;
  if (!resource || typeof resource !== "object") return null;
  const value = resource as { url?: unknown; label?: unknown };
  if (typeof value.url !== "string" || !value.url.startsWith("https://")) {
    return null;
  }
  return {
    url: value.url,
    label:
      typeof value.label === "string" && value.label.trim()
        ? value.label.trim()
        : "Download the PDF guide",
  };
}
