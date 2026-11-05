import { getProduct } from "./data";
import { STORE_SETTINGS } from "./settings";
import type { Bundle, CartLine, Product } from "./types";

/**
 * Complete outfits. A bundle belongs to exactly one department and only ever
 * appears inside that department. Items are real catalogue products — stock,
 * colors and sizes come from the live product data.
 */
export const bundles: Bundle[] = [
  {
    id: "men-dusk-set",
    slug: "men-dusk-set",
    name: "The Dusk Set",
    nameBn: "দ্য ডাস্ক সেট",
    department: "men",
    isDemo: true,
    shortDescription:
      "A complete evening look — an easy polo, tailored chino and a matte bomber for after dark.",
    description:
      "Built around the Dusk Bomber, this set pairs a deep-indigo polo with our tapered charcoal chino. The proportions are considered as a whole: a clean shoulder, an easy break at the trouser and a jacket that finishes at the hip. Pick a size and color for each piece and the complete outfit arrives as one considered parcel.",
    coverArt: "jacket",
    coverPalette: ["var(--color-indigo)", "var(--color-indigo-luminous)"],
    discountType: "percent",
    discountValue: 10,
    status: "published",
    featured: true,
    allowPartialPurchase: false,
    items: [
      { productSlug: "indigo-polo-club", quantity: 1, sort: 1 },
      { productSlug: "charcoal-tailored-chino", quantity: 1, sort: 2 },
      { productSlug: "dusk-bomber-jacket", quantity: 1, sort: 3 },
    ],
    seoTitle: "The Dusk Set — Complete men's outfit",
    seoDescription:
      "A complete Bengalot men's outfit: indigo polo, charcoal tailored chino and dusk bomber. Save 10% on the complete set.",
    createdAt: "2026-10-20",
    sort: 1,
  },
  {
    id: "women-heirloom-set",
    slug: "women-heirloom-set",
    name: "The Heirloom Set",
    nameBn: "দ্য হেরিলুম সেট",
    department: "women",
    isDemo: true,
    shortDescription:
      "Handloom rosewood, breezy terracotta and a silk peacock hijab — an effortless complete look.",
    description:
      "A considered everyday outfit in three parts: our rosewood handloom kurti, the wide-leg terracotta palazzo and a peacock silk hijab. Together they balance color and drape without asking anything of the wearer. Select the fit for each piece and we will send the complete set together.",
    coverArt: "kurti",
    coverPalette: ["var(--color-magenta)", "var(--color-magenta-luminous)"],
    discountType: "fixed",
    discountValue: 500,
    status: "published",
    featured: true,
    allowPartialPurchase: false,
    items: [
      { productSlug: "rosewood-handloom-kurti", quantity: 1, sort: 1 },
      { productSlug: "terracotta-palazzo", quantity: 1, sort: 2 },
      { productSlug: "peacock-silk-hijab", quantity: 1, sort: 3 },
    ],
    seoTitle: "The Heirloom Set — Complete women's outfit",
    seoDescription:
      "A complete Bengalot women's outfit: rosewood handloom kurti, terracotta palazzo and peacock silk hijab. Save ৳500 on the complete set.",
    createdAt: "2026-10-22",
    sort: 2,
  },
  {
    id: "kids-starlight-set",
    slug: "kids-starlight-set",
    name: "The Little Starlight Set",
    nameBn: "দ্য লিটল স্টারলাইট সেট",
    department: "kids",
    isDemo: true,
    shortDescription:
      "A soft hoodie, an easy play tee and cosy nightwear — one happy little wardrobe in three pieces.",
    description:
      "Made for the days that run from playtime to bedtime. The mini Bengal hoodie layers over the junior play tee, while the starry-night set waits for the evening. Every piece is soft, washable and cut with room to grow. Choose sizes for all three and save on the set.",
    coverArt: "hoodie",
    coverPalette: ["var(--color-terracotta)", "var(--color-terracotta-luminous)"],
    discountType: "percent",
    discountValue: 15,
    status: "published",
    featured: true,
    allowPartialPurchase: false,
    items: [
      { productSlug: "mini-bengal-hoodie", quantity: 1, sort: 1 },
      { productSlug: "junior-play-tee", quantity: 1, sort: 2 },
      { productSlug: "starry-night-set", quantity: 1, sort: 3 },
    ],
    seoTitle: "The Little Starlight Set — Complete kids' outfit",
    seoDescription:
      "A complete Bengalot kids' outfit: mini Bengal hoodie, junior play tee and starry night set. Save 15% on the complete set.",
    createdAt: "2026-10-25",
    sort: 3,
  },
];

