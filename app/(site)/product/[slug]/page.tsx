import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BundleCard } from "@/components/bundle/bundle-card";
import { ProductShowcase } from "@/components/product/product-showcase";
import { ReviewsSection } from "@/components/product/reviews-section";
import { QASection } from "@/components/product/qa-section";
import { ProductViewTracker } from "@/components/product/product-view-tracker";
import { ScrollToHash } from "@/components/product/scroll-to-hash";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import {
  getCategory,
  getDepartment,
  getSizeGuide,
  reviewsFor,
} from "@/lib/data";
import { getStoreCollection, getStoreBundles } from "@/lib/taxonomy-db";
import { getStoreCatalogue, getStoreProduct } from "@/lib/catalog-db";
import { SITE } from "@/lib/constants";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Product, Review } from "@/lib/types";
import { cn, safeJsonLd } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function resolveProduct(slug: string): Promise<Product | undefined> {
  return getStoreProduct(slug);
}

function BrowseTile({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[18px] border border-dashed border-gold/45 bg-[var(--surface)] p-5 transition hover:border-gold hover:bg-gold/[0.04]"
    >
      <span className="text-[0.52rem] font-bold uppercase tracking-[0.18em] text-gold">
        Keep exploring
      </span>
      <div>
        <p className="font-display text-2xl leading-tight">{label}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-foreground/70 transition group-hover:text-gold">
          Browse all <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  if (!product) notFound();
  const title = product.seoTitle || `${product.name} — ${product.shortDescription.slice(0, 60)}`;
  const description = product.seoDescription || product.shortDescription;
  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/product/${product.slug}` },
    robots: product.isDemo
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: `${product.name} · Bengalot`,
      description,
      url: `${SITE.url}/product/${product.slug}`,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  if (!product) notFound();

  const department = getDepartment(product.department);
  const category = getCategory(product.department, product.category);
  if (!department || !category) notFound();

  const sizeGuide = getSizeGuide(product.sizeGuideId);
  const reviewAdmin = createAdminSupabaseClient();
  const { data: reviewRows } = reviewAdmin
    ? await reviewAdmin
        .from("reviews")
        .select("*")
        .eq("product_slug", product.slug)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };
  const storeReviews: Review[] = (reviewRows ?? []).map((row) => ({
    id: row.id,
    productSlug: row.product_slug,
    name: row.name,
    location: row.location ?? "",
    rating: Number(row.rating),
    title: row.title,
    body: row.body,
    date: row.created_at,
    verified: Boolean(row.verified),
    helpful: Number(row.helpful ?? 0),
  }));
  const productReviews = reviewsFor(product.slug);
  const reviewCount = storeReviews.length || productReviews.length;
  const reviewRating =
    reviewCount > 0
      ? (storeReviews.length ? storeReviews : productReviews).reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviewCount
      : 0;

  const preferredCollection =
    product.collectionSlug ??
    (product.sets.includes("new")
      ? "new-arrivals"
      : product.sets.includes("best")
        ? "best-sellers"
        : product.compareAt
          ? "sale"
          : product.tags.some((tag) =>
                ["Jamdani", "Handloom", "Heritage", "Handmade", "Hand-embroidered"].includes(
                  tag
                )
              )
            ? "heirloom-collection"
            : "royal-collection");
  const storeCollection =
    (await getStoreCollection(preferredCollection)) ??
    (await getStoreCollection("new-arrivals"));
  const collectionLabel = storeCollection
    ? `${storeCollection.title} ${storeCollection.accent}`
        .replace(/\.$/, "")
        .replace(/\s+/g, " ")
        .trim()
    : "Collections";

  const audience = product.audience ?? "unisex";
  const departmentCatalogue = (await getStoreCatalogue()).filter(
    (item) => item.department === department.slug
  );
  const eligible = departmentCatalogue.filter(
    (item) =>
      item.slug !== product.slug &&
      (audience === "unisex" ||
        item.audience === audience ||
        item.audience === "unisex")
  );
  const sameCategory = eligible.filter((item) => item.category === product.category);
  const siblings = eligible.filter((item) => item.category !== product.category);
  const ordered = [...sameCategory, ...siblings];

  const matchingBundles = (await getStoreBundles(product.department)).filter(
    (bundle) =>
      bundle.department === product.department &&
      bundle.items.some((item) => item.productSlug === product.slug)
  );
  const completeLookSlugs = matchingBundles.flatMap((bundle) =>
    bundle.items.map((item) => item.productSlug)
  );
  const recommendations = ordered.filter(
    (item) => !completeLookSlugs.includes(item.slug)
  );
  const completeLookProducts = matchingBundles.length
    ? []
    : recommendations.slice(0, 4);
  const alsoLike = recommendations.slice(completeLookProducts.length, completeLookProducts.length + 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.shortDescription,
        sku: product.sku,
        brand: { "@type": "Brand", name: "Bengalot" },
        category: `${department.name} > ${category.name}`,
        color: product.colors.map((color) => color.name),
        size: product.sizes.map((size) => size.label),
        ...(reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(reviewRating.toFixed(1)),
                reviewCount,
              },
            }
          : {}),
        offers: {
          "@type": "Offer",
          url: `${SITE.url}/product/${product.slug}`,
          priceCurrency: "BDT",
          price: product.price,
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: "Bengalot" },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          {
            "@type": "ListItem",
            position: 2,
            name: department.name,
            item: `${SITE.url}/${department.slug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: `${SITE.url}/${department.slug}/${category.slug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: `${SITE.url}/product/${product.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      {!product.isDemo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
        />
      )}
      <ProductViewTracker product={product} />
      <ScrollToHash />

      <div className="container-luxe pb-6 pt-0 md:py-9">
        <div className="mb-6 hidden flex-wrap items-center justify-between gap-3 sm:flex">
          <Breadcrumbs
            items={[
              { label: department.name, href: `/${department.slug}` },
              { label: category.name, href: `/${department.slug}/${category.slug}` },
              { label: product.name },
            ]}
            accentColor={department.accent}
          />
          <Link
            href={`/${department.slug}/${category.slug}`}
            className="hidden items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-gold sm:flex"
          >
            Back to {category.name} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ProductShowcase
          product={product}
          sizeGuide={sizeGuide}
          reviewRating={reviewRating}
          reviewCount={reviewCount}
          breadcrumbs={[
            { label: category.name, href: `/${department.slug}/${category.slug}` },
            { label: product.name },
          ]}
          collection={{
            label: collectionLabel,
            href: storeCollection ? `/collections/${storeCollection.slug}` : "/collections",
            note: product.collectionNote ?? "",
          }}
        />
      </div>

      {matchingBundles.length > 0 ? (
        <section className="border-t border-[var(--border)] bg-[var(--surface-2)]/55 py-16 md:py-20">
          <div className="container-luxe">
            <SectionHeading
              eyebrow="Complete the outfit"
              title={
                <>
                  Get the <span className="italic text-gold">complete look.</span>
                </>
              }
              description={`This piece is part of a Bengalot bundle — every layer chosen to sit together.`}
              linkHref={`/bundle/${matchingBundles[0].slug}`}
              linkLabel="View bundle"
            />
            <div
              className={cn(
                "mt-8 grid gap-6",
                matchingBundles.length === 1
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {matchingBundles.map((bundle) => (
                <div key={bundle.slug}>
                  <BundleCard bundle={bundle} />
                  <Link
                    href={`/bundle/${bundle.slug}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-foreground/70 transition hover:text-gold"
                  >
                    Get the complete outfit <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
              {matchingBundles.length < 3 && (
                <BrowseTile
                  href={`/${department.slug}/bundles`}
                  label={`All ${department.name} bundles`}
                />
              )}
            </div>
          </div>
        </section>
      ) : (
        completeLookProducts.length >= 2 && (
          <section className="border-t border-[var(--border)] bg-[var(--surface-2)]/55 py-16 md:py-20">
            <div className="container-luxe">
              <SectionHeading
                eyebrow="Complete the look"
                title={
                  <>
                    Pieces that <span className="italic text-gold-ink">belong together.</span>
                  </>
                }
                description={`Hand-picked from ${department.name} to sit beside the ${product.name}.`}
                linkHref={`/${department.slug}`}
                linkLabel={`Shop all ${department.name}`}
              />
              <ProductGrid className="mt-8">
                {completeLookProducts.map((item) => (
                  <ProductCard key={item.slug} product={item} />
                ))}
                {completeLookProducts.length < 4 && (
                  <BrowseTile
                    href={`/${department.slug}/${category.slug}`}
                    label={`Browse all ${category.name}`}
                  />
                )}
              </ProductGrid>
            </div>
          </section>
        )
      )}

      <ReviewsSection product={product} reviews={storeReviews} />
      <QASection product={product} />

      {alsoLike.length >= 2 && (
        <section className="border-t border-[var(--border)] py-16 md:py-20">
          <div className="container-luxe">
            <SectionHeading
              eyebrow={`More from ${department.name}`}
              title={
                <>
                  You may also <span className="italic text-gold-ink">like.</span>
                </>
              }
              description={`Further pieces from ${department.name} — never from another department.`}
              linkHref={`/${department.slug}`}
              linkLabel={`Shop all ${department.name}`}
            />
            <ProductGrid className="mt-8">
              {alsoLike.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
              {alsoLike.length < 4 && (
                <BrowseTile
                  href={`/${department.slug}/${category.slug}`}
                  label={`Browse all ${category.name}`}
                />
              )}
            </ProductGrid>
          </div>
        </section>
      )}

      <RecentlyViewed />

      <div className="h-16 md:h-0" aria-hidden="true" />
    </>
  );
}
