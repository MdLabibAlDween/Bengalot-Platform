import {
  ArrowRight,
  Banknote,
  Check,
  MapPin,
  Package,
  Smartphone,
  TicketPercent,
  Truck,
} from "lucide-react";
import Link from "next/link";

import { ProductArt } from "@/components/product/product-art";
import { requireUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/account";
import { hasDigitalContent } from "@/lib/bundles";
import { getCatalog } from "@/lib/data/catalog";
import { paymentMethodLabel } from "@/lib/payment-labels";
import { orderStatusMeta, orderTimeline } from "@/lib/order-status";
import { formatDate, formatMoney } from "@/lib/utils";

export default async function OrdersPage() {
  const { user } = await requireUser("/account/orders");
  const [snapshot, catalog] = await Promise.all([
    getAccountSnapshot(user.id),
    getCatalog(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Order history</p>
          <h2 className="mt-2 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-ink sm:text-[2.6rem]">
            Everything in motion.
          </h2>
          <p className="mt-3 max-w-[34rem] text-[0.8rem] leading-[1.7] text-muted">
            A clear record of what you have ordered, what is on the way and what
            is already part of your library.
          </p>
        </div>
        <span className="chip">
          {snapshot.orderCount} {snapshot.orderCount === 1 ? "order" : "orders"}
        </span>
      </div>

      {snapshot.orders.length ? (
        <div className="space-y-4">
          {snapshot.orders.map((order) => {
            const meta = orderStatusMeta[order.status];
            const hasPhysical = order.order_items.some(
              (item) => item.type === "physical",
            );
            const hasDigital =
              order.order_items.some((item) => hasDigitalContent(item)) ||
              snapshot.entitlements.some(
                (entitlement) => entitlement.order_id === order.id,
              );
            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-[1.4rem] border border-line bg-cream"
              >
                <div className="flex flex-col gap-4 border-b border-line bg-paper px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-cream text-teal shadow-sm">
                      {hasPhysical ? (
                        <Truck className="size-4.5" aria-hidden="true" />
                      ) : (
                        <Package className="size-4.5" aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <p className="font-display text-[1.2rem] leading-none tracking-[-0.02em] text-ink">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-[0.62rem] text-muted">
                        Placed {formatDate(order.created_at)} ·{" "}
                        {order.order_items.length}{" "}
                        {order.order_items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.09em] ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 sm:text-right">
                    <div>
                      <p className="price font-display text-[1.35rem] leading-none tracking-[-0.03em] text-ink">
                        {formatMoney(order.total)}
                      </p>
                      <p className="mt-1 text-[0.58rem] uppercase tracking-[0.08em] text-muted">
                        {paymentMethodLabel(order.payment_method)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5">
                  {order.status !== "cancelled" ? (
                    <div className="mb-5">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-line" />
                        <div
                          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-teal transition-all"
                          style={{
                            width: `${((meta.step - 1) / (orderTimeline.length - 1)) * 100}%`,
                          }}
                        />
                        {orderTimeline.map((step, index) => {
                          const reached = index < meta.step;
                          return (
                            <div
                              key={step}
                              className="relative z-10 flex flex-col items-center gap-1.5"
                            >
                              <span
                                className={`grid size-5 place-items-center rounded-full border-2 border-cream ${
                                  reached ? "bg-teal text-cream" : "bg-sand text-muted"
                                }`}
                              >
                                {reached ? (
                                  <Check className="size-2.5" aria-hidden="true" />
                                ) : (
                                  <span className="size-1 rounded-full bg-current" />
                                )}
                              </span>
                              <span
                                className={`text-[0.52rem] font-semibold ${
                                  reached ? "text-ink" : "text-muted"
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-center text-[0.65rem] text-muted">
                        {meta.description}
                      </p>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="flex flex-wrap gap-2">
                      {order.order_items.map((item) => {
                        const product = catalog.products.find(
                          (entry) => entry.slug === item.slug,
                        );
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2 pr-3"
                          >
                            <div className="size-10 shrink-0 overflow-hidden rounded-lg">
                              {product ? (
                                <ProductArt product={product} showCaption={false} />
                              ) : (
                                <div className="h-full w-full bg-sand" />
                              )}
                            </div>
                            <div>
                              <p className="text-[0.66rem] font-semibold text-ink">
                                {item.title}
                              </p>
                              <p className="text-[0.55rem] text-muted">
                                {item.quantity} × {formatMoney(item.unit_price)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {hasDigital ? (
                        <Link href="/account/library" className="btn btn-primary btn-sm">
                          <Package className="size-3.5" aria-hidden="true" />
                          Library
                        </Link>
                      ) : (
                        <a
                          href={`https://wa.me/8801341739202?text=${encodeURIComponent(`Hello Bengalot, I would like an update on ${order.order_number}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          Track order
                        </a>
                      )}
                      <a
                        href={`https://wa.me/8801341739202?text=${encodeURIComponent(`Hello Bengalot, I have a question about ${order.order_number}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        Support
                        <ArrowRight className="size-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[0.58rem] text-muted">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3" aria-hidden="true" />
                      {order.address}, {order.city}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {order.payment_method === "cod" ? (
                        <Banknote className="size-3" aria-hidden="true" />
                      ) : (
                        <Smartphone className="size-3" aria-hidden="true" />
                      )}
                      {paymentMethodLabel(order.payment_method)} ·{" "}
                      {order.payment_status}
                    </span>
                    {hasPhysical ? (
                      <span className="flex items-center gap-1.5">
                        <Truck className="size-3" aria-hidden="true" />
                        Delivery ৳{order.delivery_fee}
                      </span>
                    ) : null}
                    {order.discount > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <TicketPercent className="size-3" aria-hidden="true" />
                        Promo −৳{order.discount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-line-strong bg-cream px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-butter-soft text-ink">
            <Package className="size-6" aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-[1.8rem] tracking-[-0.03em] text-ink">
            No orders yet.
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[0.78rem] leading-relaxed text-muted">
            When you order a printed deck or a digital tool, it will appear here
            with a clear status.
          </p>
          <Link href="/shop" className="btn btn-primary mt-6">
            Explore the shop
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
