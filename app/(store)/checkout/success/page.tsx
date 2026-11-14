import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  MessageCircle,
  PackageCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { RetryZinipayButton } from "@/components/checkout/retry-zinipay-button";
import { paymentMethodLabel } from "@/lib/payment-labels";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ order?: string; payment?: string }>;
};

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { order: orderNumber, payment } = await searchParams;
  if (!orderNumber) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) notFound();

  const typedOrder = order as Order;
  const [cookieStore, current, itemsResult, entitlementResult] = await Promise.all([
    cookies(),
    getCurrentUser(),
    supabase.from("order_items").select("*").eq("order_id", typedOrder.id),
    supabase
      .from("entitlements")
      .select("id")
      .eq("order_id", typedOrder.id)
      .limit(1),
  ]);

  const cookieOrderId = cookieStore.get("bengalot-order-access")?.value;
  const ownsOrder = Boolean(
    current?.user && typedOrder.user_id === current.user.id,
  );
  const isStaff = Boolean(
    current?.profile && STAFF_ROLES.has(current.profile.role),
  );

  if (cookieOrderId !== typedOrder.id && !ownsOrder && !isStaff) {
    notFound();
  }

  const typedItems = (itemsResult.data ?? []) as OrderItem[];
  const hasPhysical = typedItems.some((item) => item.type === "physical");
  const hasDigital =
    typedItems.some((item) => item.type !== "physical") ||
    Boolean(entitlementResult.data?.length);
  const isZinipay = typedOrder.payment_method === "zinipay";
  const paymentPending = isZinipay && typedOrder.payment_status !== "paid";
  const paymentFailed = payment === "failed" || payment === "error" || payment === "mismatch";

  return (
    <div className="bg-cream">
      <section className="relative overflow-hidden bg-teal-deep py-16 text-cream sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(247,241,228,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(247,241,228,.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full border border-cream/10"
          aria-hidden="true"
        />
        <div className="container-wide relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[38rem]">
              <span className="inline-flex items-center gap-2 rounded-full border border-butter/30 bg-butter/10 px-3.5 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-butter">
                <Check className="size-3.5" aria-hidden="true" />
                {paymentPending ? "Payment pending" : "Order received"}
              </span>
              <h1 className="display-xl mt-6 text-cream">
                {paymentPending ? (
                  <>
                    One step
                    <br />
                    <span className="display-italic text-butter">
                      still open.
                    </span>
                  </>
                ) : (
                  <>
                    A clearer week
                    <br />
                    <span className="display-italic text-butter">
                      starts here.
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-5 max-w-[28rem] text-[0.92rem] leading-[1.8] text-cream/65">
                {paymentPending
                  ? `Your order ${typedOrder.order_number} is saved, but ZiniPay has not confirmed the payment yet. You can retry the secure payment page below${paymentFailed ? " — the last attempt did not complete" : ""}.`
                  : `Thank you, ${typedOrder.customer_name.split(" ")[0]}. We have your order and a human will check it before it leaves the studio. A receipt is on its way to ${typedOrder.email}.`}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {paymentPending ? (
                  <RetryZinipayButton orderNumber={typedOrder.order_number} />
                ) : (
                  <Link
                    href={hasDigital ? "/account/library" : "/shop"}
                    className="btn btn-butter btn-lg"
                  >
                    {hasDigital ? "Open your library" : "Continue shopping"}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                )}
                <a
                  href="https://wa.me/8801341739202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline !border-cream/25 !bg-transparent !text-cream hover:!border-butter hover:!text-butter"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Message support
                </a>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[1.5rem] border border-cream/15 bg-cream/[0.06] p-6 backdrop-blur">
              <div className="flex items-start justify-between border-b border-cream/10 pb-4">
                <div>
                  <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-cream/40">
                    Order number
                  </p>
                  <p className="mt-1 font-display text-[1.3rem] tracking-[-0.02em] text-cream">
                    {typedOrder.order_number}
                  </p>
                </div>
                <span className="rounded-full border border-butter/25 bg-butter/10 px-2.5 py-1 text-[0.54rem] font-bold uppercase tracking-[0.1em] text-butter">
                  {typedOrder.status}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-[0.72rem]">
                <div className="flex justify-between gap-4">
                  <span className="text-cream/45">Placed</span>
                  <span className="text-cream/80">{formatDate(typedOrder.created_at)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-cream/45">Payment</span>
                  <span className="text-cream/80">
                    {paymentMethodLabel(typedOrder.payment_method)}
                    {isZinipay
                      ? typedOrder.payment_status === "paid"
                        ? " · paid"
                        : " · pending"
                      : typedOrder.payment_method === "bkash"
                        ? " · awaiting confirmation"
                        : ""}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-cream/45">Deliver to</span>
                  <span className="max-w-[12rem] text-right text-cream/80">
                    {typedOrder.city}, {typedOrder.district}
                  </span>
                </div>
              </div>
              <div className="mt-4 border-t border-cream/10 pt-4">
                <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-cream/40">
                  Total
                </p>
                <p className="price mt-1 font-display text-[2rem] tracking-[-0.03em] text-butter">
                  {formatMoney(typedOrder.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide py-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[1.6rem] tracking-[-0.03em] text-ink">
                What you picked
              </h2>
              <span className="text-[0.62rem] font-semibold text-muted">
                {typedItems.length} {typedItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {typedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-[0.82rem] font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.06em] text-muted">
                      {item.format} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="price text-[0.85rem] font-semibold text-ink">
                    {formatMoney(item.line_total)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-[0.78rem]">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="price">{formatMoney(typedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery</span>
                <span className="price">
                  {typedOrder.delivery_fee === 0 ? "Free" : formatMoney(typedOrder.delivery_fee)}
                </span>
              </div>
              {typedOrder.discount > 0 ? (
                <div className="flex justify-between text-teal">
                  <span>Promo discount</span>
                  <span className="price">−{formatMoney(typedOrder.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
                <span>Total</span>
                <span className="price font-display text-xl">{formatMoney(typedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-muted">
              What happens next
            </p>
            {hasPhysical ? (
              <div className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                  <Truck className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[0.76rem] font-bold text-ink">We pack your parcel</p>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                    Usually within one working day. Delivery is 2–4 working days across Bangladesh.
                  </p>
                </div>
              </div>
            ) : null}
            {paymentPending ? (
              <div className="flex gap-3 rounded-2xl border border-butter/60 bg-butter-soft/40 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-butter text-ink">
                  <Clock className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[0.76rem] font-bold text-ink">Payment has not landed yet</p>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                    Use the payment button above to reopen the secure ZiniPay page. Nothing is released until ZiniPay confirms it.
                  </p>
                </div>
              </div>
            ) : null}
            {hasDigital ? (
              <div className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-coral/10 text-coral">
                  <BookOpen className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[0.76rem] font-bold text-ink">
                    {isZinipay && typedOrder.payment_status === "paid"
                      ? "Your library is ready"
                      : paymentPending
                        ? "Unlocks after payment"
                        : "Digital access is being prepared"}
                  </p>
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                    {isZinipay
                      ? typedOrder.payment_status === "paid"
                        ? "Your digital tools are in your account library now."
                        : "Finish the payment above and your tools appear in the library automatically."
                      : "We confirm bKash payments by hand. Your resource appears in the library once confirmed — usually within a few hours."}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-butter/30 text-ink">
                <MessageCircle className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.76rem] font-bold text-ink">Keep the order number close</p>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                  Message us on WhatsApp with <span className="font-semibold text-ink">{typedOrder.order_number}</span> if you need anything at all.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-teal-soft/40 px-4 py-3 text-[0.62rem] text-teal">
              <Clock className="size-3.5" aria-hidden="true" />
              Support replies within one working day.
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <div className="flex items-center gap-2 text-[0.64rem] text-muted">
            <PackageCheck className="size-4 text-teal" aria-hidden="true" />
            Every order is checked by a person, not just a printer.
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-teal"
          >
            Keep exploring
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
