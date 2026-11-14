import "server-only";

import { getBundleComponentSlugs } from "@/lib/bundles";
import { productResource } from "@/lib/product-media";
import { getResourceLink } from "@/lib/resource-links";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  format: string;
  price: number;
  stock: number;
  preview?: Record<string, unknown> | null;
};

type OrderItemRow = {
  slug: string;
  title: string;
  type: string;
};

/**
 * Grants library access for every digital product in an order, including the
 * digital components of a physical bundle. Safe to call more than once.
 */
export async function grantOrderEntitlements({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string | null;
}) {
  if (!userId) return 0;

  const supabase = createSupabaseAdminClient();
  const { data: itemRows, error: itemError } = await supabase
    .from("order_items")
    .select("slug,title,type")
    .eq("order_id", orderId);

  if (itemError) throw itemError;
  const items = (itemRows ?? []) as OrderItemRow[];
  if (!items.length) return 0;

  const slugs = [...new Set(items.map((item) => item.slug))];
  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select("id,slug,title,type,format,price,stock,preview")
    .in("slug", slugs);

  if (productError) throw productError;
  const products = (productRows ?? []) as ProductRow[];

  const componentSlugs = [
    ...new Set(
      products.flatMap((product) =>
        getBundleComponentSlugs({
          slug: product.slug,
          type: product.type,
          preview: product.preview,
        }),
      ),
    ),
  ];

  let componentProducts: ProductRow[] = [];
  if (componentSlugs.length) {
    const { data, error } = await supabase
      .from("products")
      .select("id,slug,title,type,format,price,stock,preview")
      .in("slug", componentSlugs)
      .eq("is_published", true);

    if (error) throw error;
    componentProducts = (data ?? []) as ProductRow[];
  }

  const digitalTargets = [
    ...products.filter(
      (product) => product.type === "digital" || product.type === "bundle",
    ),
    ...componentProducts.filter(
      (product) => product.type === "digital" || product.type === "bundle",
    ),
  ];
  const uniqueTargets = [
    ...new Map(digitalTargets.map((product) => [product.id, product])).values(),
  ];

  if (!uniqueTargets.length) return 0;

  const { error: entitlementError } = await supabase.from("entitlements").upsert(
    uniqueTargets.map((product) => {
      const uploaded = productResource(product);
      const resource = uploaded ?? getResourceLink(product.slug);
      return {
        user_id: userId,
        product_id: product.id,
        order_id: orderId,
        title: product.title,
        access_label: uploaded?.label ?? resource.label,
        access_url: uploaded?.url ?? (resource.url || null),
      };
    }),
    { onConflict: "user_id,product_id", ignoreDuplicates: true },
  );

  if (entitlementError) throw entitlementError;
  return uniqueTargets.length;
}

/**
 * Decrements stock for physical lines. Used after a ZiniPay payment is
 * confirmed, so abandoned payments never reserve stock.
 */
export async function decrementOrderStock(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id,quantity,type")
    .eq("order_id", orderId);

  if (error) throw error;

  const physical = (data ?? []).filter(
    (item) => item.type === "physical" && item.product_id,
  );

  for (const item of physical) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .maybeSingle();
    if (!product) continue;
    await supabase
      .from("products")
      .update({
        stock: Math.max(0, Number(product.stock) - Number(item.quantity)),
      })
      .eq("id", item.product_id);
  }
}
