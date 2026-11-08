import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Entitlement, Order, OrderItem, Product } from "@/lib/types";

export type EntitlementWithProduct = Entitlement & { product: Product | null };
export type OrderWithItems = Order & { order_items: OrderItem[] };

export const getAccountSnapshot = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();

  const [entitlementsResult, ordersResult] = await Promise.all([
    supabase
      .from("entitlements")
      .select("*")
      .eq("user_id", userId)
      .order("granted_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const entitlements = (entitlementsResult.data ?? []) as Entitlement[];
  const orders = (ordersResult.data ?? []) as OrderWithItems[];
  const productIds = entitlements
    .map((item) => item.product_id)
    .filter((id): id is string => Boolean(id));

  let products: Product[] = [];
  if (productIds.length) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);
    products = (data ?? []) as Product[];
  }

  const withProducts: EntitlementWithProduct[] = entitlements.map((item) => ({
    ...item,
    product: products.find((product) => product.id === item.product_id) ?? null,
  }));

  const activeOrders = orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status),
  );

  return {
    entitlements: withProducts,
    orders,
    libraryCount: withProducts.length,
    orderCount: orders.length,
    activeOrderCount: activeOrders.length,
  };
});
