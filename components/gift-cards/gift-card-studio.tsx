"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { GiftCardArt } from "@/components/gift-cards/gift-card-art";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select, Textarea } from "@/components/ui/input";
import type { GiftCardDelivery } from "@/lib/gift-cards";
import type { GiftCardSettings } from "@/lib/admin/settings";
import { cn, formatBDT } from "@/lib/utils";

const emptyForm = {
  recipientName: "",
  recipientContact: "",
  senderName: "",
  message: "",
  delivery: "whatsapp" as GiftCardDelivery,
  accepted: false,
  website: "",
};

type SubmittedRequest = {
  reference: string;
  amount: number;
  recipientName: string;
  recipientContact: string;
  senderName: string;
  message: string;
  delivery: GiftCardDelivery;
};

export function GiftCardStudio({ settings }: { settings: GiftCardSettings }) {
  const denominations = settings.denominations.length
    ? settings.denominations
    : [1000, 2000, 5000, 10000];
  const minAmount = settings.minAmount;
  const maxAmount = settings.maxAmount;
  const [amount, setAmount] = useState<number>(denominations[0] ?? 2000);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({
    ...emptyForm,
    delivery: (settings.deliveryMethods[0] ?? "whatsapp") as GiftCardDelivery,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [request, setRequest] = useState<SubmittedRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const effectiveAmount = useMemo(() => {
    if (!customAmount.trim()) return amount;
    const parsed = Number(customAmount);
    return Number.isFinite(parsed) ? Math.round(parsed) : 0;
  }, [amount, customAmount]);

  const set = (key: keyof typeof emptyForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (effectiveAmount < minAmount || effectiveAmount > maxAmount) {
      next.amount = `Choose between ${formatBDT(minAmount)} and ${formatBDT(maxAmount)}.`;
    }
    if (form.recipientName.trim().length < 2) next.recipientName = "Add the recipient's name.";
    if (form.delivery === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientContact.trim())) {
        next.recipientContact = "Add a valid email address.";
      }
    } else if (!/^01[3-9]\d{8}$/.test(form.recipientContact.replace(/\D/g, ""))) {
      next.recipientContact = "Add a valid Bangladeshi WhatsApp number (01XXXXXXXXX).";
    }
    if (form.senderName.trim().length < 2) next.senderName = "Add your name.";
    if (form.message.length > 180) next.message = "Keep the message under 180 characters.";
    if (!form.accepted) next.accepted = "Please accept the gift-card terms.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("A few details need your attention.");
      return;
    }
    setSubmitting(true);
    const response = await fetch("/api/gift-cards/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: effectiveAmount,
        recipientName: form.recipientName,
        recipientContact:
          form.delivery === "whatsapp"
            ? form.recipientContact.replace(/\D/g, "")
            : form.recipientContact,
        senderName: form.senderName,
        message: form.message,
        delivery: form.delivery,
        website: form.website,
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSubmitting(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not send the gift card request.");
      return;
    }
    setRequest({
      reference: result.reference,
      amount: effectiveAmount,
      recipientName: form.recipientName,
      recipientContact: form.recipientContact,
      senderName: form.senderName,
      message: form.message,
      delivery: form.delivery,
    });
    setCopied(false);
    toast.success("Gift card request received", {
      description: "We will contact you to arrange payment and issuance.",
    });
    window.setTimeout(() => {
      document.getElementById("gift-card-ready")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const copyReference = async () => {
    if (!request) return;
    try {
      await navigator.clipboard.writeText(request.reference);
      setCopied(true);
      toast.success("Request reference copied");
    } catch {
      toast.error(`Request reference: ${request.reference}`);
    }
  };

  const reset = () => {
    setRequest(null);
    setCustomAmount("");
    setAmount(denominations[0] ?? 2000);
    setForm(emptyForm);
    setErrors({});
  };

  const whatsappLink = request
    ? `https://wa.me/8801341739202?text=${encodeURIComponent(
        [
          `Hello Bengalot! I have requested a gift card.`,
          `Reference: ${request.reference}`,
          `Value: ${formatBDT(request.amount)}`,
          `Recipient: ${request.recipientName}`,
          `Delivery: ${request.delivery}`,
          `Contact: ${request.recipientContact}`,
          request.message ? `Message: ${request.message}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      )}`
    : "#";

  if (request) {
    return (
      <div id="gift-card-ready" className="scroll-mt-28">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <GiftCardArt
            amount={request.amount}
            recipient={request.recipientName}
            code={request.reference}
            tone="indigo"
          />
          <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-jade/10 px-3 py-1 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-jade">
              <Check className="h-3 w-3" /> Request received
            </span>
            <h2 className="mt-4 font-display text-[2rem] leading-none">
              We will take it from here.
            </h2>
            <p className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
              We will contact you on {request.delivery === "whatsapp" ? "WhatsApp" : "email"} to
              arrange payment. Once payment is confirmed, we will issue the code and send it to{" "}
              {request.recipientName}. No payment has been taken on this page.
            </p>

            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-4">
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Request reference
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-lg font-bold tracking-[0.08em]">
                  {request.reference}
                </p>
                <button
                  type="button"
                  onClick={copyReference}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] transition hover:border-indigo hover:bg-indigo hover:text-ivory"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
              <button
                type="button"
                onClick={reset}
                className="cta-secondary inline-flex h-11 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Request another
              </button>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[0.62rem] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jade" />
              Gift cards are valid for one year from issue, cannot be exchanged for cash and
              can be redeemed at checkout.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <form
        onSubmit={submit}
        noValidate
        className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-indigo">Choose an amount</p>
            <h2 className="mt-1 font-display text-[2rem] leading-none">Make it theirs.</h2>
          </div>
          <ShieldCheck className="h-6 w-6 text-jade" aria-hidden="true" />
        </div>

        <div className="mt-4 rounded-xl border border-jade/20 bg-jade/[0.04] p-3 text-[0.64rem] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-jade">
            {settings.mode === "physical" ? "Physical gift card · Cash on Delivery" : "Virtual gift card · pay online"}
          </p>
          <p className="mt-1">
            {settings.mode === "physical"
              ? settings.physicalNote
              : settings.virtualEnabled
                ? settings.virtualNote
                : "Virtual gift cards are being prepared. Submit a request and our team will confirm the available payment method."}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {denominations.map((value) => {
            const active = !customAmount && amount === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAmount(value);
                  setCustomAmount("");
                  setErrors((current) => ({ ...current, amount: "" }));
                }}
                className={cn(
                  "rounded-xl border px-2 py-3 text-sm font-semibold tabular-nums transition",
                  active
                    ? "border-indigo bg-indigo text-ivory shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-indigo"
                )}
              >
                {formatBDT(value)}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <Label htmlFor="gift-amount">Or enter a custom amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ৳
            </span>
            <Input
              id="gift-amount"
              inputMode="numeric"
              value={customAmount}
              onChange={(event) => {
                setCustomAmount(event.target.value.replace(/[^\d]/g, ""));
                setErrors((current) => ({ ...current, amount: "" }));
              }}
              placeholder={`${minAmount}–${maxAmount}`}
              className="pl-7"
              aria-invalid={Boolean(errors.amount)}
            />
          </div>
          {errors.amount ? (
            <p className="mt-1 text-[0.6rem] text-rosewood">{errors.amount}</p>
          ) : (
            <p className="mt-1 text-[0.58rem] text-muted-foreground">
              Between {formatBDT(minAmount)} and {formatBDT(maxAmount)}.
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <p className="eyebrow text-indigo">Who is it for?</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="gift-recipient">Recipient name *</Label>
              <Input
                id="gift-recipient"
                value={form.recipientName}
                onChange={(event) => set("recipientName", event.target.value)}
                placeholder="Their name"
                aria-invalid={Boolean(errors.recipientName)}
              />
              {errors.recipientName && (
                <p className="mt-1 text-[0.6rem] text-rosewood">{errors.recipientName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="gift-delivery">Delivery</Label>
              <Select
                id="gift-delivery"
                value={form.delivery}
                onChange={(event) => {
                  set("delivery", event.target.value as GiftCardDelivery);
                  set("recipientContact", "");
                }}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="gift-contact">
                {form.delivery === "whatsapp" ? "Recipient WhatsApp *" : "Recipient email *"}
              </Label>
              <Input
                id="gift-contact"
                type={form.delivery === "email" ? "email" : "tel"}
                inputMode={form.delivery === "email" ? "email" : "numeric"}
                value={form.recipientContact}
                onChange={(event) => set("recipientContact", event.target.value)}
                placeholder={form.delivery === "whatsapp" ? "01XXXXXXXXX" : "name@example.com"}
                aria-invalid={Boolean(errors.recipientContact)}
              />
              {errors.recipientContact && (
                <p className="mt-1 text-[0.6rem] text-rosewood">{errors.recipientContact}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="gift-sender">Your name *</Label>
              <Input
                id="gift-sender"
                value={form.senderName}
                onChange={(event) => set("senderName", event.target.value)}
                placeholder="Who is it from?"
                aria-invalid={Boolean(errors.senderName)}
              />
              {errors.senderName && (
                <p className="mt-1 text-[0.6rem] text-rosewood">{errors.senderName}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="gift-message">
                Message{" "}
                <span className="normal-case tracking-normal text-muted-foreground">
                  ({180 - form.message.length} left)
                </span>
              </Label>
              <Textarea
                id="gift-message"
                value={form.message}
                onChange={(event) => set("message", event.target.value.slice(0, 180))}
                placeholder="A small note to go with the card."
                className="min-h-24"
                aria-invalid={Boolean(errors.message)}
              />
              {errors.message && (
                <p className="mt-1 text-[0.6rem] text-rosewood">{errors.message}</p>
              )}
            </div>
          </div>
        </div>

        <label className="mt-5 flex items-start gap-3 text-[0.68rem] leading-relaxed text-muted-foreground">
          <Checkbox
            checked={form.accepted}
            onChange={(event) => set("accepted", event.target.checked)}
            aria-invalid={Boolean(errors.accepted)}
          />
          <span>
            I understand gift cards are issued after payment, valid for one year, cannot be
            exchanged for cash and can be redeemed at checkout.
          </span>
        </label>
        {errors.accepted && (
          <p className="mt-1 text-[0.6rem] text-rosewood">{errors.accepted}</p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Gift card value
            </p>
            <p className="font-display text-2xl tabular-nums">{formatBDT(effectiveAmount || 0)}</p>
          </div>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={submitting || (settings.mode === "virtual" && !settings.virtualEnabled)}
          >
            {submitting ? "Sending request…" : "Request gift card"}
          </Button>
        </div>
        <p className="mt-3 text-center text-[0.55rem] leading-relaxed text-muted-foreground/70 sm:text-left">
          No payment is taken here. Our team confirms payment and issues the code.
        </p>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={form.website}
          onChange={(event) => set("website", event.target.value)}
          className="absolute h-0 w-0 overflow-hidden opacity-0"
        />
      </form>

      <div className="relative">
        <div className="lg:sticky lg:top-28">
          <GiftCardArt
            amount={effectiveAmount || minAmount}
            recipient={form.recipientName || "Someone special"}
            code="BG-GIFT-PREVIEW"
            tone="indigo"
          />
          <div className="mt-4 grid gap-2 text-[0.66rem] leading-relaxed text-muted-foreground">
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              Delivered by WhatsApp or email once issued.
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jade" />
              Valid for one year. Redeemable at checkout across the collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
