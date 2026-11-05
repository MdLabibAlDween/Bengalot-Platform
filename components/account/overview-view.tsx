"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Gift,
  Heart,
  Package,
  Truck,
} from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { ProductCard } from "@/components/storefront/product-card";
import { AccountHeading } from "./account-heading";
import { getProduct, products } from "@/lib/data";
import { productColorPalette } from "@/lib/theme";
import { getLocalOrders } from "@/lib/order-store";
import { useWishlist } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_META, WHATSAPP_LINK } from "@/lib/constants";
import { STORE_SETTINGS } from "@/lib/settings";
import { cn, formatBDT, formatDate } from "@/lib/utils";

const progressSteps = ["Order Placed", "Confirmed", "Processing", "Handed to Courier", "In Transit", "Delivered"];

export function AccountOverview() {
  const wishlist = useWishlist();
  const { rewardsEnabled } = useSiteConfig();
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [points, setPoints] = useState(0);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (rewardsEnabled) {
      void fetch("/api/account/rewards", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) return;
          const data = await response.json().catch(() => ({}));
          if (typeof data.points === "number") setPoints(data.points);
        })
        .catch(() => undefined);
    }
    void fetch("/api/account/notifications", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        if (typeof data.unread === "number") setUnread(data.unread);
      })
      .catch(() => undefined);
  }, [rewardsEnabled]);

  useEffect(() => {
    let active = true;
    const local = getLocalOrders();
    setLocalOrders(local);
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

  const orders = localOrders;
  const active =
    orders.find((order) =>
      ["Pending", "Confirmed", "Processing", "Handed to Courier", "In Transit"].includes(order.status)
    ) ?? orders[0];
  const activeStep = progressSteps.indexOf(active?.status ?? "Order Placed");
  const recommended = products
    .filter((p) => p.sets.includes("best") || p.sets.includes("new"))
    .slice(0, 4);

  return (
    <div>
      <AccountHeading
        eyebrow="Your house"
        title="Welcome back."
        description="A clear overview of your orders and saved pieces."
        action={
          <Link
            href="/account/orders"
            className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] transition hover:border-gold hover:text-gold"
          >
            All orders <ArrowUpRight className="h-3 w-3" />
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total orders", value: String(orders.length), icon: Package, href: "/account/orders" },
          { label: "Saved pieces", value: String(wishlist.count), icon: Heart, href: "/account/wishlist" },
          ...(rewardsEnabled
            ? [{ label: "Reward points", value: points.toLocaleString("en-US"), icon: Gift, href: "/account/rewards" }]
            : []),
          { label: "Unread updates", value: String(unread), icon: Bell, href: "/account/notifications" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-gold"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gold/[0.08] text-gold">
                <stat.icon className="h-4 w-4" strokeWidth={1.7} />
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 transition group-hover:text-gold" />
            </div>
            <p className="mt-3 font-display text-[1.8rem] leading-none">{stat.value}</p>
            <p className="mt-1 text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Active order */}
      {active && (
        <div className="mt-4 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-jade/10 text-jade">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <p className="flex flex-wrap items-center gap-2 text-[0.78rem] font-semibold">
                  {active.status === "Delivered" ? "Your latest order" : "Your order is on the way"}
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[0.48rem] font-bold uppercase tracking-[0.1em] text-[0.78rem]">
                    {active.status}
                  </span>
                </p>
                <p className="mt-0.5 text-[0.58rem] text-muted-foreground">
                  {active.orderNo} · placed {formatDate(active.date)} · {active.items.length}{" "}
                  {active.items.length === 1 ? "piece" : "pieces"}
                </p>
              </div>
            </div>
            <Link
              href={`/account/orders/${active.orderNo}`}
              className="flex items-center gap-1.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-gold"
            >
              View order <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-[1fr_260px]">
            <div>
              <div className="flex items-center gap-2 overflow-x-auto">
                {progressSteps.slice(0, 5).map((step, index) => (
                  <div key={step} className="flex flex-1 items-center gap-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.45rem] font-bold",
                          index <= activeStep
                            ? "border-jade bg-jade text-white"
                            : "border-[var(--border)] bg-[var(--surface)] text-muted-foreground"
                        )}
                      >
                        {index <= activeStep ? "✓" : index + 1}
                      </span>
                      <span className="whitespace-nowrap text-[0.46rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        {step === "Order Placed"
                          ? "Placed"
                          : step === "Handed to Courier"
                            ? "Courier"
                            : step === "In Transit"
                              ? "In transit"
                              : step}
                      </span>
                    </div>
                    {index < 4 && (
                      <span
                        className={cn(
                          "mb-5 h-px flex-1",
                          index < activeStep ? "bg-jade/50" : "bg-[var(--border)]"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/track?order=${encodeURIComponent(active.orderNo)}&phone=${active.phone}`}
                  className="flex h-9 items-center gap-2 rounded-full bg-midnight px-4 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-ivory transition hover:bg-royal"
                >
                  Track order <Truck className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[0.6rem] text-muted-foreground">
                  Delivery timing is confirmed when your order is dispatched.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              {active.items.slice(0, 3).map((item, index) => {
                const product = getProduct(item.productSlug);
                const colorHex = product?.colors.find(
                  (color) => color.name === item.color
                )?.hex;
                return (
                  <div
                    key={`${item.productSlug}-${index}`}
                    className="h-[82px] w-[64px] overflow-hidden rounded-lg border border-[var(--border)]"
                  >
                    {product && (
                      <ProductArt
                        id={`overview-${product.slug}-${index}`}
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
              <div className="hidden text-right sm:block">
                <p className="text-[0.55rem] uppercase tracking-[0.1em] text-muted-foreground">
                  Order total
                </p>
                <p className="mt-1 font-semibold tabular-nums">{formatBDT(active.total)}</p>
                <p className="text-[0.55rem] text-muted-foreground">{active.payment}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Recent orders */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold">
                Recent orders
              </p>
              <h3 className="mt-1 font-display text-xl">Your last pieces.</h3>
            </div>
            <Link
              href="/account/orders"
              className="text-[0.54rem] font-bold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-gold"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {orders.slice(0, 4).map((order) => {
              const meta = ORDER_STATUS_META[order.status];
              return (
                <Link
                  key={order.orderNo}
                  href={`/account/orders/${order.orderNo}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-[var(--muted)]/30"
                >
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 2).map((item, index) => {
                      const product = getProduct(item.productSlug);
                      const colorHex = product?.colors.find(
                        (color) => color.name === item.color
                      )?.hex;
                      return (
                        <span
                          key={index}
                          className="h-10 w-8 overflow-hidden rounded border-2 border-[var(--surface)]"
                        >
                          {product && (
                            <ProductArt
                              id={`ov-row-${order.orderNo}-${index}`}
                              art={product.art}
                              paletteOverride={
                                colorHex ? productColorPalette(colorHex) : undefined
                              }
                              colorName={item.color}
                              showCaption={false}
                              showMonogram={false}
                            />
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.7rem] font-semibold">{order.orderNo}</p>
                    <p className="text-[0.56rem] text-muted-foreground">
                      {formatDate(order.date)} · {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]",
                      meta?.tone
                    )}
                  >
                    {order.status}
                  </span>
                  <span className="hidden text-[0.7rem] font-semibold tabular-nums sm:block">
                    {formatBDT(order.total)}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40 transition group-hover:text-gold" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* At your service */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
              At your service
            </p>
            <h3 className="mt-2 font-display text-2xl">Need a hand?</h3>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-muted-foreground">
              Questions about an order, a size or a piece? Send us a message and we will
              help.
            </p>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-full bg-[var(--color-jade)] px-4 text-xs font-bold uppercase tracking-[0.1em] text-white"
          >
            WhatsApp us <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-indigo">Picked for you</p>
            <h3 className="display-4 mt-2">A few things we think you&apos;ll like.</h3>
          </div>
          <Link
            href="/collections/new-arrivals"
            className="hidden items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-gold sm:flex"
          >
            Keep exploring <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {recommended.map((product) => (
            <ProductCard key={product.slug} product={product} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
