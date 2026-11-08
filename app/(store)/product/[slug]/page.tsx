import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Layers,
  MessageCircle,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { BuyPanel } from "@/components/product/buy-panel";
import { FlashcardPreview } from "@/components/product/flashcard-preview";
import { MobileBuyBar } from "@/components/product/mobile-buy-bar";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductArt } from "@/components/product/product-art";
import {
  ProductReviews,
  RelatedProducts,
} from "@/components/product/product-sections";
import { Accordion } from "@/components/ui/accordion";
import {
  getCatalog,
  getRelatedProducts,
  getReviewsForProduct,
} from "@/lib/data/catalog";
import snapshot from "@/lib/data/snapshot.json";
import { formatMoney } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (snapshot.products as { slug: string }[]).map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) return {};

  return {
    title: product.title,
    description: `${product.subtitle} ${product.format}. ${product.type === "physical" ? "Delivered across Bangladesh." : "Instant access after payment."}`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.title} · Bengalot`,
      description: product.subtitle,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug);

  if (!product) notFound();

  const category = catalog.categories.find(
    (item) => item.slug === product.category_slug,
  );
  const reviews = getReviewsForProduct(catalog, product.id);
  const related = getRelatedProducts(catalog, product);
  const isFlashcards = (product.preview as { kind?: string }).kind === "flashcards";
  const isPhysical = product.type === "physical";
  const savings = product.compare_at
    ? product.compare_at - product.price
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.sku,
    category: category?.name,
    brand: { "@type": "Brand", name: "Bengalot" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating),
      reviewCount: product.review_count,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.price,
      availability: isPhysical
        ? product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `https://bengalot.com/product/${product.slug}`,
    },
  };

  return (
    <article className="pb-16 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-cream">
        <div className="container-wide flex items-center gap-1.5 py-4 text-[0.6rem] font-semibold text-muted">
          <Link href="/" className="transition-colors hover:text-teal">
            Home
          </Link>
          <ChevronRight className="size-2.5" aria-hidden="true" />
          <Link href="/shop" className="transition-colors hover:text-teal">
            Shop
          </Link>
          <ChevronRight className="size-2.5" aria-hidden="true" />
          {category ? (
            <>
              <Link
                href={`/shop/${category.slug}`}
                className="transition-colors hover:text-teal"
              >
                {category.name}
              </Link>
              <ChevronRight className="size-2.5" aria-hidden="true" />
            </>
          ) : null}
          <span className="truncate text-ink-soft">{product.title}</span>
        </div>

        <div className="container-wide grid gap-8 pb-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
          <div>
            <ProductGallery product={product} />
          </div>

          <div className="lg:py-2">
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                <Link
                  href={`/shop/${category.slug}`}
                  className="chip !border-teal/20 !bg-teal-soft/40 !text-teal"
                >
                  {category.name}
                </Link>
              ) : null}
              <span className="chip">
                {isPhysical
                  ? "Physical · ships"
                  : product.type === "bundle"
                    ? "Digital bundle"
                    : "Digital · instant access"}
              </span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.6rem,4.4vw,4.1rem)] font-medium leading-[0.92] tracking-[-0.05em] text-ink">
              {product.title}
            </h1>
            {product.title_bn ? (
              <p lang="bn" className="font-bangla mt-2 text-[1.08rem] font-medium text-teal">
                {product.title_bn}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 text-coral" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} className="size-3.5 fill-current" />
                  ))}
                </span>
                <span className="text-[0.7rem] font-semibold text-ink-soft">
                  {Number(product.rating).toFixed(1)}
                </span>
                <span className="text-[0.66rem] text-muted">
                  ({product.review_count} reviews)
                </span>
              </span>
              <span className="h-3.5 w-px bg-line" aria-hidden="true" />
              <span className="text-[0.66rem] font-semibold text-muted">
                {product.format}
              </span>
            </div>

            <p className="mt-5 max-w-[33rem] text-[0.95rem] leading-[1.8] text-ink-soft">
              {product.subtitle}
            </p>

            <div className="mt-6 border-t border-line pt-5">
              <BuyPanel product={product} />
              {savings > 0 ? (
                <p className="mt-3 flex items-center gap-1.5 text-[0.65rem] font-semibold text-teal">
                  <Check className="size-3.5" aria-hidden="true" />
                  You are saving {formatMoney(savings)} on this tool.
                </p>
              ) : null}
            </div>

            <div className="mt-7 rounded-[1.2rem] border border-line bg-surface p-5">
              <p className="eyebrow eyebrow-no-dot !text-[0.6rem]">
                What you get
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-3.5 shrink-0 text-teal"
                      aria-hidden="true"
                    />
                    <span className="text-[0.76rem] leading-snug text-ink-soft">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <Accordion title="How it works" defaultOpen>
                <p>{product.description}</p>
                <p className="mt-3">
                  {isPhysical
                    ? "Your order is checked and packed by hand before it leaves the studio. Delivery is usually 2–4 working days across Bangladesh."
                    : "After payment is confirmed, this resource is added to your personal library. You can return to it whenever you need it — no expiry date."}
                </p>
              </Accordion>
              <Accordion title="Delivery & access">
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <Truck className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                    {isPhysical
                      ? "Ships from Saltha, Faridpur. ৳70 inside Faridpur district, ৳130 elsewhere. Free delivery above ৳2,000."
                      : "Digital access is delivered to your account library after payment. You will also receive an email receipt."}
                  </p>
                  <p className="flex items-start gap-2">
                    <Download className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                    {isPhysical
                      ? "Cash on delivery is available. You can also pay with bKash at checkout."
                      : "If a link or download ever stops working, contact support and we will reset it for you."}
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                    Secure checkout · your details are never shared.
                  </p>
                </div>
              </Accordion>
              <Accordion title="Requirements">
                <ul className="space-y-1.5">
                  {product.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-coral" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="Refund note">
                {isPhysical
                  ? "If something arrives damaged or is not what you ordered, contact us within 48 hours of delivery and we will make it right. Items should be unused and in their original packaging."
                  : "Digital resources are non-refundable once access has been opened, because the file or template cannot be returned. If a link is broken, we will repair or replace it."}
              </Accordion>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
              <MessageCircle className="size-4 text-teal" aria-hidden="true" />
              <p className="flex-1 text-[0.68rem] leading-relaxed text-muted">
                A question before you buy?
              </p>
              <a
                href="https://wa.me/8801341739202"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-teal"
              >
                WhatsApp us →
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden bg-ivory py-16 sm:py-20">
        <div
          className="pointer-events-none absolute -right-24 top-1/2 size-[28rem] -translate-y-1/2 rounded-full border border-line/70"
          aria-hidden="true"
        />
        <div className="container-wide relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Reveal>
              <p className="eyebrow">The thinking behind it</p>
            </Reveal>
            <h2 className="display-xl mt-4 max-w-[13ch] text-ink">
              <MaskedLine>Made for the work,</MaskedLine>
              <MaskedLine delay={0.08}>
                <span className="display-italic text-teal">
                  not the aesthetic.
                </span>
              </MaskedLine>
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[30rem] text-[0.93rem] leading-[1.8] text-ink-soft">
                {product.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {product.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 flex items-center gap-4">
                <div className="relative size-16 shrink-0 rotate-[-4deg] overflow-hidden rounded-xl border border-line shadow-md">
                  <ProductArt product={product} showCaption={false} />
                </div>
                <p className="max-w-[16rem] text-[0.72rem] leading-relaxed text-muted">
                  Every product is designed in Faridpur and checked by a human
                  before it reaches you.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Reveal delay={0.05} className="sm:pt-10">
              <div className="overflow-hidden rounded-[1.4rem] border border-line bg-surface p-5">
                <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-teal">
                  Specifications
                </p>
                <div className="mt-4 space-y-3">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="border-b border-line/70 pb-3 last:border-0 last:pb-0"
                    >
                      <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-muted">
                        {spec.label}
                      </p>
                      <p className="mt-1 font-display text-[1.02rem] leading-tight text-ink">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="overflow-hidden rounded-[1.4rem] bg-teal p-5 text-cream">
                <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-butter-soft">
                  The standard
                </p>
                <p className="mt-4 font-display text-[1.55rem] leading-[1.1] tracking-[-0.03em]">
                  Considered materials. Clear instructions. No noisy extras.
                </p>
                <div className="mt-6 space-y-2.5">
                  {[
                    "Checked by a human",
                    "Made in Bangladesh",
                    "Support that answers",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check className="size-3.5 text-butter-soft" aria-hidden="true" />
                      <span className="text-[0.7rem] text-cream/90">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-cream/15 pt-4">
                  <span className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-cream/65">
                    Bengalot
                  </span>
                  <span className="font-display text-lg italic text-cream/60">
                    B.
                  </span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.18} className="sm:col-span-2">
              <div className="flex flex-col gap-4 rounded-[1.4rem] border border-line bg-lavender-soft/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-coral text-cream">
                    <Layers className="size-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-[1.2rem] text-ink">
                      Not sure it is the right fit?
                    </p>
                    <p className="mt-0.5 text-[0.68rem] text-muted">
                      We will help you choose in under two minutes.
                    </p>
                  </div>
                </div>
                <a
                  href="https://wa.me/8801341739202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm shrink-0"
                >
                  Ask a question
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {isFlashcards ? (
        <section className="relative overflow-hidden bg-lavender-soft py-16 sm:py-20">
          <div
            className="pointer-events-none absolute inset-0 dot-paper opacity-25"
            aria-hidden="true"
          />
          <div className="container-wide relative grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <Reveal>
                <p className="eyebrow">Before you buy</p>
              </Reveal>
              <h2 className="display-xl mt-4 max-w-[13ch] text-ink">
                <MaskedLine>Turn one card.</MaskedLine>
                <MaskedLine delay={0.08}>
                  <span className="display-italic text-teal">See the format.</span>
                </MaskedLine>
              </h2>
              <Reveal delay={0.1}>
                <p className="mt-5 max-w-[28rem] text-[0.9rem] leading-[1.75] text-ink-soft">
                  The front asks a question. The back gives a clear meaning, a
                  real example and enough context to use the word tomorrow. Tap
                  the card to preview both sides.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    ["350 GSM", "Dense, matte-finish paper that survives the bag."],
                    ["Rounded corners", "Made to be handled, not just displayed."],
                    ["Topic dividers", "Keep the deck ordered without extra work."],
                  ].map(([label, copy]) => (
                    <li key={label} className="flex gap-3 border-b border-ink/10 pb-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                      <span>
                        <span className="block text-[0.7rem] font-bold text-ink">
                          {label}
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] leading-relaxed text-muted">
                          {copy}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={0.14}>
              <FlashcardPreview product={product} />
            </Reveal>
          </div>
        </section>
      ) : null}

      <ProductReviews reviews={reviews} productTitle={product.title} />
      <RelatedProducts products={related} />
      <MobileBuyBar product={product} />
    </article>
  );
}
