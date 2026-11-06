import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCollection } from "@/components/storefront/product-collection";
import { collectionConfigs } from "@/lib/collections";
import { getStoreCollection } from "@/lib/taxonomy-db";
import { getStoreCatalogue } from "@/lib/catalog-db";
import { SITE } from "@/lib/constants";

export function generateStaticParams() {
  return collectionConfigs.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getStoreCollection(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.metaTitle,
    description: collection.metaDescription,
    alternates: { canonical: `${SITE.url}/collections/${collection.slug}` },
    openGraph: {
      title: `${collection.metaTitle} · Bengalot`,
      description: collection.metaDescription,
      url: `${SITE.url}/collections/${collection.slug}`,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalogue = await getStoreCatalogue();
  const collection = await getStoreCollection(slug, catalogue);
  if (!collection) notFound();

  return (
    <>
      <ProductCollection
        products={collection.products}
        eyebrow={collection.eyebrow}
        title={collection.title}
        accent={collection.accent}
        description={collection.description}
        palette={collection.palette}
        stats={collection.stats}
        note={collection.note}
        closingTitle={collection.closingTitle}
        closingText={collection.closingText}
      />

      {collection.kind === "sale" && (
        <section className="pb-16">
          <div className="container-luxe">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-gold/40 bg-gold/[0.06] p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-gold-ink)]">
                  Current offers
                </p>
                <p className="mt-1 text-sm font-medium">
                  See live coupon codes and minimum order values on the offers page.
                </p>
              </div>
              <Link
                href="/offers"
                className="flex h-9 items-center gap-1.5 rounded-full bg-midnight px-4 text-xs font-bold uppercase tracking-[0.1em] text-ivory transition hover:bg-royal"
              >
                All offers <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
