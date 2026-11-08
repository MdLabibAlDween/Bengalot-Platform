import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopBrowser } from "@/components/shop/shop-browser";
import { ShopHero } from "@/components/shop/shop-hero";
import { getCatalog } from "@/lib/data/catalog";

export async function generateStaticParams() {
  return [
    { slug: "notion-templates" },
    { slug: "study-cards" },
    { slug: "printed-planners" },
    { slug: "focus-productivity" },
    { slug: "bundles" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.categories.find((item) => item.slug === slug);

  if (!category) return {};

  return {
    title: category.name,
    description: category.description ?? undefined,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: {
      title: `${category.name} · Bengalot`,
      description: category.description ?? undefined,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.categories.find((item) => item.slug === slug);

  if (!category) notFound();

  const products = catalog.products.filter(
    (product) => product.category_slug === category.slug,
  );

  return (
    <>
      <ShopHero category={category} products={catalog.products} />
      <ShopBrowser
        products={products}
        categories={catalog.categories}
        lockedCategory={category.slug}
      />
    </>
  );
}
