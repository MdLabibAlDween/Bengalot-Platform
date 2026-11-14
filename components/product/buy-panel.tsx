"use client";

import { Check, Loader2, Minus, Plus, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { toCartLine } from "@/components/cart/add-to-cart-button";
import { useCart } from "@/components/cart/cart-provider";
import { isBundleProduct } from "@/lib/bundles";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function BuyPanel({ product }: { product: Product }) {
  const { addItem, closeCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const router = useRouter();
  const isPhysical = product.type === "physical";
  const isBundle = isBundleProduct(product);
  const soldOut = isPhysical && product.stock <= 0;

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  function handleAdd() {
    addItem(toCartLine(product), quantity);
    setAdded(true);
  }

  function handleBuyNow() {
    setBuying(true);
    addItem(toCartLine(product), quantity);
    closeCart();
    router.push("/checkout");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <p className="price font-display text-[2.4rem] leading-none tracking-[-0.045em] text-ink">
          {formatMoney(product.price)}
        </p>
        {product.compare_at ? (
          <>
            <p className="price pb-1 text-[0.95rem] text-muted line-through">
              {formatMoney(product.compare_at)}
            </p>
            <span className="mb-1 rounded-full bg-white px-2.5 py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.08em] text-coral-deep ring-1 ring-coral/20">
              Save {formatMoney(product.compare_at - product.price)}
            </span>
          </>
        ) : null}
      </div>
      <p className="mt-1.5 text-[0.68rem] font-medium text-muted">
        {isPhysical
          ? isBundle
            ? `In stock · ships in 2–4 days · digital tools unlock after payment`
            : `In stock · ships in 2–4 days · ${product.stock} available`
          : "Digital access opens after payment confirmation"}
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {isPhysical ? (
          <div className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted">
              Quantity
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                className="grid size-7 place-items-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-teal hover:text-teal disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3" aria-hidden="true" />
              </button>
              <span className="min-w-8 text-center text-[0.82rem] font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(10, current + 1))}
                disabled={quantity >= 10}
                className="grid size-7 place-items-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-teal hover:text-teal disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="size-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className={`btn btn-primary btn-lg w-full justify-between ${added ? "!bg-teal" : ""}`}
        >
          <span className="flex items-center gap-2">
            {added ? (
              <Check className="size-4.5" aria-hidden="true" />
            ) : (
              <Plus className="size-4.5" aria-hidden="true" />
            )}
            <span aria-live="polite">
              {soldOut ? "Sold out" : added ? "Added to your bag" : "Add to bag"}
            </span>
          </span>
          <span className="price text-[0.82rem] font-semibold opacity-70">
            {formatMoney(product.price * quantity)}
          </span>
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={soldOut || buying}
          className="btn btn-coral btn-lg w-full justify-center"
        >
          {buying ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Zap className="size-4" aria-hidden="true" />
          )}
          {buying ? "Taking you to checkout" : "Buy it now"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-start gap-2 rounded-xl border border-line bg-paper px-3 py-2.5">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
          <div>
            <p className="text-[0.62rem] font-bold text-ink">Secure checkout</p>
            <p className="mt-0.5 text-[0.56rem] leading-relaxed text-muted">
              {isPhysical ? "Cash on delivery or bKash" : "bKash · manual confirmation"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-line bg-paper px-3 py-2.5">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-coral" aria-hidden="true" />
          <div>
            <p className="text-[0.62rem] font-bold text-ink">
              {isPhysical ? "Packed with care" : "Instant access"}
            </p>
            <p className="mt-0.5 text-[0.56rem] leading-relaxed text-muted">
              {isPhysical
                ? isBundle
                  ? "Ships, then unlocks in your library"
                  : "Checked before dispatch"
                : "In your library after payment"}
            </p>
          </div>
        </div>
      </div>

      {isBundle && isPhysical ? (
        <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-[0.6rem] leading-relaxed text-muted">
          Printed items in this bundle ship to you. Digital components are added
          to your library after payment.
        </p>
      ) : null}
    </div>
  );
}
