"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { ProductArt } from "@/components/product/product-art";
import { formatMoney } from "@/lib/utils";

const FREE_SHIPPING = 2000;

function EmptyBag() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-7 py-16 text-center">
      <div className="relative mb-7 h-32 w-36" aria-hidden="true">
        <div className="absolute inset-x-3 top-7 h-24 rotate-[-7deg] rounded-2xl border border-line bg-lavender-soft" />
        <div className="absolute inset-x-2 top-4 h-24 rotate-[5deg] rounded-2xl border border-line bg-butter-soft" />
        <div className="absolute inset-x-1 top-1 flex h-24 flex-col items-center justify-center rounded-2xl border border-line bg-surface shadow-lg">
          <span className="grid size-9 place-items-center rounded-full border border-line bg-cream font-display text-lg text-teal">
            B
          </span>
          <span className="mt-2 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-muted">
            Your bag
          </span>
        </div>
        <span className="absolute -right-1 top-0 grid size-8 place-items-center rounded-full bg-coral text-cream shadow-md">
          <ShoppingBag className="size-3.5" />
        </span>
      </div>
      <h2 className="font-display text-[1.8rem] leading-tight tracking-[-0.03em] text-ink">
        A little room for something good.
      </h2>
      <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">
        Your bag is empty. Start with a study card deck or a calmer workspace.
      </p>
      <Link
        href="/shop"
        className="btn btn-primary mt-6"
        onClick={() => {
          document.dispatchEvent(new CustomEvent("bengalot:close-cart"));
        }}
      >
        Explore the shop
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function CartDrawer() {
  const {
    lines,
    subtotal,
    count,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function onCloseRequest() {
      closeCart();
    }
    document.addEventListener("bengalot:close-cart", onCloseRequest);
    return () =>
      document.removeEventListener("bengalot:close-cart", onCloseRequest);
  }, [closeCart]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 120);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[95]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={closeCart}
            className="absolute inset-0 bg-navy/50 backdrop-blur-[3px]"
            aria-label="Close bag"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="absolute inset-y-0 right-0 flex w-full max-w-[28.5rem] flex-col bg-cream shadow-[-30px_0_80px_-30px_rgba(16,28,42,0.55)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="eyebrow eyebrow-no-dot text-[0.6rem]">Your bag</p>
                <p className="mt-1 font-display text-2xl tracking-[-0.03em] text-ink">
                  {count === 0 ? "Nothing yet" : `${count} little ${count === 1 ? "thing" : "things"}`}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                className="grid size-10 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-teal hover:text-teal"
                aria-label="Close bag"
              >
                <X className="size-4.5" aria-hidden="true" />
              </button>
            </div>

            {lines.length > 0 ? (
              <>
                <div className="border-b border-line bg-paper px-6 py-3.5">
                  <div className="flex items-center justify-between text-[0.67rem] font-semibold text-ink-soft">
                    <span className="flex items-center gap-1.5">
                      {remaining === 0 ? (
                        <>
                          <span className="grid size-4 place-items-center rounded-full bg-teal text-cream">
                            <Check className="size-2.5" />
                          </span>
                          Free delivery unlocked
                        </>
                      ) : (
                        <>
                          <span className="size-1.5 rounded-full bg-coral" />
                          {formatMoney(remaining)} away from free delivery
                        </>
                      )}
                    </span>
                    <span className="price text-muted">{formatMoney(FREE_SHIPPING)}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand">
                    <motion.div
                      className="h-full rounded-full bg-teal"
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
                  <ul className="divide-y divide-line">
                    <AnimatePresence initial={false}>
                      {lines.map((line) => (
                        <motion.li
                          key={line.slug}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="flex gap-4 py-5"
                        >
                          <Link
                            href={`/product/${line.slug}`}
                            onClick={closeCart}
                            className="size-[4.6rem] shrink-0 overflow-hidden rounded-xl"
                          >
                            <ProductArt
                              product={{
                                title: line.title,
                                slug: line.slug,
                                format: line.format,
                                art_key: line.art_key,
                                palette: line.palette,
                                preview: {},
                                includes: [],
                              }}
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <Link
                                  href={`/product/${line.slug}`}
                                  onClick={closeCart}
                                  className="font-display text-[1.05rem] leading-tight tracking-[-0.02em] text-ink hover:text-teal"
                                >
                                  {line.title}
                                </Link>
                                <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-muted">
                                  {line.format}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(line.slug)}
                                className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-coral/10 hover:text-coral"
                                aria-label={`Remove ${line.title}`}
                              >
                                <Trash2 className="size-3.5" aria-hidden="true" />
                              </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(line.slug, line.quantity - 1)
                                  }
                                  className="grid size-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-sand disabled:opacity-40"
                                  aria-label={`Decrease quantity of ${line.title}`}
                                >
                                  <Minus className="size-3" aria-hidden="true" />
                                </button>
                                <span className="min-w-5 text-center text-[0.78rem] font-semibold">
                                  {line.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(line.slug, line.quantity + 1)
                                  }
                                  className="grid size-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-sand"
                                  aria-label={`Increase quantity of ${line.title}`}
                                >
                                  <Plus className="size-3" aria-hidden="true" />
                                </button>
                              </div>
                              <p className="price text-[0.86rem] font-semibold text-ink">
                                {formatMoney(line.price * line.quantity)}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="border-t border-line bg-paper px-6 pb-6 pt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted">
                        Subtotal
                      </p>
                      <p className="mt-1 text-[0.68rem] text-muted">
                        Delivery calculated at checkout.
                      </p>
                    </div>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p
                        key={subtotal}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="price font-display text-2xl font-semibold tracking-[-0.03em] text-ink"
                      >
                        {formatMoney(subtotal)}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn btn-primary btn-lg mt-4 w-full justify-between"
                  >
                    Continue to checkout
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="text-[0.7rem] font-semibold text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors hover:text-teal"
                    >
                      View full bag
                    </Link>
                    <span className="text-muted">·</span>
                    <button
                      type="button"
                      onClick={closeCart}
                      className="text-[0.7rem] font-semibold text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors hover:text-teal"
                    >
                      Keep looking
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyBag />
            )}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
