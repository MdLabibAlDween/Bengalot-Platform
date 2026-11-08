import { ArrowRight, ChevronRight, Layers, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { ProductArt } from "@/components/product/product-art";
import type { Category, Product } from "@/lib/types";
import { isLightHex } from "@/lib/color";

function ShopCollage({ products }: { products: Product[] }) {
  return (
    <div className="relative mx-auto hidden h-[21rem] w-full max-w-[24rem] sm:block">
      <div
        className="absolute left-[8%] top-[10%] h-[70%] w-[46%] rotate-[-8deg] overflow-hidden rounded-[1.2rem] border border-line shadow-[0_28px_55px_-30px_rgba(21,34,50,0.4)]"
        aria-hidden="true"
      >
        {products[0] ? <ProductArt product={products[0]} showCaption={false} /> : null}
      </div>
      <div
        className="absolute right-[4%] top-[2%] h-[76%] w-[48%] rotate-[7deg] overflow-hidden rounded-[1.2rem] border border-line shadow-[0_32px_60px_-28px_rgba(21,34,50,0.45)]"
        aria-hidden="true"
      >
        {products[1] ? <ProductArt product={products[1]} showCaption={false} /> : null}
      </div>
      <div
        className="absolute bottom-[2%] left-[28%] h-[54%] w-[44%] rotate-[-2deg] overflow-hidden rounded-[1.2rem] border border-line shadow-[0_24px_48px_-24px_rgba(21,34,50,0.45)]"
        aria-hidden="true"
      >
        {products[2] ? <ProductArt product={products[2]} showCaption={false} /> : null}
      </div>
      <span className="absolute -bottom-1 right-[6%] z-10 rotate-[4deg] rounded-full border border-line bg-cream px-3.5 py-2 text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-ink shadow-sm">
        10 considered tools
      </span>
    </div>
  );
}

export function ShopHero({
  category,
  products,
}: {
  category?: Category | null;
  products: Product[];
}) {
  if (category) {
    const representative =
      products.find((product) => product.category_slug === category.slug) ?? products[0];
    const darkText = !isLightHex(category.theme.ink);
    return (
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: category.theme.from,
          backgroundImage: `linear-gradient(135deg, ${category.theme.from}, ${category.theme.to})`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(${category.theme.ink} 0.7px, transparent 0.7px)`,
            backgroundSize: "18px 18px",
          }}
          aria-hidden="true"
        />
        <div className="container-wide relative grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div style={{ color: category.theme.ink }}>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.6rem] font-semibold opacity-60">
              <Link href="/" className="hover:opacity-100">Home</Link>
              <ChevronRight className="size-2.5" aria-hidden="true" />
              <Link href="/shop" className="hover:opacity-100">Shop</Link>
              <ChevronRight className="size-2.5" aria-hidden="true" />
              <span>{category.name}</span>
            </nav>
            <p className="mt-7 text-[0.61rem] font-extrabold uppercase tracking-[0.16em] opacity-65">
              Collection · {products.length} tools
            </p>
            <h1 className="display-xl mt-3 max-w-[13ch]">
              <MaskedLine immediate>{category.name}</MaskedLine>
            </h1>
            <p className="mt-3 max-w-[26rem] font-display text-[1.25rem] italic leading-snug opacity-80">
              {category.tagline}
            </p>
            <p className="mt-4 max-w-[28rem] text-[0.85rem] leading-[1.75] opacity-70">
              {category.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-current/20 bg-black/5 px-3 py-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.1em] opacity-75">
                {category.name_bn}
              </span>
              <span className="rounded-full border border-current/20 bg-black/5 px-3 py-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.1em] opacity-75">
                {products.some((p) => p.type === "physical") ? "Printed in Bangladesh" : "Instant digital access"}
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[24rem] sm:max-w-[28rem] lg:ml-auto lg:mr-0">
            <div className="absolute inset-6 rotate-[5deg] rounded-[1.6rem] border border-current/15" aria-hidden="true" />
            {representative ? (
              <div className="relative aspect-[4/3.2] rotate-[-2deg] overflow-hidden rounded-[1.6rem] border border-white/30 shadow-[0_36px_70px_-32px_rgba(0,0,0,0.55)] sm:aspect-[4/3.4]">
                <ProductArt product={representative} showCaption={false} />
              </div>
            ) : null}
            <div className="absolute -bottom-3 left-2 z-10 rotate-[-4deg] rounded-full bg-cream px-4 py-2 text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-ink shadow-lg">
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-coral" />
              {darkText ? "Print & paper" : "Made for focus"}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const collageProducts = [
    "notion-student-os",
    "english-vocabulary-cards",
    "bengalot-focus-timer",
  ]
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));

  return (
    <section className="relative overflow-hidden bg-cream">
      <div
        className="pointer-events-none absolute -left-32 top-6 size-[26rem] rounded-full bg-[radial-gradient(circle,rgba(216,208,231,0.6),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 size-[24rem] rounded-full bg-[radial-gradient(circle,rgba(243,201,95,0.22),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="container-wide relative grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.6rem] font-semibold text-muted">
            <Link href="/" className="hover:text-teal">Home</Link>
            <ChevronRight className="size-2.5" aria-hidden="true" />
            <span>Shop</span>
          </nav>
          <p className="eyebrow mt-7">The Bengalot shelf</p>
          <h1 className="display-xl mt-3 max-w-[13ch] text-ink">
            <MaskedLine immediate>Everything for</MaskedLine>
            <MaskedLine delay={0.08} immediate>
              <span className="display-italic text-coral">a clearer week.</span>
            </MaskedLine>
          </h1>
          <p className="mt-5 max-w-[30rem] text-[0.92rem] leading-[1.75] text-ink-soft">
            Ten considered tools for study, planning and focus. Open each one
            properly — see what is inside before you choose.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted">
              <Layers className="size-3.5 text-teal" aria-hidden="true" />
              5 collections
            </div>
            <div className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted">
              <Sparkles className="size-3.5 text-coral" aria-hidden="true" />
              Digital + physical
            </div>
            <div className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted">
              <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
              BDT pricing
            </div>
          </div>
          <Link href="#the-shelf" className="mt-6 inline-flex items-center gap-2 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-teal">
            Browse the shelf
            <ArrowRight className="size-3.5" />
          </Link>
          <div className="mt-7 grid grid-cols-3 gap-2 sm:hidden" aria-hidden="true">
            {collageProducts.map((product, index) => (
              <div
                key={product.id}
                className={`aspect-[3/3.7] overflow-hidden rounded-xl border border-line shadow-md ${
                  index === 0
                    ? "-rotate-2"
                    : index === 1
                      ? "translate-y-2 rotate-1"
                      : "-rotate-1"
                }`}
              >
                <ProductArt product={product} showCaption={false} />
              </div>
            ))}
          </div>
        </div>
        <Reveal delay={0.1}>
          <ShopCollage products={collageProducts} />
        </Reveal>
      </div>
    </section>
  );
}

