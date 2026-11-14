"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  Loader2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Smartphone,
  TicketPercent,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { ProductArt } from "@/components/product/product-art";
import { hasDigitalContent } from "@/lib/bundles";
import type { SavedAddress, StoreSettings } from "@/lib/types";
import { cn, formatMoney, normalizeBdPhone } from "@/lib/utils";

const districts = [
  "Faridpur",
  "Dhaka",
  "Gazipur",
  "Narayanganj",
  "Chattogram",
  "Cumilla",
  "Sylhet",
  "Rajshahi",
  "Bogura",
  "Khulna",
  "Jashore",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cox's Bazar",
  "Other district",
];

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  notes: string;
  paymentMethod: "cod" | "bkash" | "zinipay";
};

type Errors = Partial<Record<keyof FormState, string>>;

const progressSteps = [
  { label: "Bag", href: "/cart" },
  { label: "Details", href: "/checkout" },
  { label: "Confirmation", href: "" },
];

export function CheckoutClient({
  settings,
  user,
  zinipayEnabled,
  savedAddresses,
}: {
  settings: StoreSettings;
  user: { email: string; name: string } | null;
  zinipayEnabled: boolean;
  savedAddresses: SavedAddress[];
}) {
  const { lines, subtotal, clearCart, hydrated } = useCart();
  const router = useRouter();
  const hasPhysical = lines.some((line) => line.type === "physical");
  const hasDigital = lines.some((line) => hasDigitalContent(line));
  const requiresAccount = hasDigital && !user;
  const defaultAddress =
    savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0];

  const [form, setForm] = useState<FormState>({
    fullName: defaultAddress?.fullName || user?.name || "",
    email: user?.email ?? "",
    phone: defaultAddress?.phone || "",
    address: defaultAddress?.address || "",
    city: defaultAddress?.city || "",
    district:
      defaultAddress?.district ||
      (settings.city.toLowerCase().includes("faridpur") ? "Faridpur" : "Dhaka"),
    notes: "",
    paymentMethod:
      hasDigital && zinipayEnabled
        ? "zinipay"
        : hasDigital
          ? "bkash"
          : hasPhysical
            ? "cod"
            : "bkash",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [paymentTouched, setPaymentTouched] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{
    code: string;
    description: string;
    discount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const deliveryFee = useMemo(() => {
    if (!hasPhysical) return 0;
    if (subtotal >= settings.freeDeliveryThreshold) return 0;
    return form.district.toLowerCase() === "faridpur"
      ? settings.deliveryInside
      : settings.deliveryOutside;
  }, [
    hasPhysical,
    subtotal,
    settings.freeDeliveryThreshold,
    settings.deliveryInside,
    settings.deliveryOutside,
    form.district,
  ]);

  const discount = promo?.discount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const defaultPaymentMethod: FormState["paymentMethod"] = hasDigital
    ? zinipayEnabled
      ? "zinipay"
      : "bkash"
    : hasPhysical
      ? "cod"
      : "bkash";
  const paymentMethod = paymentTouched
    ? form.paymentMethod
    : defaultPaymentMethod;

  function choosePayment(value: FormState["paymentMethod"]) {
    update("paymentMethod", value);
    setPaymentTouched(true);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setServerError("");
  }

  function applyAddress(address: SavedAddress) {
    setForm((current) => ({
      ...current,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
    }));
    setErrors({});
    setServerError("");
  }

  const districtOptions = Array.from(
    new Set([...districts, ...savedAddresses.map((entry) => entry.district)]),
  );

  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) {
      setPromo(null);
      setPromoError("Enter a promo code first.");
      return;
    }

    setPromoLoading(true);
    setPromoError("");
    try {
      const response = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          items: lines.map((line) => ({
            slug: line.slug,
            quantity: line.quantity,
          })),
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        code?: string;
        description?: string;
        discount?: number;
      };
      if (!response.ok || !data.code || !data.discount) {
        throw new Error(data.message ?? "That code could not be applied.");
      }
      setPromo({
        code: data.code,
        description: data.description ?? "",
        discount: data.discount,
      });
      setPromoInput(data.code);
    } catch (error) {
      setPromo(null);
      setPromoError(
        error instanceof Error ? error.message : "That code could not be applied.",
      );
    } finally {
      setPromoLoading(false);
    }
  }

  function removePromo() {
    setPromo(null);
    setPromoInput("");
    setPromoError("");
  }

  function validate() {
    const next: Errors = {};
    if (form.fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Please enter a valid email address.";
    if (!normalizeBdPhone(form.phone))
      next.phone = "Use a valid 11-digit Bangladeshi mobile number.";
    if (form.address.trim().length < 10)
      next.address = "Please add a full delivery address.";
    if (form.city.trim().length < 2) next.city = "Please enter your town or area.";
    if (!form.district) next.district = "Please choose a district.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    if (requiresAccount) {
      router.push(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }

    if (!validate()) {
      const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          customerName: form.fullName,
          promoCode: promo?.code ?? null,
          items: lines.map((line) => ({
            slug: line.slug,
            quantity: line.quantity,
          })),
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        orderNumber?: string;
        paymentUrl?: string;
      };
      if (!response.ok || !data.orderNumber) {
        throw new Error(data.message ?? "The order could not be placed.");
      }
      clearCart();
      if (data.paymentUrl) {
        window.location.assign(data.paymentUrl);
        return;
      }
      router.push(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="container-wide py-16">
        <div className="skeleton h-16 w-2/3 rounded-2xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="skeleton h-[30rem] rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-wide flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <p className="eyebrow">Checkout</p>
        <h1 className="display-lg mt-3 text-ink">Your bag is still empty.</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Add a study tool before heading to checkout — your future focused
          self will thank you.
        </p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Explore the shop
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream pb-24 pt-8 sm:pt-10">
      <div className="container-wide">
        <div className="flex flex-col justify-between gap-6 border-b border-line pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Checkout · a clearer week is close</p>
            <h1 className="display-lg mt-3 text-ink">
              One last{" "}
              <span className="display-italic text-teal">detail.</span>
            </h1>
          </div>
          <nav aria-label="Checkout progress" className="flex items-center gap-1.5">
            {progressSteps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight className="size-3 text-muted/40" aria-hidden="true" />
                ) : null}
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em]",
                    index === 1
                      ? "bg-ink text-cream"
                      : index === 0
                        ? "text-teal"
                        : "text-muted",
                  )}
                >
                  {index === 0 ? (
                    <Check className="size-3" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  {step.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-start"
          noValidate
        >
          <div className="space-y-5">
            {requiresAccount ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-butter/60 bg-butter-soft/60 p-4 sm:flex-row sm:items-center">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-butter text-ink">
                  <UserRound className="size-4" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <p className="text-[0.76rem] font-bold text-ink">
                    Sign in to keep digital tools in your library.
                  </p>
                  <p className="mt-0.5 text-[0.68rem] leading-relaxed text-ink-soft/80">
                    Your email is {form.email || "not set yet"}. Sign in before
                    placing this order so access appears instantly.
                  </p>
                </div>
                <Link
                  href={`/login?next=${encodeURIComponent("/checkout")}`}
                  className="btn btn-primary btn-sm shrink-0"
                >
                  Sign in
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : null}

            <section className="paper-card p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-teal text-[0.62rem] font-extrabold text-cream">
                  01
                </span>
                <h2 className="font-display text-[1.35rem] tracking-[-0.02em] text-ink">
                  Contact
                </h2>
                <span className="ml-auto text-[0.6rem] text-muted">
                  {user ? "Signed in" : "Guest checkout"}
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="field-label">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(event) => update("fullName", event.target.value)}
                    className={cn("field", errors.fullName && "border-coral")}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  />
                  {errors.fullName ? (
                    <p id="fullName-error" className="mt-1.5 text-[0.66rem] font-medium text-coral">
                      {errors.fullName}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="email" className="field-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    className={cn("field", errors.email && "border-coral")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email ? (
                    <p id="email-error" className="mt-1.5 text-[0.66rem] font-medium text-coral">
                      {errors.email}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="field-label">
                    Mobile number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    className={cn("field", errors.phone && "border-coral")}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                  />
                  <p id="phone-hint" className="mt-1.5 text-[0.62rem] text-muted">
                    For delivery updates and access support.
                  </p>
                  {errors.phone ? (
                    <p id="phone-error" className="mt-1 text-[0.66rem] font-medium text-coral">
                      {errors.phone}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="paper-card p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-teal text-[0.62rem] font-extrabold text-cream">
                  02
                </span>
                <h2 className="font-display text-[1.35rem] tracking-[-0.02em] text-ink">
                  Delivery
                </h2>
                {!hasPhysical ? (
                  <span className="ml-auto rounded-full bg-teal-soft/60 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-teal">
                    Digital · no shipping
                  </span>
                ) : null}
              </div>
              {savedAddresses.length ? (
                <div className="mt-4 rounded-xl border border-line bg-paper p-3">
                  <p className="flex items-center gap-1.5 text-[0.56rem] font-extrabold uppercase tracking-[0.1em] text-muted">
                    <MapPin className="size-3 text-teal" aria-hidden="true" />
                    Saved addresses — fill in one click
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {savedAddresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => applyAddress(address)}
                        className="rounded-xl border border-line bg-surface px-3 py-2 text-left transition-colors hover:border-teal/50 hover:bg-teal-soft/20"
                      >
                        <span className="block text-[0.62rem] font-bold text-ink">
                          {address.label}
                          {address.isDefault ? " · default" : ""}
                        </span>
                        <span className="mt-0.5 block max-w-[14rem] truncate text-[0.56rem] text-muted">
                          {address.address}, {address.city}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="field-label">
                    Full address
                  </label>
                  <textarea
                    id="address"
                    rows={2}
                    autoComplete="street-address"
                    placeholder="House, road, area"
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                    className={cn("field min-h-20 resize-none", errors.address && "border-coral")}
                    aria-invalid={Boolean(errors.address)}
                  />
                  {errors.address ? (
                    <p className="mt-1.5 text-[0.66rem] font-medium text-coral">{errors.address}</p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="city" className="field-label">
                    Town / area
                  </label>
                  <input
                    id="city"
                    type="text"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    className={cn("field", errors.city && "border-coral")}
                    aria-invalid={Boolean(errors.city)}
                  />
                  {errors.city ? (
                    <p className="mt-1.5 text-[0.66rem] font-medium text-coral">{errors.city}</p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="district" className="field-label">
                    District
                  </label>
                  <select
                    id="district"
                    value={form.district}
                    onChange={(event) => update("district", event.target.value)}
                    className={cn("field", errors.district && "border-coral")}
                    aria-invalid={Boolean(errors.district)}
                  >
                    {districtOptions.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="field-label">
                    Order note <span className="normal-case text-muted">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={form.notes}
                    onChange={(event) => update("notes", event.target.value)}
                    placeholder="A gift note, delivery preference, anything useful."
                    className="field min-h-16 resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="paper-card p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-teal text-[0.62rem] font-extrabold text-cream">
                  03
                </span>
                <h2 className="font-display text-[1.35rem] tracking-[-0.02em] text-ink">
                  Payment
                </h2>
              </div>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {hasPhysical && !hasDigital ? (
                  <label
                    className={cn(
                      "relative flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors",
                      paymentMethod === "cod"
                        ? "border-teal bg-teal-soft/30"
                        : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => choosePayment("cod")}
                      className="mt-1 accent-[var(--teal)]"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-[0.78rem] font-bold text-ink">
                        <Banknote className="size-4 text-teal" aria-hidden="true" />
                        Cash on delivery
                      </span>
                      <span className="mt-1 block text-[0.64rem] leading-relaxed text-muted">
                        Pay when your parcel arrives.
                      </span>
                    </span>
                  </label>
                ) : null}
                {zinipayEnabled ? (
                  <label
                    className={cn(
                      "relative flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors",
                      paymentMethod === "zinipay"
                        ? "border-teal bg-teal-soft/30"
                        : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="zinipay"
                      checked={paymentMethod === "zinipay"}
                      onChange={() => choosePayment("zinipay")}
                      className="mt-1 accent-[var(--teal)]"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-[0.78rem] font-bold text-ink">
                        <ShieldCheck className="size-4 text-coral" aria-hidden="true" />
                        Pay online with ZiniPay
                      </span>
                      <span className="mt-1 block text-[0.64rem] leading-relaxed text-muted">
                        bKash, Nagad, Rocket or Upay on a secure hosted page.
                      </span>
                    </span>
                  </label>
                ) : (
                  <label
                    className={cn(
                      "relative flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors",
                      paymentMethod === "bkash"
                        ? "border-teal bg-teal-soft/30"
                        : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bkash"
                      checked={paymentMethod === "bkash"}
                      onChange={() => choosePayment("bkash")}
                      className="mt-1 accent-[var(--teal)]"
                    />
                    <span>
                      <span className="flex items-center gap-1.5 text-[0.78rem] font-bold text-ink">
                        <Smartphone className="size-4 text-coral" aria-hidden="true" />
                        bKash
                      </span>
                      <span className="mt-1 block text-[0.64rem] leading-relaxed text-muted">
                        We send payment instructions after you order.
                      </span>
                    </span>
                  </label>
                )}
              </div>
              {hasPhysical && hasDigital ? (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-paper px-3 py-2 text-[0.62rem] leading-relaxed text-muted">
                  <LockKeyhole className="mt-0.5 size-3 shrink-0 text-teal" aria-hidden="true" />
                  Your digital tools unlock as soon as payment is confirmed. Physical
                  items ship separately.
                </p>
              ) : null}
              {paymentMethod === "zinipay" ? (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-paper px-3 py-2 text-[0.62rem] leading-relaxed text-muted">
                  <LockKeyhole className="mt-0.5 size-3 shrink-0 text-teal" aria-hidden="true" />
                  You will be redirected to ZiniPay to finish payment. Your order is
                  only released after ZiniPay confirms it.
                </p>
              ) : null}
            </section>

            {serverError ? (
              <div
                role="alert"
                className="rounded-xl border border-coral/30 bg-coral/[0.08] px-4 py-3 text-[0.74rem] font-medium text-coral-deep"
              >
                {serverError}
              </div>
            ) : null}

            <div className="flex items-center gap-2 text-[0.62rem] text-muted">
              <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
              By placing this order you agree to our{" "}
              <Link href="/terms" className="font-semibold text-ink underline underline-offset-2">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2">
                privacy policy
              </Link>
              .
            </div>
          </div>

          <aside className="paper-card sticky top-[5.2rem] overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-4">
              <p className="font-display text-[1.25rem] tracking-[-0.02em] text-ink">
                Order summary
              </p>
              <Link
                href="/cart"
                className="flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-teal"
              >
                <ArrowLeft className="size-3" aria-hidden="true" />
                Edit bag
              </Link>
            </div>

            <div className="max-h-[18rem] overflow-y-auto px-5 py-4">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li key={line.slug} className="flex gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                      <ProductArt
                        product={{
                          title: line.title,
                          slug: line.slug,
                          format: line.format,
                          art_key: line.art_key,
                          palette: line.palette,
                          preview: line.image ? { images: [line.image] } : {},
                          includes: [],
                        }}
                      />
                      <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-ink text-[0.55rem] font-bold text-cream">
                        {line.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.76rem] font-semibold text-ink">
                        {line.title}
                      </p>
                      <p className="mt-0.5 text-[0.58rem] uppercase tracking-[0.06em] text-muted">
                        {line.format}
                      </p>
                      <p className="price mt-1 text-[0.7rem] font-semibold text-ink-soft">
                        {formatMoney(line.price * line.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-4 border-b border-line pb-4">
                <label
                  htmlFor="promo-code"
                  className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-muted"
                >
                  <TicketPercent className="size-3.5 text-teal" aria-hidden="true" />
                  Promo code
                </label>
                {promo ? (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-teal/20 bg-teal-soft/30 px-3 py-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[0.72rem] font-bold text-teal">
                        {promo.code}
                      </p>
                      <p className="truncate text-[0.58rem] text-muted">
                        {promo.description || "Discount applied"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="grid size-6 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white hover:text-coral"
                      aria-label="Remove promo code"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      id="promo-code"
                      value={promoInput}
                      onChange={(event) => {
                        setPromoInput(event.target.value.toUpperCase());
                        setPromoError("");
                      }}
                      placeholder="Enter code"
                      className="field !min-h-9 !py-1.5 font-mono text-[0.72rem] uppercase"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoLoading}
                      className="btn btn-outline btn-sm shrink-0"
                    >
                      {promoLoading ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      ) : null}
                      Apply
                    </button>
                  </div>
                )}
                {promoError ? (
                  <p className="mt-1.5 text-[0.62rem] font-medium text-coral" role="alert">
                    {promoError}
                  </p>
                ) : null}
              </div>

              <dl className="space-y-2.5 text-[0.78rem]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="price font-semibold">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="price font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-teal">Free</span>
                    ) : (
                      formatMoney(deliveryFee)
                    )}
                  </dd>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-teal">
                    <dt>Promo · {promo?.code}</dt>
                    <dd className="price font-semibold">−{formatMoney(discount)}</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={total}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="price font-display text-[1.55rem] font-semibold tracking-[-0.03em] text-ink"
                      >
                        {formatMoney(total)}
                      </motion.span>
                    </AnimatePresence>
                  </dd>
                </div>
              </dl>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg mt-5 w-full justify-between"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : requiresAccount ? (
                  <UserRound className="size-4" aria-hidden="true" />
                ) : (
                  <LockKeyhole className="size-4" aria-hidden="true" />
                )}
                {submitting
                  ? "Placing your order"
                  : requiresAccount
                    ? "Sign in to continue"
                    : paymentMethod === "zinipay"
                      ? `Pay securely · ${formatMoney(total)}`
                      : `Place order · ${formatMoney(total)}`}
                {!submitting && !requiresAccount ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : null}
              </button>
              <p className="mt-3 text-center text-[0.6rem] leading-relaxed text-muted">
                {paymentMethod === "cod"
                  ? "No payment needed now. Pay when the parcel arrives."
                  : paymentMethod === "zinipay"
                    ? "You will be redirected to ZiniPay's secure payment page."
                    : "We will send bKash payment instructions by email after the order."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-line bg-surface px-5 py-3">
              <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
              <p className="text-[0.6rem] font-semibold text-muted">
                Secure checkout · Real human support
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
