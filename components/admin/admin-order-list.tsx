"use client";

import { MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { orderStatusMeta } from "@/lib/order-status";
import { paymentMethodLabel } from "@/lib/payment-labels";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";
import { cn, formatDate, formatMoney } from "@/lib/utils";

type OrderWithItems = Order & { order_items: OrderItem[] };

const filters: { value: "all" | OrderStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function AdminOrderList({ orders }: { orders: OrderWithItems[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!needle) return true;
      return `${order.order_number} ${order.customer_name} ${order.email} ${order.phone}`
        .toLowerCase()
        .includes(needle);
    });
  }, [orders, query, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="admin-order-search" className="sr-only">
            Search orders
          </label>
          <input
            id="admin-order-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Order number, name, phone…"
            className="field !min-h-9 !py-1.5 !pl-9 !text-[0.76rem]"
          />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1.5 text-[0.6rem] font-bold transition-colors",
                filter === item.value
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-surface text-ink-soft hover:border-ink/30",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted lg:ml-auto">
          {filtered.length} orders
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {filtered.map((order) => {
          const meta = orderStatusMeta[order.status];
          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-[1.2rem] border border-line bg-cream"
            >
              <div className="flex flex-col gap-3 border-b border-line bg-paper px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <p className="text-[0.7rem] font-bold text-ink">{order.order_number}</p>
                    <p className="text-[0.55rem] text-muted">
                      {formatDate(order.created_at)} · {order.order_items.length}{" "}
                      {order.order_items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="price text-[0.92rem] font-semibold text-ink">
                    {formatMoney(order.total)}
                  </span>
                  <span className="rounded-full bg-surface px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.06em] text-muted">
                    {order.payment_status}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 px-4 py-4 lg:grid-cols-[0.8fr_1.1fr_1fr]">
                <div>
                  <p className="text-[0.5rem] font-bold uppercase tracking-[0.1em] text-muted">
                    Customer
                  </p>
                  <p className="mt-1 text-[0.7rem] font-semibold text-ink">
                    {order.customer_name}
                  </p>
                  <p className="mt-0.5 text-[0.58rem] text-muted">{order.email}</p>
                  <p className="text-[0.58rem] text-muted">{order.phone}</p>
                </div>

                <div>
                  <p className="text-[0.5rem] font-bold uppercase tracking-[0.1em] text-muted">
                    Items
                  </p>
                  <ul className="mt-1 space-y-1">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3">
                        <span className="text-[0.62rem] text-ink-soft">
                          {item.title}{" "}
                          <span className="text-muted">× {item.quantity}</span>
                        </span>
                        <span className="price shrink-0 text-[0.6rem] text-muted">
                          {formatMoney(item.line_total)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-between gap-2">
                  <div>
                    <p className="text-[0.5rem] font-bold uppercase tracking-[0.1em] text-muted">
                      Delivery
                    </p>
                    <p className="mt-1 text-[0.62rem] leading-relaxed text-ink-soft">
                      {order.address}, {order.city}, {order.district}
                    </p>
                    {order.notes ? (
                      <p className="mt-1 text-[0.58rem] italic text-muted">“{order.notes}”</p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.56rem] text-muted">
                      {paymentMethodLabel(order.payment_method)} · {meta.label}
                    </span>
                    <a
                      href={`https://wa.me/88${order.phone.replace(/^0/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.54rem] font-bold text-ink-soft transition-colors hover:border-teal hover:text-teal"
                    >
                      <MessageCircle className="size-3" aria-hidden="true" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!filtered.length ? (
        <div className="mt-3 rounded-[1.2rem] border border-dashed border-line-strong bg-cream px-6 py-14 text-center">
          <p className="font-display text-xl text-ink">No orders match.</p>
          <p className="mt-1 text-[0.7rem] text-muted">
            Try another status or clear the search.
          </p>
        </div>
      ) : null}
    </div>
  );
}
