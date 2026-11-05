import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { BundleDetail } from "@/components/bundle/bundle-detail";
import { BundleCard } from "@/components/bundle/bundle-card";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { SectionHeading } from "@/components/storefront/section-heading";
import { bundles, getBundlePricing, isDemoBundle } from "@/lib/bundles";
import { getStoreBundle, getStoreBundles } from "@/lib/taxonomy-db";
import { getDepartment } from "@/lib/data";
import { SITE } from "@/lib/constants";
import { safeJsonLd, formatBDT } from "@/lib/utils";
import { getStoreProfile } from "@/lib/admin/settings";

export function generateStaticParams() {
  return bundles
    .filter((bundle) => bundle.status === "published")
    .map((bundle) => ({ slug: bundle.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getStoreBundle(slug);
  if (!bundle) return { title: "Bundle not found" };
  const demo = isDemoBundle(bundle);
  return {
    title: bundle.seoTitle ?? `${bundle.name} — Complete outfit`,
    description: bundle.seoDescription ?? bundle.shortDescription,
    alternates: { canonical: `${SITE.url}/bundle/${bundle.slug}` },
    robots: demo ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: `${bundle.name} · Bengalot`,
      description: bundle.shortDescription,
      url: `${SITE.url}/bundle/${bundle.slug}`,
    },
  };
}

export default async function BundlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = await getStoreBundle(slug);
  if (!bundle || bundle.status !== "published") notFound();
  const demo = isDemoBundle(bundle);
  const department = getDepartment(bundle.department);
  if (!department) notFound();
  const storeProfile = await getStoreProfile();
  const otherBundles = (await getStoreBundles(department.slug)).filter(
    (item) => item.slug !== bundle.slug
  );
  const pricing = getBundlePricing(bundle);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: bundle.name,
    description: bundle.shortDescription,
    url: `${SITE.url}/bundle/${bundle.slug}`,
    numberOfItems: pricing.items.reduce((sum, item) => sum + item.quantity, 0),
    itemListElement: pricing.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.product.name,
        url: `${SITE.url}/product/${item.product.slug}`,
        offers: {
          "@type": "Offer",
          price: item.product.price,
          priceCurrency: "BDT",
          availability:
            item.product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      },
    })),
    offers: {
      "@type": "Offer",
      price: pricing.price,
      priceCurrency: "BDT",
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/bundle/${bundle.slug}`,
    },
  };

  return (
    <>
      {!demo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      )}
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)]/50">
        <div className="container-luxe flex flex-wrap items-center justify-between gap-3 py-3">
          <Breadcrumbs
            items={[
              { label: department.name, href: `/${department.slug}` },
              { label: "Bundles", href: `/${department.slug}/bundles` },
              { label: bundle.name },
            ]}
          />
          <div className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <span className="hidden items-center gap-1.5 sm:flex">
              <Truck className="h-3.5 w-3.5 text-gold" /> Delivery{" "}
              {formatBDT(storeProfile.deliveryInside)} inside Faridpur ·{" "}
              {formatBDT(storeProfile.deliveryOutside)} outside
            </span>
            <Link
              href={`/${department.slug}/bundles`}
              className="flex items-center gap-1.5 transition hover:text-gold"
            >
              All bundles <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container-luxe py-6 md:py-10">
        <BundleDetail bundle={bundle} />
      </div>

      {otherBundles.length > 0 && (
        <section className="border-t border-[var(--border)] bg-[var(--surface-2)] py-14 md:py-16">
          <div className="container-luxe">
            <SectionHeading
              eyebrow={`More from ${department.name}`}
              title={
                <>
                  More complete <span className="italic text-gold">outfits.</span>
                </>
              }
              linkHref={`/${department.slug}/bundles`}
              linkLabel="All bundles"
            />
            <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {otherBundles.map((item) => (
                <BundleCard key={item.slug} bundle={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
