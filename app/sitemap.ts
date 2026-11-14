import type { MetadataRoute } from "next";

import snapshot from "@/lib/data/snapshot.json";
import { getPageContent } from "@/lib/page-content.server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://bengalot.com";
  const now = new Date();
  const { journal: journalPage } = await getPageContent();
  const products = (snapshot.products as { slug: string }[]).map((product) => ({
    url: `${base}/product/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const categories = [
    "notion-templates",
    "study-cards",
    "printed-planners",
    "focus-productivity",
    "bundles",
  ].map((slug) => ({
    url: `${base}/shop/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const journal = journalPage.articles.map((article) => ({
    url: `${base}/journal/${article.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...categories,
    ...products,
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/journal`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...journal,
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
