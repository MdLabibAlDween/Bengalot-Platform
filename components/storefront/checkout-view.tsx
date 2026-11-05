"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/brand/product-art";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select, Textarea } from "@/components/ui/input";
import { getBundleCartGroups } from "@/lib/bundles";
import { productForLine } from "@/lib/cart";
import {
  formatGiftCardCode,
} from "@/lib/gift-cards";
import { productColorPalette } from "@/lib/theme";
import { useCart } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { Order } from "@/lib/types";
import { createOrderNo, saveLocalOrder } from "@/lib/order-store";
import {
  FREE_DELIVERY_ENABLED,
  FREE_DELIVERY_THRESHOLD,
  cn,
  deliveryChargeFor,
  formatBDT,
} from "@/lib/utils";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { DISTRICTS, WHATSAPP_LINK } from "@/lib/constants";

type FormState = {
  name: string;
  phone: string;
  email: string;
  district: string;
  thana: string;
  address: string;
  note: string;
  terms: boolean;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  district: "",
  thana: "",
  address: "",
  note: "",
  terms: false,
};

type AppliedGiftCard = {
  code: string;
  amount: number;
  balance: number;
  status: string;
  expiresAt: string;
};

export function CheckoutView({ giftCardsEnabled = true }: { giftCardsEnabled?: boolean }) {
  const router = useRouter();
  const { profile } = useSiteConfig();
  const {
    lines,
    subtotal,
    discount,
    eligibleSubtotal,
    bundleSavings,
    coupon,
    couponCode,
    freeShipping,
    applyCoupon,
    removeCoupon,
    clearCart,
    hydrated,
  } = useCart();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCard, setGiftCard] = useState<AppliedGiftCard | null>(null);
  const [giftCardError, setGiftCardError] = useState("");

  const fee = form.district
    ? freeShipping
      ? 0
      : deliveryChargeFor(
          form.district,
          profile.deliveryInside,
          profile.deliveryOutside
        )
    : freeShipping
      ? 0
      : null;
  const totalBeforeGift = Math.max(0, subtotal - discount - bundleSavings) + (fee ?? 0);
  const giftApplied = giftCard
    ? Math.min(giftCard.balance, totalBeforeGift)
    : 0;
  const total = Math.max(0, totalBeforeGift - giftApplied);
  const incompleteBundles = getBundleCartGroups(lines).filter((group) => !group.complete);
  const demoLines = lines.filter((line) => Boolean(productForLine(line)?.isDemo));
  const hasDemoItems = demoLines.length > 0;

  const set = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "Please enter your full name.";
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim()))
      next.phone = "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "That email address does not look right.";
    if (!form.district) next.district = "Select your district.";
    if (form.thana.trim().length < 2) next.thana = "Enter your thana / upazila.";
    if (form.address.trim().length < 10)
      next.address = "Please add a full address (house, road, area).";
    if (!form.terms) next.terms = "Please agree to the terms before placing your order.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demoLines.length > 0) {
      toast.error("Remove demo items before placing an order.", {
        description: "Ordering is disabled for demo products.",
      });
      return;
    }
    if (!validate()) {
      toast.error("A few details need your attention.");
      const first = document.querySelector("[aria-invalid='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    const orderNo = createOrderNo();
    const order: Order = {
      orderNo,
      date: new Date().toISOString(),
      status: "Pending",
      items: lines
        .map((line) => {
          const product = productForLine(line);
          if (!product) return null;
          return {
            productSlug: line.productSlug,
            name: product.name,
            size: line.size,
            color: line.color,
            qty: line.qty,
            price: product.price,
            bundleId: line.bundleId,
            bundleName: line.bundleName,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
      subtotal,
      discount,
      bundleSavings,
      giftCardCode: giftCard?.code,
      giftCardAmount: giftApplied > 0 ? giftApplied : undefined,
      delivery: fee ?? 0,
      total,
      payment: "Cash on Delivery",
      paymentStatus: "Unpaid",
      district: form.district,
      address: `${form.address}, ${form.thana}, ${form.district}`,
      customer: form.name,
      phone: form.phone,
      note: form.note || undefined,
      events: [
        {
          status: "Order Placed",
          date: new Date().toISOString(),
          note: "Order received. We will confirm it shortly.",
        },
      ],
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: order.orderNo,
          customer: order.customer,
          phone: order.phone,
          email: form.email || undefined,
          district: order.district,
          address: order.address,
          note: order.note,
          subtotal: order.subtotal,
          discount: order.discount,
          bundleSavings: order.bundleSavings ?? 0,
          couponCode: coupon?.code,
          giftCardCode: order.giftCardCode,
          giftCardAmount: order.giftCardAmount ?? 0,
          delivery: order.delivery,
          total: order.total,
          payment: order.payment,
          items: order.items,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitting(false);
        toast.error(result.error ?? "Could not place the order.", {
          description: "Your bag is still saved. Please check the details and try again.",
        });
        return;
      }

      const confirmed: Order = {
        ...order,
        subtotal: Number(result.totals?.subtotal ?? order.subtotal),
        discount: Number(result.totals?.discount ?? order.discount),
        bundleSavings: 0,
        giftCardCode: giftCard?.code,
        giftCardAmount: Number(result.totals?.giftCardAmount ?? giftApplied),
        delivery: Number(result.totals?.delivery ?? order.delivery),
        total: Number(result.totals?.total ?? order.total),
        items: Array.isArray(result.items) ? result.items : order.items,
      };

      saveLocalOrder(confirmed);
      clearCart();
      toast.success("Order placed", {
        description: `${orderNo} · Cash on delivery`,
      });
      router.push(`/order-success/${orderNo}`);
    } catch {
      setSubmitting(false);
      toast.error("Could not place the order.", {
        description: "Check your connection and try again. Your bag is still saved.",
      });
    }
  };

  const submitCoupon = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const result = applyCoupon(code);
    if (result.ok) {
      setCouponError("");
      setCode("");
      toast.success(result.message);
    } else {
      setCouponError(result.message);
    }
  };

  const submitGiftCard = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const code = giftCardCode.trim();
    if (!code) {
      setGiftCardError("Enter a gift card code.");
      return;
    }
    setGiftCardError("");
    const response = await fetch("/api/gift-cards/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.giftCard) {
      setGiftCardError(result.error ?? "That gift card was not found.");
      return;
    }
    setGiftCard(result.giftCard as AppliedGiftCard);
    setGiftCardCode("");
    toast.success(`${formatGiftCardCode(result.giftCard.code)} ready to use.`, {
      description: `${formatBDT(result.giftCard.balance)} available.`,
    });
  };

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty, 0),
    [lines]
  );

  if (!hydrated) {
    return (
      <div className="container-luxe py-20">
        <div className="skeleton h-8 w-52 rounded-lg" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="skeleton h-[500px] rounded-2xl" />
          <div className="skeleton h-[420px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-luxe py-20 text-center">
        <p className="font-display text-4xl">Your bag is empty.</p>
        <p className="mx-auto mt-3 max-w-sm text-[0.82rem] leading-relaxed text-muted-foreground">
          Add a few pieces before heading to checkout.
        </p>
        <Button asChild variant="gold" className="mt-6">
          <Link href="/collections/new-arrivals">Shop new arrivals</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-luxe py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-gold-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bag
        </Link>
        <div className="flex items-center gap-2 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-jade text-white">
              <Check className="h-3 w-3" />
            </span>
            Bag
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-midnight text-[0.55rem] text-ivory">
              2
            </span>
            Details
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full border border-[var(--border)] text-[0.55rem]">
              3
            </span>
            Confirmation
          </span>
        </div>
      </div>

      <div className="mt-6">
        <p className="eyebrow text-indigo">Almost yours</p>
        <h1 className="display-2 mt-2">Checkout</h1>
        <p className="mt-2 max-w-lg text-[0.82rem] leading-relaxed text-muted-foreground">
          Guest checkout is welcome. No account needed — just the details we need to get
          your pieces to your door.
        </p>
        {hasDemoItems && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-gold/35 bg-gold/[0.07] p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" />
            <div>
              <p className="text-[0.68rem] font-bold text-gold-ink">
                Demo items in your bag
              </p>
              <p className="mt-1 text-[0.62rem] leading-relaxed text-muted-foreground">
                Ordering is disabled for demo products, so checkout is blocked.{" "}
                <Link
                  href="/cart"
                  className="font-semibold text-gold-ink underline-offset-2 hover:underline"
                >
                  Remove the demo items
                </Link>{" "}
                to continue.
              </p>
            </div>
          </div>
        )}
      </div>

      <form
        id="checkout-form"
        onSubmit={placeOrder}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-10"
        noValidate
      >
        <div className="space-y-5">
          {/* Contact */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-gold/10 font-display text-sm text-gold-ink">
                01
              </span>
              <div>
                <h2 className="font-display text-xl leading-none">Contact</h2>
                <p className="mt-1 text-[0.62rem] text-muted-foreground">
                  We&apos;ll only message about this order.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name *</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your full name"
                  aria-invalid={Boolean(errors.name)}
                  className={errors.name ? "border-rosewood" : ""}
                />
                {errors.name && <p className="mt-1 text-[0.6rem] text-rosewood">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Mobile number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  aria-invalid={Boolean(errors.phone)}
                  className={errors.phone ? "border-rosewood" : ""}
                />
                {errors.phone && (
                  <p className="mt-1 text-[0.6rem] text-rosewood">{errors.phone}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="email">
                  Email <span className="normal-case tracking-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="For a copy of your receipt"
                  aria-invalid={Boolean(errors.email)}
                  className={errors.email ? "border-rosewood" : ""}
                />
                {errors.email && (
                  <p className="mt-1 text-[0.6rem] text-rosewood">{errors.email}</p>
                )}
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-gold/10 font-display text-sm text-gold-ink">
                02
              </span>
              <div>
                <h2 className="font-display text-xl leading-none">Delivery address</h2>
                <p className="mt-1 text-[0.62rem] text-muted-foreground">
                  Delivered with Steadfast to all 64 districts.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="district">District *</Label>
                <Select
                  id="district"
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  aria-invalid={Boolean(errors.district)}
                  className={errors.district ? "border-rosewood" : ""}
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                {errors.district && (
                  <p className="mt-1 text-[0.6rem] text-rosewood">{errors.district}</p>
                )}
              </div>
              <div>
                <Label htmlFor="thana">Thana / Upazila *</Label>
                <Input
                  id="thana"
                  autoComplete="address-level2"
                  value={form.thana}
                  onChange={(e) => set("thana", e.target.value)}
                  placeholder="Your thana or upazila"
                  aria-invalid={Boolean(errors.thana)}
                  className={errors.thana ? "border-rosewood" : ""}
                />
                {errors.thana && (
                  <p className="mt-1 text-[0.6rem] text-rosewood">{errors.thana}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Full address *</Label>
                <Textarea
                  id="address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="House, road, area, landmark"
                  className={cn("min-h-[84px]", errors.address && "border-rosewood")}
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address && (
                  <p className="mt-1 text-[0.6rem] text-rosewood">{errors.address}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="note">
                  Order note <span className="normal-case tracking-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Delivery instructions, gift note, or anything we should know"
                  className="min-h-[72px]"
                />
              </div>
            </div>
          </section>

          {/* Delivery method */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-gold/10 font-display text-sm text-gold-ink">
                03
              </span>
              <h2 className="font-display text-xl leading-none">Delivery method</h2>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/[0.06] p-4">
              <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-gold text-midnight">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <Truck className="mt-0.5 h-5 w-5 text-gold" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[0.78rem] font-semibold">Steadfast delivery</p>
                  <p className="text-[0.75rem] font-semibold tabular-nums">
                    {fee === null ? "Select district" : fee === 0 ? "Complimentary" : formatBDT(fee)}
                  </p>
                </div>
                <p className="mt-1 text-[0.64rem] leading-relaxed text-muted-foreground">
                  {form.district === "Faridpur"
                    ? "1–2 working days inside Faridpur district."
                    : form.district
                      ? "2–4 working days, tracked door-to-door."
                      : `${formatBDT(profile.deliveryInside)} inside Faridpur · ${formatBDT(profile.deliveryOutside)} elsewhere · 2–4 working days.`}
                </p>
                {FREE_DELIVERY_ENABLED && subtotal >= FREE_DELIVERY_THRESHOLD && (
                  <p className="mt-1 text-[0.58rem] font-semibold text-jade ">
                    Complimentary delivery applied on orders over{" "}
                    {formatBDT(FREE_DELIVERY_THRESHOLD)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-gold/10 font-display text-sm text-gold-ink">
                04
              </span>
              <h2 className="font-display text-xl leading-none">Payment</h2>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/[0.06] p-4">
              <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-gold text-midnight">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <Banknote className="mt-0.5 h-5 w-5 text-gold" />
              <div>
                <p className="text-[0.78rem] font-semibold">Cash on Delivery</p>
                <p className="mt-1 text-[0.64rem] leading-relaxed text-muted-foreground">
                  Pay the courier when your parcel arrives. Available across Bangladesh.
                </p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[0.58rem] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-jade" /> No payment is taken now. Your
              details are kept private.
            </p>
          </section>

          <div>
            <label className="flex cursor-pointer items-start gap-2.5 text-[0.7rem] leading-relaxed text-muted-foreground">
              <Checkbox
                checked={form.terms}
                onChange={(e) => set("terms", e.target.checked)}
                aria-invalid={Boolean(errors.terms)}
                className="mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="underline underline-offset-2 hover:text-gold-ink">
                  terms & conditions
                </Link>
                ,{" "}
                <Link href="/return-policy" className="underline underline-offset-2 hover:text-gold-ink">
                  return policy
                </Link>{" "}
                and confirm my delivery details are correct.
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1.5 text-[0.6rem] text-rosewood">{errors.terms}</p>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between lg:hidden">
            <p className="text-[0.7rem] text-muted-foreground">
              Total <span className="text-base font-semibold text-foreground">{formatBDT(total)}</span>
            </p>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={submitting || hasDemoItems}
            >
              {hasDemoItems
                ? "Remove demo items to order"
                : submitting
                  ? "Placing order…"
                  : "Place order"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_25px_60px_-45px_rgba(20,10,40,0.4)]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Your order</h2>
              <Link href="/cart" className="text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:text-gold-ink hover:underline">
                Edit bag
              </Link>
            </div>

            <div className="mt-4 max-h-[260px] space-y-3 overflow-y-auto pr-1">
              {lines.map((line) => {
                const product = productForLine(line);
                if (!product) return null;
                const colorHex = product.colors.find(
                  (color) => color.name === line.color
                )?.hex;
                return (
                  <div
                  key={`${line.productSlug}-${line.size}-${line.color}-${line.bundleId ?? "solo"}`}
                  className="flex gap-3"
                >
                    <div className="relative h-[68px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)]">
                      <ProductArt
                        id={`checkout-${product.slug}-${line.color}`}
                        art={product.art}
                        paletteOverride={
                          colorHex ? productColorPalette(colorHex) : undefined
                        }
                        colorName={line.color}
                        showCaption={false}
                        showMonogram={false}
                      />
                      <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-midnight text-[0.48rem] font-bold text-ivory">
                        {line.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {line.bundleId && (
                        <p className="text-[0.48rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
                          Bundle: {line.bundleName}
                        </p>
                      )}
                      <p className="truncate text-[0.72rem] font-medium">{product.name}</p>
                      <p className="mt-0.5 text-[0.56rem] uppercase tracking-[0.08em] text-muted-foreground">
                        {line.color} · {line.size}
                      </p>
                      <p className="mt-0.5 text-[0.68rem] font-semibold tabular-nums">
                        {formatBDT(product.price * line.qty)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {incompleteBundles.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-rosewood/20 bg-rosewood/[0.04] px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rosewood" />
                <p className="text-[0.6rem] leading-relaxed text-muted-foreground">
                  {incompleteBundles.length === 1 ? "A bundle in your bag is" : "Bundles in your bag are"}{" "}
                  incomplete, so the bundle saving does not apply.{" "}
                  <Link href="/cart" className="font-semibold text-gold-ink underline-offset-2 hover:underline">
                    Review your bag
                  </Link>{" "}
                  to restore the complete outfit.
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-[var(--border)] pt-4">
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-jade/[0.06] px-3 py-2">
                  <div>
                    <p className="text-[0.6rem] font-bold text-jade ">
                      {coupon.code} applied
                    </p>
                    <p className="text-[0.55rem] text-muted-foreground">{coupon.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      toast("Promo code removed");
                    }}
                    className="text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-rosewood"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitCoupon(e);
                    }}
                    placeholder="Promo code"
                    aria-label="Promo code"
                    className="field h-9 flex-1 py-0 text-[0.68rem] uppercase tracking-[0.06em]"
                  />
                  <button
                    type="button"
                    onClick={() => submitCoupon()}
                    className="rounded-lg bg-midnight px-3 text-[0.52rem] font-bold uppercase tracking-[0.1em] text-ivory"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && (
                <p className="mt-1.5 text-[0.58rem] text-rosewood">{couponError}</p>
              )}
            </div>

            {giftCardsEnabled && (
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              {giftCard ? (
                <div className="flex items-center justify-between rounded-xl bg-indigo/[0.06] px-3 py-2">
                  <div>
                    <p className="text-[0.6rem] font-bold text-indigo">
                      Gift card · {formatGiftCardCode(giftCard.code)}
                    </p>
                    <p className="text-[0.55rem] text-muted-foreground">
                      {formatBDT(giftApplied)} of {formatBDT(giftCard.balance)} applied
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGiftCard(null);
                      toast("Gift card removed");
                    }}
                    className="text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-rosewood"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={giftCardCode}
                    onChange={(e) => {
                      setGiftCardCode(e.target.value.toUpperCase());
                      setGiftCardError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitGiftCard(e);
                    }}
                    placeholder="Gift card code"
                    aria-label="Gift card code"
                    className="field h-9 flex-1 py-0 font-mono text-[0.64rem] tracking-[0.04em]"
                  />
                  <button
                    type="button"
                    onClick={() => submitGiftCard()}
                    className="rounded-lg bg-indigo px-3 text-[0.52rem] font-bold uppercase tracking-[0.1em] text-ivory transition hover:bg-magenta"
                  >
                    Apply
                  </button>
                </div>
              )}
              {giftCardError && (
                <p className="mt-1.5 text-[0.58rem] text-rosewood">{giftCardError}</p>
              )}
            </div>
            )}

            <div className="mt-4 space-y-2.5 border-t border-[var(--border)] pt-4 text-[0.76rem]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="tabular-nums">{formatBDT(subtotal)}</span>
              </div>
              {coupon && (coupon.productSlugs?.length ?? 0) > 0 && (
                <div className="flex justify-between text-[0.62rem] text-muted-foreground">
                  <span>Eligible for {coupon.code}</span>
                  <span className="tabular-nums">{formatBDT(eligibleSubtotal)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-jade ">
                  <span>Discount</span>
                  <span className="tabular-nums">−{formatBDT(discount)}</span>
                </div>
              )}
              {bundleSavings > 0 && (
                <div className="flex justify-between text-jade ">
                  <span>Bundle savings</span>
                  <span className="tabular-nums">−{formatBDT(bundleSavings)}</span>
                </div>
              )}
              {giftApplied > 0 && (
                <div className="flex justify-between text-indigo">
                  <span>Gift card</span>
                  <span className="tabular-nums">−{formatBDT(giftApplied)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="tabular-nums">
                  {fee === null ? "Select district" : fee === 0 ? "Complimentary" : formatBDT(fee)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.1em]">Total</span>
                <span className="text-xl font-semibold tabular-nums">{formatBDT(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="mt-4 hidden w-full lg:flex"
              disabled={submitting || hasDemoItems}
            >
              {hasDemoItems
                ? "Remove demo items to order"
                : submitting
                  ? "Placing order…"
                  : "Place order"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.55rem] text-muted-foreground">
              <Lock className="h-3 w-3" /> Secure checkout · Cash on delivery
            </p>
            <p className="mt-3 text-center text-[0.52rem] leading-relaxed text-muted-foreground/60">
              Your order is saved securely and confirmed by our team before dispatch.
            </p>
          </div>

          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <p className="text-[0.62rem] leading-relaxed text-muted-foreground">
              Orders are packed in Saltha, Faridpur before dispatch.
            </p>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-gold-ink"
          >
            <WhatsAppIcon className="h-4 w-4 text-[var(--color-jade)]" /> Need help? WhatsApp us
          </a>
        </aside>
      </form>
    </div>
  );
}
