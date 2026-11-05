"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/brand/product-art";
import { JamdaniField, SealStamp } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/storefront/order-timeline";
import { getProduct } from "@/lib/data";
import { productColorPalette } from "@/lib/theme";
import { getLocalOrder } from "@/lib/order-store";
import type { Order } from "@/lib/types";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { formatBDT } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

export function OrderSuccessView({ orderNo }: { orderNo: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrder(getLocalOrder(orderNo) ?? null);
    setLoaded(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [orderNo]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderNo);
      toast.success("Order number copied");
    } catch {
      toast.error(`Your order number is ${orderNo}`);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)]">
        <JamdaniField id="success-pattern" color="var(--color-saffron)" opacity={0.12} size={56} />
        <div className="container-luxe relative py-12 text-center md:py-16">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-jade/30 bg-jade/10">
            <span className="absolute inset-0 animate-ping rounded-full bg-jade/10" style={{ animationDuration: "3s" }} />
            <span className="relative grid h-14 w-14 place-items-center rounded-full bg-jade text-white">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </span>
          </div>
          <p className="eyebrow mt-6 text-indigo">Order received</p>
          <h1 className="display-2 mt-3">
            Thank you, <span className="italic text-gold-ink">{order?.customer.split(" ")[0] ?? "friend"}.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[0.86rem] leading-relaxed text-muted-foreground">
            Your order has been placed with care. We will confirm it shortly and send you a
            tracking link as soon as it leaves the atelier.
          </p>

          <button
            type="button"
            onClick={copy}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed border-gold/50 bg-[var(--surface)] px-4 py-2.5 text-[0.7rem] font-semibold tracking-[0.08em] transition hover:border-gold"
          >
            <span className="text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
              Order
            </span>
            <span className="font-mono font-bold">{orderNo}</span>
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="gold">
              <Link href="/collections/new-arrivals">
                Continue shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/orders">View my orders</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container-luxe py-10 md:py-14">
        {!loaded ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="skeleton h-96 rounded-2xl" />
            <div className="skeleton h-96 rounded-2xl" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
            <div className="space-y-5">
              {order ? (
                <OrderTimeline order={order} />
              ) : (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-jade/10 text-jade">
                      <PackageCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Order status
                      </p>
                      <p className="text-[0.82rem] font-semibold">Pending confirmation</p>
                    </div>
                  </div>
                  <p className="mt-4 text-[0.76rem] leading-relaxed text-muted-foreground">
                    This preview order was placed during the current session. Its full
                    details will live in your account once the backend is connected.
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
                <h2 className="font-display text-xl">What happens next</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: Mail, title: "We confirm", text: "A confirmation is sent by SMS and email." },
                    { icon: Sparkles, title: "We prepare", text: "Your pieces are checked and packed by hand." },
                    { icon: Truck, title: "We deliver", text: "Steadfast brings it to your door." },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title}>
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/25 bg-gold/[0.06] text-gold">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="mt-3 text-[0.76rem] font-semibold">{title}</p>
                      <p className="mt-1 text-[0.65rem] leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {order && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl">Your pieces</h2>
                    <span className="text-[0.55rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "piece" : "pieces"}
                    </span>
                  </div>
                  <div className="mt-4 divide-y divide-[var(--border)]">
                    {order.items.map((item, index) => {
                      const product = getProduct(item.productSlug);
                      const colorHex = product?.colors.find(
                        (color) => color.name === item.color
                      )?.hex;
                      return (
                        <div key={`${item.productSlug}-${index}`} className="flex gap-3 py-3.5">
                          <div className="h-[76px] w-[58px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)]">
                            {product && (
                              <ProductArt
                                id={`success-${product.slug}-${index}`}
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
                          <div className="min-w-0 flex-1">
                            {item.bundleName && (
                              <p className="text-[0.48rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
                                Bundle: {item.bundleName}
                              </p>
                            )}
                            <p className="text-[0.8rem] font-medium">{item.name}</p>
                            <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.08em] text-muted-foreground">
                              {item.color} · {item.size} · Qty {item.qty}
                            </p>
                          </div>
                          <p className="text-[0.78rem] font-semibold tabular-nums">
                            {formatBDT(item.price * item.qty)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              {order && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl">Order summary</h2>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-jade/10 text-jade">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                  </div>
                  <div className="mt-4 space-y-2.5 text-[0.74rem]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatBDT(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-jade ">
                        <span>Discount</span>
                        <span className="tabular-nums">−{formatBDT(order.discount)}</span>
                      </div>
                    )}
                    {(order.bundleSavings ?? 0) > 0 && (
                      <div className="flex justify-between text-jade ">
                        <span>Bundle savings</span>
                        <span className="tabular-nums">−{formatBDT(order.bundleSavings ?? 0)}</span>
                      </div>
                    )}
                    {(order.giftCardAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-indigo">
                        <span>Gift card</span>
                        <span className="tabular-nums">−{formatBDT(order.giftCardAmount ?? 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="tabular-nums">
                        {order.delivery === 0 ? "Complimentary" : formatBDT(order.delivery)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[var(--border)] pt-3 font-semibold">
                      <span>Total</span>
                      <span className="text-lg tabular-nums">{formatBDT(order.total)}</span>
                    </div>
                    <p className="rounded-lg bg-[var(--muted)] px-3 py-2 text-[0.6rem] text-muted-foreground">
                      {order.total === 0
                        ? "Payment: covered by your gift card."
                        : `Payment: ${order.payment} · Pay ${formatBDT(order.total)} at your door`}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h3 className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Delivering to
                </h3>
                {order ? (
                  <>
                    <p className="mt-2 text-[0.8rem] font-semibold">{order.customer}</p>
                    <p className="mt-1 flex items-start gap-2 text-[0.7rem] leading-relaxed text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      {order.address}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-gold" /> {order.phone}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-[0.7rem] leading-relaxed text-muted-foreground">
                    Your delivery details are saved with this order.
                  </p>
                )}
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-full border border-[var(--color-jade)]/25 bg-[var(--color-jade)]/[0.05] py-2.5 text-[0.56rem] font-bold uppercase tracking-[0.1em] text-[var(--color-jade)] transition hover:bg-[var(--color-jade)] hover:text-white "
                >
                  <WhatsAppIcon className="h-4 w-4" /> Questions? {SITE.whatsapp}
                </a>
              </div>

              <div className="rounded-2xl border border-dashed border-gold/35 bg-gold/[0.05] p-5 text-center">
                <SealStamp size={54} className="mx-auto opacity-70" text="BENGALOT · " />
                <p className="mt-2 font-display text-lg">Packed by hand, with care.</p>
                <p className="mt-1 text-[0.64rem] leading-relaxed text-muted-foreground">
                  Saltha, Faridpur · Delivered with Steadfast
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
