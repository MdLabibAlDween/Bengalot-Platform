import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  aggregateSizesFromVariants,
  variantKey,
  type ProductVariant,
} from "@/lib/variants";

type StockItem = { productSlug: string; size: string; color?: string; qty: number };
type Payload = {
  sizes?: { label: string; stock: number }[];
  variants?: ProductVariant[];
  [key: string]: unknown;
};

/**
 * Adjust catalogue stock for an order movement.
 * `-1` sells stock, `+1` restores it for a cancelled/returned order.
 */
export async function adjustStock(
  admin: SupabaseClient,
  items: StockItem[],
  direction: 1 | -1
) {
  if (items.length === 0) return { ok: true as const };

  const grouped = new Map<
    string,
    { sizes: Map<string, number>; variants: Map<string, number>; total: number }
  >();
  for (const item of items) {
    const current = grouped.get(item.productSlug) ?? {
      sizes: new Map<string, number>(),
      variants: new Map<string, number>(),
      total: 0,
    };
    current.sizes.set(item.size, (current.sizes.get(item.size) ?? 0) + item.qty);
    if (item.color) {
      const key = variantKey(item.size, item.color);
      current.variants.set(key, (current.variants.get(key) ?? 0) + item.qty);
    }
    current.total += item.qty;
    grouped.set(item.productSlug, current);
  }

  const { data: rows, error } = await admin
    .from("products")
    .select("id,slug,name,stock,payload")
    .in("slug", [...grouped.keys()]);
  if (error) return { ok: false as const, error: error.message };

  const bySlug = new Map((rows ?? []).map((row) => [row.slug, row]));
  const applied: { id: string; stock: number; payload: Record<string, unknown> | null }[] = [];
  const rollback = async () => {
    for (const previous of applied) {
      await admin
        .from("products")
        .update({ stock: previous.stock, payload: previous.payload })
        .eq("id", previous.id);
    }
  };

  for (const [slug, movement] of grouped) {
    const row = bySlug.get(slug);
    if (!row) {
      if (direction === 1) continue;
      await rollback();
      return { ok: false as const, error: `A product in this order no longer exists.` };
    }
    const payload = (row.payload ?? {}) as Payload;
    const sizes = Array.isArray(payload.sizes) ? payload.sizes : [];
    const variants = Array.isArray(payload.variants) ? payload.variants : [];

    if (variants.length > 0) {
      for (const [key, qty] of movement.variants) {
        const [size, color] = key.split("::");
        const variant = variants.find(
          (option) => option.size === size && option.color === color
        );
        if (!variant) {
          if (direction === 1) continue;
          await rollback();
          return {
            ok: false as const,
            error: `Variant ${size} / ${color} no longer exists for ${row.name}.`,
          };
        }
        if (direction === -1 && Number(variant.stock) < qty) {
          await rollback();
          return {
            ok: false as const,
            error: `Not enough stock for ${row.name} (${size} · ${color}).`,
          };
        }
      }
      const nextVariants = variants.map((variant) => {
        const qty = movement.variants.get(variantKey(variant.size, variant.color)) ?? 0;
        return {
          ...variant,
          stock: Math.max(0, Number(variant.stock) + direction * qty),
        };
      });
      const nextSizes = aggregateSizesFromVariants(nextVariants, sizes);
      const nextStock = nextVariants.reduce(
        (sum, variant) => sum + Math.max(0, Number(variant.stock)),
        0
      );
      const nextPayload = {
        ...(payload as Record<string, unknown>),
        stock: nextStock,
        sizes: nextSizes,
        variants: nextVariants,
      };
      const { data: updated, error: updateError } = await admin
        .from("products")
        .update({ stock: nextStock, payload: nextPayload })
        .eq("id", row.id)
        .eq("stock", row.stock)
        .select("id");
      if (updateError) {
        await rollback();
        return { ok: false as const, error: updateError.message };
      }
      if (!updated?.length) {
        await rollback();
        return {
          ok: false as const,
          error: `${row.name} stock changed. Please try again.`,
        };
      }
      applied.push({ id: row.id, stock: row.stock, payload: row.payload });
      continue;
    }

    for (const [label, qty] of movement.sizes) {
      const size = sizes.find((option) => option.label === label);
      if (!size) {
        if (direction === 1) continue;
        await rollback();
        return {
          ok: false as const,
          error: `Size ${label} no longer exists for ${row.name}.`,
        };
      }
      if (direction === -1 && Number(size.stock) < qty) {
        await rollback();
        return {
          ok: false as const,
          error: `Not enough stock for ${row.name} (${label}).`,
        };
      }
    }
    if (sizes.length === 0 && direction === -1 && Number(row.stock) < movement.total) {
      await rollback();
      return { ok: false as const, error: `${row.name} is out of stock.` };
    }

    const nextSizes = sizes.map((size) => ({
      ...size,
      stock: Math.max(
        0,
        Number(size.stock) + direction * (movement.sizes.get(size.label) ?? 0)
      ),
    }));
    const nextStock = Math.max(0, Number(row.stock) + direction * movement.total);
    const nextPayload = {
      ...(payload as Record<string, unknown>),
      stock: nextStock,
      ...(sizes.length > 0 ? { sizes: nextSizes } : {}),
    };

    const { data: updated, error: updateError } = await admin
      .from("products")
      .update({ stock: nextStock, payload: nextPayload })
      .eq("id", row.id)
      .eq("stock", row.stock)
      .select("id");
    if (updateError) {
      await rollback();
      return { ok: false as const, error: updateError.message };
    }
    if (!updated?.length) {
      await rollback();
      return {
        ok: false as const,
        error: `${row.name} stock changed. Please try again.`,
      };
    }
    applied.push({ id: row.id, stock: row.stock, payload: row.payload });
  }

  return { ok: true as const };
}
