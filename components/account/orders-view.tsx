"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/brand/product-art";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountHeading } from "./account-heading";
import { getProduct } from "@/lib/data";
import { productColorPalette } from "@/lib/theme";
import { getLocalOrders } from "@/lib/order-store";
import { useCart } from "@/lib/providers";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_META } from "@/lib/constants";
import { cn, formatBDT, formatDate } from "@/lib/utils";

const filters = ["All", "Active", "Delivered", "Cancelled"] as const;
type Filter = (typeof filters)[number];

export function OrdersView() {
  const { addLine, openCart } = useCart();
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const local = getLocalOrders();
    setLocalOrders(local);
    setLoaded(true);

    void fetch("/api/account/orders", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        if (!active || !Array.isArray(data.orders)) return;
        const merged = new Map<string, Order>();
        for (const order of [...local, ...(data.orders as Order[])]) {
          merged.set(order.orderNo, order);
        }
        setLocalOrders(
          [...merged.values()].sort(
            (a, b) => +new Date(b.date) - +new Date(a.date)
          )
        );
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const orders = useMemo(
    () => localOrders,
    [localOrders]
  );

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const matchesFilter =
          filter === "All" ||
          (filter === "Active" &&
            ["Pending", "Confirmed", "Processing", "Handed to Courier", "In Transit"].includes(
              order.status
            )) ||
          (filter === "Delivered" && order.status === "Delivered") ||
          (filter === "Cancelled" &&
            ["Cancelled", "Returning", "Returned", "Failed Delivery", "Refunded"].includes(order.status));
        const matchesQuery =
          !query || order.orderNo.toLowerCase().includes(query.toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [orders, filter, query]
  );

  const reorder = (order: Order) => {
    let added = 0;
    let skippedDemo = 0;
    order.items.forEach((item) => {
      const product = getProduct(item.productSlug);
      if (!product) return;
      if (product.isDemo) {
        skippedDemo += 1;
        return;
      }
      addLine(
        {
          productSlug: item.productSlug,
          size: item.size,
          color: item.color,
          qty: item.qty,
          snapshot: product,
        },
        { silent: true }
      );
      added += 1;
    });
    if (skippedDemo > 0) {
      toast.error("Demo products were skipped", {
        description: "Ordering is disabled for demo listings.",
      });
    }
    if (added > 0) {
      toast.success("Added to your bag", {
        description: `${order.orderNo} reordered.`,
      });
      openCart();
    }
  };

  return (
    <div>
      <AccountHeading
        eyebrow="Your history"
        title="My orders"
        description="Everything you have ordered, from the first piece to the latest. Track, reorder or start a return in a few taps."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[0.6rem] font-semibold transition",
                filter === item
                  ? "border-midnight bg-midnight text-ivory"
                  : "border-[var(--border)] text-muted-foreground hover:border-[var(--line-strong)] hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order number"
            className="h-9 pl-9 text-[0.7rem]"
            aria-label="Search orders"
          />
        </div>
      </div>

      {!loaded ? (
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-5 space-y-3">
          {filtered.map((order) => {
            const meta = ORDER_STATUS_META[order.status];
            return (
              <div
                key={order.orderNo}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <p className="text-[0.78rem] font-semibold">{order.orderNo}</p>
                      <p className="text-[0.56rem] text-muted-foreground">
                        Placed {formatDate(order.date)} · {order.payment}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[0.48rem] font-bold uppercase tracking-[0.08em]",
                        meta?.tone
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[0.8rem] font-semibold tabular-nums">
                    {formatBDT(order.total)}
                  </p>
                </div>
                <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
                  <div className="flex flex-1 items-center gap-3 overflow-x-auto">
                    {order.items.map((item, index) => {
                      const product = getProduct(item.productSlug);
                      const colorHex = product?.colors.find(
                        (color) => color.name === item.color
                      )?.hex;
                      return (
                        <div
                          key={`${item.productSlug}-${index}`}
                          className="h-[76px] w-[58px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)]"
                        >
                          {product && (
                            <ProductArt
                              id={`orders-${order.orderNo}-${index}`}
                              art={product.art}
                              paletteOverride={
                                colorHex ? productColorPalette(colorHex) : undefined
                              }
                              colorName={item.color}
                              showCaption={false}
                              showMonogram={false}
                            />
                          )}
                        </div>
                      );
                    })}
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-[0.72rem] font-medium">
                        {order.items.map((i) => i.name).join(", ")}
                      </p>
                      <p className="mt-1 text-[0.58rem] text-muted-foreground">
                        {order.items.reduce((sum, i) => sum + i.qty, 0)}{" "}
                        {order.items.reduce((sum, i) => sum + i.qty, 0) === 1 ? "item" : "items"}{" "}
                        · Delivered to {order.district}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {["Pending", "Confirmed", "Processing", "Handed to Courier", "In Transit"].includes(
                      order.status
                    ) && (
                      <Link
                        href={`/track?order=${encodeURIComponent(order.orderNo)}&phone=${order.phone}`}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-[0.54rem] font-bold uppercase tracking-[0.08em] transition hover:border-gold hover:text-gold"
                      >
                        <Truck className="h-3 w-3" /> Track
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => reorder(order)}
                      className="flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-[0.54rem] font-bold uppercase tracking-[0.08em] transition hover:border-gold hover:text-gold"
                    >
                      <RefreshCw className="h-3 w-3" /> Reorder
                    </button>
                    <Link
                      href={`/account/orders/${order.orderNo}`}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-midnight px-3.5 text-[0.54rem] font-bold uppercase tracking-[0.08em] text-ivory transition hover:bg-royal"
                    >
                      Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--line-strong)] py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-gold/70" strokeWidth={1.3} />
          <p className="mt-3 font-display text-2xl">No orders here yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-[0.74rem] leading-relaxed text-muted-foreground">
            {query
              ? "No order matches that number. Try a different search."
              : "When you place an order, it will appear here with tracking and easy reordering."}
          </p>
          <Button asChild variant="gold" className="mt-5">
            <Link href="/collections/new-arrivals">
              Start with the new collection <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
