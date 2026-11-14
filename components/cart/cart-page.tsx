"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { ProductArt } from "@/components/product/product-art";
import { formatMoney } from "@/lib/utils";

const FREE_SHIPPING = 2000;

function EmptyCart() {
  return (
    <div className="container-wide pb-24 pt-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-cream px-6 py-16 text-center sm:px-12">
        <div className="relative mx-auto h-40 w-52" aria-hidden="true">
          <div className="absolute left-2 top-9 h-28 w-36 -rotate-[9deg] rounded-2xl bg-lavender" />
          <div className="absolute right-2 top-6 h-28 w-36 rotate-[8deg] rounded-2xl bg-butter-soft" />
          <div className="absolute left-1/2 top-2 flex h-28 w-40 -translate-x-1/2 flex-col items-center justify-center rounded-2xl border border-line bg-surface shadow-xl">
            <span className="grid size-9 place-items-center rounded-full border border-line bg-cream font-display text-lg text-teal">
              B
            </span>
            <span className="mt-2 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-muted">
              Your bag
            </span>
          </div>
          <span className="absolute right-10 top-0 grid size-9 place-items-center rounded-full bg-coral text-cream shadow-lg">
            <ShoppingBag className="size-4" aria-hidden="true" />
          </span>
        </div>
        <h2 className="mt-8 font-display text-[2.2rem] leading-[1.02] tracking-[-0.035em] text-ink">
          A little room for something good.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Your bag is empty. Begin with a deck of study cards, a calmer Notion
          workspace, or the complete Student Starter Bundle.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link href="/shop" className="btn btn-primary">
            Explore the shop
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/product/student-starter-bundle" className="btn btn-outline">
            Meet the starter bundle
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const { lines, subtotal, count, updateQuantity, removeItem, hydrated } =
    useCart();
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  if (!hydrated) {
    return (
      <div className="container-wide py-16">
        <div className="skeleton h-12 w-72 rounded-xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {[0, 1].map((item) => (
              <div key={item} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <>
        <div className="container-wide pb-2 pt-10 sm:pt-14">
          <p className="eyebrow">Your bag</p>
          <h1 className="display-lg mt-3 text-ink">Nothing here yet.</h1>
        </div>
        <EmptyCart />
      </>
    );
  }

  return (
    <div className="bg-cream pb-24 pt-8 sm:pt-12">
      <div className="container-wide">
        <div className="flex flex-col gap-4 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Your bag</p>
            <h1 className="display-lg mt-3 text-ink">
              {count} {count === 1 ? "thing" : "things"},{" "}
              <span className="display-italic text-teal">considered.</span>
            </h1>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-teal"
          >
            Keep browsing
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="border-y border-line">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.div
                    key={line.slug}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 24, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-4 border-b border-line py-5 last:border-b-0 sm:gap-5"
                  >
                    <Link
                      href={`/product/${line.slug}`}
                      className="size-[6.2rem] shrink-0 overflow-hidden rounded-[1.1rem] sm:size-[7.4rem]"
                    >
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
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.56rem] font-bold uppercase tracking-[0.11em] text-muted">
                            {line.format}
                          </p>
                          <Link
                            href={`/product/${line.slug}`}
                            className="mt-1 block font-display text-[1.25rem] leading-tight tracking-[-0.025em] text-ink transition-colors hover:text-teal sm:text-[1.45rem]"
                          >
                            {line.title}
                          </Link>
                          <p className="mt-1.5 text-[0.66rem] text-muted">
                            {line.type === "physical"
                              ? "Ships in 2–4 days"
                              : "Instant access after payment"}
                          </p>
                        </div>
                        <p className="price shrink-0 font-display text-[1.05rem] font-semibold text-ink">
                          {formatMoney(line.price * line.quantity)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(line.slug, line.quantity - 1)
                            }
                            className="grid size-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-sand"
                            aria-label={`Decrease quantity of ${line.title}`}
                          >
                            <Minus className="size-3" aria-hidden="true" />
                          </button>
                          <span className="min-w-6 text-center text-[0.78rem] font-semibold">
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
                        <button
                          type="button"
                          onClick={() => removeItem(line.slug)}
                          className="flex items-center gap-1.5 text-[0.62rem] font-semibold text-muted transition-colors hover:text-coral"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5">
              <span className="grid size-8 place-items-center rounded-full bg-teal/10 text-teal">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <p className="text-[0.72rem] leading-relaxed text-ink-soft">
                <span className="font-bold">Changed your mind?</span> Physical
                items can be exchanged within 7 days. Digital access is
                non-refundable once opened.
              </p>
            </div>
          </div>

          <aside className="paper-card sticky top-[5.2rem] overflow-hidden p-0">
            <div className="border-b border-line bg-paper px-6 py-5">
              <p className="eyebrow eyebrow-no-dot !text-[0.6rem]">Order summary</p>
              <p className="mt-2 font-display text-2xl tracking-[-0.03em] text-ink">
                The useful part.
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="mb-4 rounded-xl bg-paper px-3.5 py-3">
                <div className="flex items-center justify-between gap-3 text-[0.64rem] font-semibold text-ink-soft">
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
                        {formatMoney(remaining)} from free delivery
                      </>
                    )}
                  </span>
                  <span className="price text-muted">{formatMoney(subtotal)}</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-teal transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <dl className="space-y-3 text-[0.8rem]">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="price font-semibold text-ink">
                    {formatMoney(subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="text-[0.72rem] font-medium text-muted">
                    Calculated at checkout
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <dt className="font-semibold text-ink">Estimated total</dt>
                  <dd className="price font-display text-[1.35rem] font-semibold text-ink">
                    {formatMoney(subtotal + (remaining === 0 ? 0 : 130))}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-right text-[0.62rem] text-muted">
                {remaining === 0 ? "Delivery is free." : "From ৳70 inside Faridpur."}
              </p>

              <Link
                href="/checkout"
                className="btn btn-primary btn-lg mt-5 w-full justify-between"
              >
                Continue to checkout
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <div className="mt-4 flex items-center justify-center gap-2">
                <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
                <p className="text-[0.62rem] font-medium text-muted">
                  Secure checkout · Cash on delivery available
                </p>
              </div>
            </div>
            <div className="border-t border-line bg-surface px-6 py-4">
              <div className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-muted">
                <span className="size-1.5 rounded-full bg-butter" />
                Need help choosing?
                <a
                  href="https://wa.me/8801341739202"
                  className="ml-auto text-teal"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp →
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
