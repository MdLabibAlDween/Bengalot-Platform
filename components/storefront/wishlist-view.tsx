"use client";

import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { JamdaniField } from "@/components/brand/ornaments";
import { BundleCard } from "@/components/bundle/bundle-card";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getBundle } from "@/lib/bundles";
import { getProduct, products } from "@/lib/data";
import { useWishlist } from "@/lib/providers";
import type { Bundle, Product } from "@/lib/types";

export function WishlistView() {
  const { slugs, hydrated, remove } = useWishlist();
  const productItems = slugs
    .map((slug) => getProduct(slug))
    .filter((product): product is Product => Boolean(product));
  const bundleItems = slugs
    .map((slug) => getBundle(slug))
    .filter((bundle): bundle is Bundle => Boolean(bundle));
  const total = productItems.length + bundleItems.length;

  if (!hydrated) {
    return (
      <div className="container-luxe py-14">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="container-luxe py-14 md:py-20">
        <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)] px-6 py-16 text-center md:py-24">
          <JamdaniField id="empty-wishlist" color="var(--color-magenta)" opacity={0.1} size={54} />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-rosewood/25 bg-rosewood/[0.05]">
            <Heart className="h-9 w-9 text-rosewood" strokeWidth={1.2} />
          </div>
          <p className="relative mt-6 font-display text-4xl">Nothing saved yet.</p>
          <p className="relative mx-auto mt-3 max-w-sm text-[0.84rem] leading-relaxed text-muted-foreground">
            Tap the heart on any piece to keep it here. We&apos;ll let you know if it goes on
            offer or comes back in stock.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href="/collections/new-arrivals">
                Find something to love <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/shop">Browse departments</Link>
            </Button>
          </div>
        </div>

        <div className="mt-14">
          <p className="eyebrow text-indigo">For when you find it</p>
          <h2 className="display-3 mt-2">A few we love.</h2>
          <ProductGrid className="mt-7">
            {products
              .filter((p) => p.sets.includes("best"))
              .slice(0, 4)
              .map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
          </ProductGrid>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxe py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-3 text-indigo">
            <span className="h-px w-8 bg-gold" /> Saved for later
          </p>
          <h1 className="display-2 mt-3">
            Your wishlist{" "}
            <span className="font-sans text-lg font-medium text-muted-foreground">
              ({total})
            </span>
          </h1>
          <p className="mt-2 max-w-md text-[0.8rem] leading-relaxed text-muted-foreground">
            Pieces you&apos;re considering. We&apos;ll quietly let you know if the price
            drops or stock runs low.
          </p>
        </div>
        <Link
          href="/collections/new-arrivals"
          className="group flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-gold-ink"
        >
          Keep exploring
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <ProductGrid className="mt-8">
        {bundleItems.map((bundle) => (
          <div key={bundle.slug}>
            <BundleCard bundle={bundle} />
            <button
              type="button"
              onClick={() => remove(bundle.slug)}
              className="mt-2 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 transition hover:text-rosewood hover:underline"
            >
              Remove outfit
            </button>
          </div>
        ))}
        {productItems.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </ProductGrid>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-gold/35 bg-gold/[0.05] p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <p className="text-[0.76rem] font-semibold">Wishlist alerts are on</p>
            <p className="mt-1 max-w-md text-[0.66rem] leading-relaxed text-muted-foreground">
              We&apos;ll only email you about saved pieces when something useful happens —
              a price drop or a return to stock. No noise.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => slugs.forEach((slug) => remove(slug))}
          className="text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-rosewood hover:underline"
        >
          Clear wishlist
        </button>
      </div>

      <div className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-indigo">Complete the collection</p>
            <h2 className="display-3 mt-2">You may also love.</h2>
          </div>
          <Link
            href="/collections/best-sellers"
            className="hidden text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-gold-ink sm:block"
          >
            Browse all pieces
          </Link>
        </div>
        <ProductGrid className="mt-7">
          {products
            .filter((p) => !slugs.includes(p.slug))
            .slice(0, 4)
            .map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
        </ProductGrid>
      </div>
    </div>
  );
}
