"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { GiftCardArt } from "@/components/gift-cards/gift-card-art";
import { Input } from "@/components/ui/input";
import { formatGiftCardCode } from "@/lib/gift-cards";
import { formatBDT } from "@/lib/utils";

type CheckedCard = {
  code: string;
  amount: number;
  balance: number;
  status: string;
  expiresAt: string;
  recipientName: string;
};

export function GiftCardBalance() {
  const [code, setCode] = useState("");
  const [card, setCard] = useState<CheckedCard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    const response = await fetch("/api/gift-cards/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !result.giftCard) {
      setCard(null);
      setError(result.error ?? "We could not find that code. Check the spelling and try again.");
      return;
    }
    setCard(result.giftCard as CheckedCard);
    setError("");
  };

  const status = card?.status ?? null;
  const statusTone =
    status === "active"
      ? "bg-jade/10 text-jade"
      : status === "expired"
        ? "bg-rosewood/10 text-rosewood"
        : "bg-[var(--muted)] text-muted-foreground";

  return (
    <section id="balance" className="scroll-mt-28 border-y border-[var(--color-border)] bg-[var(--color-sand)] py-12 md:py-16">
      <div className="container-luxe grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
        <div>
          <p className="eyebrow text-indigo">Already have one?</p>
          <h2 className="display-2 mt-3 max-w-md">
            Check the <span className="italic text-gold-ink">balance.</span>
          </h2>
          <p className="mt-3 max-w-md text-[0.84rem] leading-relaxed text-muted-foreground">
            Enter the code from the card to see its remaining value and expiry. Apply the same
            code at checkout to use it.
          </p>
          <p className="mt-5 flex items-start gap-2 text-[0.66rem] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jade" />
            Cards are checked securely against the Bengalot gift-card database.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7">
          <form onSubmit={check} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError("");
              }}
              placeholder="BG-GIFT-XXXX-XXXX"
              aria-label="Gift card code"
              className="font-mono tracking-[0.08em]"
            />
            <button
              type="submit"
              disabled={loading}
              className="cta-primary inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em] disabled:opacity-60"
            >
              <Search className="h-3.5 w-3.5" /> {loading ? "Checking…" : "Check"}
            </button>
          </form>
          {error && <p className="mt-2 text-[0.64rem] text-rosewood">{error}</p>}

          {card && (
            <div className="mt-5 grid gap-4 sm:grid-cols-[0.85fr_1.15fr] sm:items-start">
              <GiftCardArt
                amount={card.amount}
                recipient={card.recipientName}
                code={card.code}
                tone="teal"
                compact
              />
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[0.52rem] font-bold uppercase tracking-[0.12em] ${statusTone}`}
                >
                  {status}
                </span>
                <p className="mt-3 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Remaining balance
                </p>
                <p className="font-display text-3xl tabular-nums">
                  {formatBDT(card.balance)}
                </p>
                <dl className="mt-3 space-y-1.5 text-[0.7rem]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Card value</dt>
                    <dd className="tabular-nums">{formatBDT(card.amount)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Expires</dt>
                    <dd>
                      {new Date(card.expiresAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">For</dt>
                    <dd className="truncate">{card.recipientName}</dd>
                  </div>
                </dl>
                {status === "active" && (
                  <Link
                    href="/checkout"
                    className="mt-4 inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-indigo hover:text-magenta"
                  >
                    Use at checkout <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                <p className="mt-3 font-mono text-[0.6rem] text-muted-foreground">
                  {formatGiftCardCode(card.code)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
