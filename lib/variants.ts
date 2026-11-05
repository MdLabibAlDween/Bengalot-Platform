import type { ProductVariant, SizeOption } from "@/lib/types";

export type { ProductVariant } from "@/lib/types";

export function variantKey(size: string, color: string) {
  return `${size.trim()}::${color.trim()}`;
}

export function normalizeVariants(value: unknown): ProductVariant[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `variant-${index + 1}`,
      size: String(item.size ?? "").trim(),
      color: String(item.color ?? "").trim(),
      stock: Math.max(0, Number(item.stock ?? 0)),
      sku: typeof item.sku === "string" ? item.sku.trim() : "",
      price:
        item.price === null || item.price === undefined || item.price === ""
          ? undefined
          : Math.max(0, Number(item.price)),
      compareAt:
        item.compareAt === null || item.compareAt === undefined || item.compareAt === ""
          ? undefined
          : Math.max(0, Number(item.compareAt)),
    }))
    .filter((item) => item.size && item.color);
}

export function hasVariants(variants: ProductVariant[] | undefined | null) {
  return Boolean(variants && variants.length > 0);
}

export function variantStock(
  variants: ProductVariant[] | undefined,
  size: string,
  color: string
) {
  if (!variants?.length) return null;
  const match = variants.find(
    (variant) => variant.size === size && variant.color === color
  );
  return match ? Math.max(0, Number(match.stock)) : 0;
}

export function colorStock(
  variants: ProductVariant[] | undefined,
  color: string
) {
  if (!variants?.length) return null;
  return variants
    .filter((variant) => variant.color === color)
    .reduce((sum, variant) => sum + Math.max(0, Number(variant.stock)), 0);
}

export function totalVariantStock(variants: ProductVariant[] | undefined) {
  return (variants ?? []).reduce(
    (sum, variant) => sum + Math.max(0, Number(variant.stock)),
    0
  );
}

export function aggregateSizesFromVariants(
  variants: ProductVariant[],
  sizes: SizeOption[] = []
) {
  const labels = new Set<string>([
    ...sizes.map((size) => size.label),
    ...variants.map((variant) => variant.size),
  ]);
  return [...labels].map((label) => ({
    label,
    stock: variants
      .filter((variant) => variant.size === label)
      .reduce((sum, variant) => sum + Math.max(0, Number(variant.stock)), 0),
  }));
}

export function applyVariantMovements(
  variants: ProductVariant[],
  movements: Map<string, number>,
  direction: 1 | -1
) {
  const next = variants.map((variant) => {
    const qty = movements.get(variantKey(variant.size, variant.color)) ?? 0;
    return {
      ...variant,
      stock: Math.max(0, Number(variant.stock) + direction * qty),
    };
  });
  const shortage = variants.find((variant) => {
    const qty = movements.get(variantKey(variant.size, variant.color)) ?? 0;
    return direction === -1 && qty > 0 && Number(variant.stock) < qty;
  });
  return { variants: next, shortage };
}
