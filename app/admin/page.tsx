import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  BookOpen,
  Megaphone,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";

import { RevenueChart } from "@/components/admin/revenue-chart";
import { ProductArt } from "@/components/product/product-art";
import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { orderStatusMeta } from "@/lib/order-status";
import type { Order, OrderItem, Product, Profile } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils";

type OrderWithItems = Order & { order_items: OrderItem[] };

export const dynamic = "force-dynamic";

function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function AdminOverviewPage() {
  const { profile, user } = await requireStaff("/admin");
  const supabase = createSupabaseAdminClient();

  const [ordersResult, productsResult, profilesResult, entitlementsResult, itemsResult] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("sort", { ascending: true }),
      supabase.from("profiles").select("id,role,created_at"),
      supabase.from("entitlements").select("id"),
      supabase.from("order_items").select("*"),
    ]);

  const orders = (ordersResult.data ?? []) as OrderWithItems[];
  const products = (productsResult.data ?? []) as Product[];
  const profiles = (profilesResult.data ?? []) as Pick<Profile, "id" | "role" | "created_at">[];
  const items = (itemsResult.data ?? []) as OrderItem[];

  const customers = profiles.filter((entry) => entry.role === "customer");
  const customerEmails = new Set(
    orders.map((order) => order.email.trim().toLowerCase()),
  );
  const activeOrders = orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status),
  );
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const today = new Date();
  const chartData = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (13 - index));
    const key = dayKey(date);
    const value = orders
      .filter((order) => dayKey(new Date(order.created_at)) === key)
      .reduce((sum, order) => sum + order.total, 0);
    return {
      label: new Intl.DateTimeFormat("en-BD", {
        day: "numeric",
        timeZone: "Asia/Dhaka",
      }).format(date),
      value,
    };
  });

  const topProducts = products
    .map((product) => {
      const quantity = items
        .filter((item) => item.slug === product.slug)
        .reduce((sum, item) => sum + item.quantity, 0);
      return { product, quantity };
    })
    .filter((entry) => entry.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  const lowStock = products
    .filter((product) => product.type === "physical")
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3);

  const stats = [
    {
      label: "Order value",
      value: formatMoney(revenue),
      note: `${orders.length} orders placed`,
      icon: Banknote,
      tone: "bg-teal text-cream",
    },
    {
      label: "Active orders",
      value: String(activeOrders.length),
      note: activeOrders.length ? "Being prepared right now" : "Everything settled",
      icon: ShoppingBag,
      tone: "bg-butter text-ink",
    },
    {
      label: "Customers",
      value: String(customerEmails.size),
      note: `${customers.length} registered account${customers.length === 1 ? "" : "s"}`,
      icon: Users,
      tone: "bg-lavender text-ink",
    },
    {
      label: "Digital access",
      value: String(entitlementsResult.data?.length ?? 0),
      note: "Library grants",
      icon: BookOpen,
      tone: "bg-coral text-cream",
    },
  ];

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const firstName = (profile?.full_name ?? user.email ?? "there").split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{greeting}, {firstName}</p>
          <h1 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.045em] text-ink sm:text-[2.8rem]">
            The studio,{" "}
            <span className="display-italic text-teal">at a glance.</span>
          </h1>
          <p className="mt-2 max-w-[34rem] text-[0.76rem] leading-relaxed text-muted">
            Orders, library access and the shelf — all in one calm view.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/promotions" className="btn btn-outline btn-sm">
            <Megaphone className="size-3.5" aria-hidden="true" />
            Edit promotions
          </Link>
          <Link href="/" className="btn btn-primary btn-sm">
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            View shop
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.2rem] border border-line bg-cream p-4">
            <div className="flex items-start justify-between">
              <span className={`grid size-8 place-items-center rounded-full ${stat.tone}`}>
                <stat.icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted">
                {stat.label}
              </span>
            </div>
            <p className="price mt-4 font-display text-[1.8rem] leading-none tracking-[-0.04em] text-ink">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[0.62rem] text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-[1.4rem] border border-line bg-cream p-5">
          <RevenueChart data={chartData} />
        </section>

        <section className="rounded-[1.4rem] border border-line bg-cream p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-muted">
                Moving fastest
              </p>
              <h2 className="mt-1 font-display text-[1.4rem] tracking-[-0.03em] text-ink">
                Top tools
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-teal"
            >
              All products
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {topProducts.length ? (
              topProducts.map(({ product, quantity }, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 font-display text-lg italic text-ink/25">
                    {index + 1}
                  </span>
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg">
                    <ProductArt product={product} showCaption={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.7rem] font-semibold text-ink">
                      {product.title}
                    </p>
                    <p className="text-[0.58rem] text-muted">{quantity} sold</p>
                  </div>
                  <span className="price text-[0.68rem] font-semibold text-ink-soft">
                    {formatMoney(product.price)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-[0.7rem] text-muted">
                Product movement will appear here.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-[1.4rem] border border-line bg-cream">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-muted">
                Latest orders
              </p>
              <h2 className="mt-1 font-display text-[1.4rem] tracking-[-0.03em] text-ink">
                Recent activity
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="group flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-teal"
            >
              All orders
              <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <thead>
                <tr className="border-b border-line text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-2.5 font-bold">Order</th>
                  <th className="px-3 py-2.5 font-bold">Customer</th>
                  <th className="px-3 py-2.5 font-bold">Status</th>
                  <th className="px-3 py-2.5 font-bold">Date</th>
                  <th className="px-5 py-2.5 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((order) => {
                  const meta = orderStatusMeta[order.status];
                  return (
                    <tr key={order.id} className="border-b border-line/70 last:border-0">
                      <td className="px-5 py-3 text-[0.68rem] font-semibold text-ink">
                        {order.order_number}
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-[0.66rem] font-medium text-ink-soft">
                          {order.customer_name}
                        </p>
                        <p className="text-[0.55rem] text-muted">{order.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.06em] ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[0.6rem] text-muted">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="price px-5 py-3 text-right text-[0.68rem] font-semibold text-ink">
                        {formatMoney(order.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!orders.length ? (
              <p className="px-5 py-8 text-center text-[0.7rem] text-muted">
                No orders yet. The shop is ready when your first customer is.
              </p>
            ) : null}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-[1.4rem] border border-line bg-cream p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-coral" aria-hidden="true" />
              <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-muted">
                Stock watch
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {lowStock.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2 transition-colors hover:border-line-strong"
                >
                  <div className="size-9 shrink-0 overflow-hidden rounded-md">
                    <ProductArt product={product} showCaption={false} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.66rem] font-semibold text-ink">
                      {product.title}
                    </p>
                    <p className="text-[0.55rem] text-muted">{product.format}</p>
                  </div>
                  <span className={`text-[0.6rem] font-bold ${product.stock < 25 ? "text-coral" : "text-ink-soft"}`}>
                    {product.stock} left
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.4rem] bg-teal p-5 text-cream">
            <div className="flex items-center gap-2 text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-butter-soft">
              <Package className="size-3" aria-hidden="true" />
              Store pulse
            </div>
            <p className="mt-3 font-display text-[1.7rem] leading-[1.08] tracking-[-0.03em]">
              {activeOrders.length} order{activeOrders.length === 1 ? "" : "s"} in motion.
            </p>
            <p className="mt-2 text-[0.66rem] leading-relaxed text-cream/85">
              Digital access is confirmed by hand. Keep an eye on the bKash
              queue during launch week.
            </p>
            <Link
              href="/admin/orders"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-butter-soft"
            >
              Open orders
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
