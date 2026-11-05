"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  Search,
  Truck,
} from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { JamdaniField, SealStamp, Sparkle } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { OrderTimeline } from "@/components/storefront/order-timeline";
import { getProduct, demoOrders } from "@/lib/data";
import { productColorPalette } from "@/lib/theme";
import { getLocalOrders } from "@/lib/order-store";
import { STORE_SETTINGS } from "@/lib/settings";
import type { Order } from "@/lib/types";
import { formatBDT } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { WHATSAPP_LINK } from "@/lib/constants";

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function TrackView({
  initialOrder = "",
  initialPhone = "",
}: {
  initialOrder?: string;
  initialPhone?: string;
}) {
  const [orderNo, setOrderNo] = useState(initialOrder);
  const [phone, setPhone] = useState(initialPhone);
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const demoEnabled = !STORE_SETTINGS.hideDemoContent;

  const find = async (no = orderNo, ph = phone) => {
    const normalizedNo = no.trim().toUpperCase();
    const normalizedPhone = digits(ph);
    if (!normalizedNo || !normalizedPhone) {
      setError("Please enter both your order number and phone number.");
      setSearched(true);
      setResult(null);
      return;
    }
    const local = getLocalOrders().find(
      (order) => order.orderNo.toUpperCase() === normalizedNo
    );
    const demo = STORE_SETTINGS.hideDemoContent
      ? undefined
      : demoOrders.find(
          (order) => order.orderNo.toUpperCase() === normalizedNo
        );
    const localMatch =
      local && digits(local.phone) === normalizedPhone ? local : undefined;
    const demoMatch =
      demo && digits(demo.phone) === normalizedPhone ? demo : undefined;
    if (localMatch || demoMatch) {
      setResult(localMatch ?? demoMatch ?? null);
      setSearched(true);
      setError("");
      return;
    }

    // Fall back to the durable order store so tracking works on any device.
    setSearching(true);
    setSearched(false);
    try {
      const response = await fetch(
        `/api/orders/track?orderNo=${encodeURIComponent(normalizedNo)}&phone=${encodeURIComponent(normalizedPhone)}`,
        { cache: "no-store" }
      );
      const data = await response.json().catch(() => ({}));
      setSearched(true);
      if (response.ok && data.order) {
        setResult(data.order as Order);
        setError("");
      } else {
        setResult(null);
        setError(
          data.error ??
            "We couldn't find an order with those details. Check the order number and phone, or contact us on WhatsApp."
        );
      }
    } catch {
      setSearched(true);
      setResult(null);
      setError("Could not reach the order service. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    setHydrated(true);
    if (initialOrder && initialPhone) {
      void find(initialOrder, initialPhone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useSample = () => {
    setOrderNo("BG-2610-1842");
    setPhone("01711223344");
    void find("BG-2610-1842", "01711223344");
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)]">
        <JamdaniField id="track-hero" color="var(--color-teal)" opacity={0.12} size={60} />
        <div className="pointer-events-none absolute -right-24 -top-10 h-[360px] w-[360px] rounded-full bg-gold/10 blur-[100px]" />
        <div className="container-luxe relative py-10 md:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <div>
              <p className="eyebrow flex items-center gap-3 text-indigo">
                <span className="h-px w-8 bg-gold" /> Order tracking
              </p>
              <h1 className="display-2 mt-3">
                Where is your <span className="italic text-gold-ink">order?</span>
              </h1>
              <p className="mt-4 max-w-lg text-[0.86rem] leading-relaxed text-muted-foreground">
                Enter the order number from your confirmation SMS along with the phone
                number used at checkout. We&apos;ll show you exactly where your parcel is.
              </p>

              <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_60px_-45px_rgba(20,10,40,0.4)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void find();
                  }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div>
                    <Label htmlFor="order-no">Order number</Label>
                    <Input
                      id="order-no"
                      value={orderNo}
                      onChange={(e) => setOrderNo(e.target.value.toUpperCase())}
                      placeholder="BG-XXXX-XXXXXXXX"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="track-phone">Phone number</Label>
                    <Input
                      id="track-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                      placeholder="01XXXXXXXXX"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={11}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <Button type="submit" variant="gold" disabled={searching}>
                      <Search className="h-4 w-4" /> {searching ? "Looking up…" : "Track order"}
                    </Button>
                    {demoEnabled && (
                      <button
                        type="button"
                        onClick={useSample}
                        className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 transition hover:text-gold-ink hover:underline"
                      >
                        Try a demo order
                      </button>
                    )}
                  </div>
                </form>
                {demoEnabled && (
                  <p className="mt-3 text-[0.6rem] leading-relaxed text-muted-foreground/70">
                    Demo order <span className="font-mono">BG-2610-1842</span> · phone{" "}
                    <span className="font-mono">01711223344</span>
                  </p>
                )}
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-[400px] lg:block">
              <div className="relative overflow-hidden rounded-[24px] border border-gold/20 bg-[linear-gradient(145deg,var(--color-teal),var(--color-teal))] p-7 text-ivory">
                <JamdaniField id="track-art" color="var(--color-saffron)" opacity={0.16} size={54} />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/30 bg-ivory/10 text-gold">
                      <Truck className="h-6 w-6" />
                    </span>
                    <SealStamp
                      size={82}
                      className="stamp-spin opacity-70"
                      text="STEADFAST · BENGALOT · 2026 · "
                    />
                  </div>
                  <p className="mt-10 font-display text-3xl leading-tight text-ivory">
                    From our door
                    <br />
                    to <span className="italic text-gold-ink">yours.</span>
                  </p>
                  <p className="mt-3 max-w-[260px] text-[0.72rem] leading-relaxed text-ivory/55">
                    Delivery across Bangladesh. You&apos;ll get an SMS at each key step.
                  </p>
                  <div className="mt-8 space-y-3 border-t border-ivory/10 pt-5 text-[0.66rem] text-ivory/55">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Live courier updates
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Cash on delivery
                    </p>
                  </div>
                </div>
                <Sparkle className="absolute right-6 top-28 opacity-60" size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-luxe py-10 md:py-14">
        {searched && error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-rosewood/20 bg-rosewood/[0.04] p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rosewood/10 text-rosewood">
              <Search className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl">No order found.</p>
            <p className="mx-auto mt-2 max-w-md text-[0.78rem] leading-relaxed text-muted-foreground">
              {error}
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-5 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white"
            >
              <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
            </a>
          </div>
        )}

        {result && (
          <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:gap-10">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div>
                  <p className="text-[0.52rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Order {result.orderNo}
                  </p>
                  <p className="mt-1 font-display text-2xl">
                    {result.status === "Delivered"
                      ? "Delivered. We hope you love it."
                      : "Your package is on its way."}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-gold" /> {result.district} ·{" "}
                    {result.customer}
                  </p>
                </div>
                <span className="rounded-full bg-jade/10 px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-jade ">
                  {result.status}
                </span>
              </div>

              <OrderTimeline order={result} />

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="font-display text-xl">In this order</h2>
                <div className="mt-3 divide-y divide-[var(--border)]">
                  {result.items.map((item, index) => {
                    const product = getProduct(item.productSlug);
                    const colorHex = product?.colors.find(
                      (color) => color.name === item.color
                    )?.hex;
                    return (
                      <div key={`${item.productSlug}-${index}`} className="flex gap-3 py-3">
                        <div className="h-[66px] w-[50px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)]">
                          {product && (
                            <ProductArt
                              id={`track-${product.slug}-${index}`}
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
                          <p className="text-[0.76rem] font-medium">{item.name}</p>
                          <p className="mt-0.5 text-[0.56rem] uppercase tracking-[0.08em] text-muted-foreground">
                            {item.color} · {item.size} · Qty {item.qty}
                          </p>
                        </div>
                        <p className="text-[0.72rem] font-semibold tabular-nums">
                          {formatBDT(item.price * item.qty)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h3 className="font-display text-xl">Delivery</h3>
                <p className="mt-2 flex items-start gap-2 text-[0.72rem] leading-relaxed text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                  {result.address}
                </p>
                <p className="mt-2 flex items-center gap-2 text-[0.72rem] text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-gold" /> {result.phone}
                </p>
                <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-[0.72rem]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium">{result.payment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold tabular-nums">{formatBDT(result.total)}</span>
                  </div>
                  {result.trackingCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking</span>
                      <span className="font-mono text-[0.68rem]">{result.trackingCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-gold/35 bg-gold/[0.05] p-5">
                <Package className="h-5 w-5 text-gold" />
                <p className="mt-3 font-display text-lg">Need to change something?</p>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-muted-foreground">
                  Orders can be changed before dispatch. Message us with your order number
                  and we&apos;ll do our best.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[var(--color-jade)] "
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" /> Message the atelier
                </a>
              </div>

              <Link
                href="/account/orders"
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[0.72rem] transition hover:border-gold"
              >
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" /> All my orders
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </aside>
          </div>
        )}

        {!searched && hydrated && (
          <div className="mx-auto max-w-xl text-center">
            <p className="font-display text-xl">A parcel, somewhere in Bangladesh.</p>
            <p className="mt-2 text-[0.76rem] leading-relaxed text-muted-foreground">
              Delivery usually takes {STORE_SETTINGS.deliveryTimeInside} inside Faridpur and{" "}
              {STORE_SETTINGS.deliveryTimeOutside} elsewhere.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
