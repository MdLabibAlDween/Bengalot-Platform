import { getProduct } from "./data";
import type { CartLine, Product } from "./types";

/**
 * Resolve a cart line to a product. Static catalogue rows are the fallback for
 * older carts, while the snapshot keeps admin-created products and current
 * demo flags available on the client.
 */
export function productForLine(line: CartLine): Product | undefined {
  const base = getProduct(line.productSlug);
  const snapshot = line.snapshot;
  if (!base && !snapshot) return undefined;
  const product = !snapshot
    ? base!
    : {
        ...(base ?? snapshot),
        ...snapshot,
        isDemo: snapshot.isDemo ?? base?.isDemo ?? false,
      };
  const variant = product.variants?.find(
    (item) => item.size === line.size && item.color === line.color
  );
  if (!variant) return product;
  return {
    ...product,
    price: variant.price ?? product.price,
    compareAt: variant.compareAt ?? product.compareAt,
    sku: variant.sku || product.sku,
  };
}

export function lineIsDemo(line: CartLine) {
  return Boolean(productForLine(line)?.isDemo);
}
