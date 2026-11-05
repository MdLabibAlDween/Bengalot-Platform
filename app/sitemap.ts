import type { MetadataRoute } from "next";
import { getDbProducts } from "@/lib/catalog-db";
import { departments, products } from "@/lib/data";
import { isDemoBundle } from "@/lib/bundles";
import { getStoreBundles, getStoreCategories, getStoreCollections } from "@/lib/taxonomy-db";
import { getFeatureFlags } from "@/lib/admin/settings";
import { SITE } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const features = await getFeatureFlags();
  const staticPages = [
    "/",
    "/collections",
    ...(features.giftCards ? ["/gift-cards"] : []),
    "/offers",
    "/lookbook",
    "/shop",
    "/about",
    "/contact",
    "/faq",
    "/shipping-policy",
    "/return-policy",
    "/privacy-policy",
    "/terms",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  // Demo listings stay browsable but must not be indexed or advertised as
  // purchasable products. Database rows take precedence over the static seed.
  const catalogue = new Map(products.map((product) => [product.slug, product]));
  for (const product of await getDbProducts()) {
    catalogue.set(product.slug, product);
  }
  const indexableProducts = [...catalogue.values()].filter((product) => !product.isDemo);
  const [storeCategories, storeCollections, storeBundles] = await Promise.all([
    getStoreCategories(),
    getStoreCollections(),
    getStoreBundles(),
  ]);

  return [
    ...staticPages,
    ...departments.map((d) => ({
      url: `${SITE.url}/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...storeCollections.map((collection) => ({
      url: `${SITE.url}/collections/${collection.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...departments.map((department) => ({
      url: `${SITE.url}/${department.slug}/bundles`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...storeBundles
      .filter((bundle) => !isDemoBundle(bundle))
      .map((bundle) => ({
        url: `${SITE.url}/bundle/${bundle.slug}`,
        lastModified: new Date(bundle.createdAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...storeCategories.map((c) => ({
      url: `${SITE.url}/${c.department}/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...indexableProducts.map((p) => ({
      url: `${SITE.url}/product/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