export const publishedBundles = bundles
  .filter((bundle) => bundle.status === "published")
  .filter(
    (bundle) =>
      !(STORE_SETTINGS.hideDemoContent || STORE_SETTINGS.hideDemoProducts) ||
      !bundle.isDemo
  )
  .sort((a, b) => a.sort - b.sort);

export const featuredBundles = publishedBundles.filter((bundle) => bundle.featured);

export function getBundle(slug: string) {
  return publishedBundles.find((bundle) => bundle.slug === slug);
}

export function getBundlesFor(department: string) {
  return publishedBundles.filter((bundle) => bundle.department === department);
}

export function getBundleItems(bundle: Bundle) {
  return bundle.items
    .slice()
    .sort((a, b) => a.sort - b.sort)
    .map((item) => {
      const product = getProduct(item.productSlug);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is { productSlug: string; quantity: number; sort: number; product: Product } =>
      Boolean(item)
    );
}

export function getBundlePricing(bundle: Bundle) {
  const items = getBundleItems(bundle);
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const rawDiscount =
    bundle.discountType === "percent"
      ? Math.round((total * bundle.discountValue) / 100)
      : bundle.discountType === "fixed"
        ? bundle.discountValue
        : 0;
  const savings = Math.min(total, Math.max(0, rawDiscount));
  return {
    total,
    price: Math.max(0, total - savings),
    savings,
    percent: total > 0 ? Math.round((savings / total) * 100) : 0,
    items,
  };
}

export function bundleItemCount(bundle: Bundle) {
  return getBundleItems(bundle).reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * A bundle is a demo bundle when it is marked demo itself, or when any of its
 * pieces is still a demo product. Demo bundles stay browsable but cannot be
 * ordered.
 */
export function isDemoBundle(bundle: Bundle) {
  return Boolean(bundle.isDemo);
}

/**
 * Work out bundle savings in the cart. Savings only apply when each bundle
 * item is present with at least the required quantity; change a variant or
 * remove an item and the saving is automatically withdrawn.
 */
export function getBundleCartGroups(lines: CartLine[]) {
  const bundleIds = Array.from(
    new Set(lines.map((line) => line.bundleId).filter((id): id is string => Boolean(id)))
  );

  return bundleIds
    .map((bundleId) => {
      const bundle = getBundle(bundleId);
      if (!bundle) return null;
      const groupLines = lines.filter((line) => line.bundleId === bundleId);
      const requirements = getBundleItems(bundle);
      const quantities = new Map<string, number>();
      for (const line of groupLines) {
        quantities.set(
          line.productSlug,
          (quantities.get(line.productSlug) ?? 0) + line.qty
        );
      }
      const completeSets = requirements.length
        ? Math.min(
            ...requirements.map((item) =>
              Math.floor((quantities.get(item.productSlug) ?? 0) / Math.max(1, item.quantity))
            )
          )
        : 0;
      const complete = completeSets > 0;
      const missing = requirements.filter(
        (item) => (quantities.get(item.productSlug) ?? 0) < item.quantity
      );
      const { savings } = getBundlePricing(bundle);
      return {
        bundle,
        lines: groupLines,
        complete,
        completeSets,
        savings: complete ? savings * completeSets : 0,
        missing,
      };
    })
    .filter((group): group is NonNullable<typeof group> => Boolean(group));
}

export function getBundleSavings(lines: CartLine[]) {
  return getBundleCartGroups(lines).reduce((sum, group) => sum + group.savings, 0);
}
