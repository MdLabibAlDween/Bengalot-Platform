import { products } from "./data";
import { STORE_SETTINGS } from "./settings";
import type { Product } from "./types";
import { discountedPrice } from "./utils";

export type StoreCollection = {
  slug: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  palette: [string, string];
  note?: string;
  closingTitle: string;
  closingText: string;
  metaTitle: string;
  metaDescription: string;
  kind: "new" | "best" | "sale" | "royal" | "heirloom";
  isDemo?: boolean;
};

export const collectionConfigs: StoreCollection[] = [
  {
    slug: "new-arrivals",
    eyebrow: "Just landed",
    title: "The New",
    accent: "Arrivals.",
    description:
      "The freshest pieces from the atelier — small runs, honest fabrics and the kind of details you notice later.",
    palette: ["var(--color-teal-luminous)", "var(--color-teal)"],
    note: "Updated this week",
    closingTitle: "Newness, without the noise.",
    closingText:
      "We add pieces in small batches rather than a whole season at once. Explore the latest collection.",
    metaTitle: "New Arrivals — The latest from the atelier",
    metaDescription:
      "The newest pieces from Bengalot — jamdani, panjabis, kurtis, footwear and accessories.",
    kind: "new",
    isDemo: true,
  },
  {
    slug: "best-sellers",
    eyebrow: "Selected pieces",
    title: "The Selected",
    accent: "Pieces.",
    description:
      "A cross-section of the current collection, gathered for easy browsing.",
    palette: ["var(--color-indigo)", "var(--color-gold-ink)"],
    note: "Selected pieces",
    closingTitle: "A considered selection.",
    closingText:
      "A simple cross-section of pieces across departments — nothing ranked, nothing claimed.",
    metaTitle: "The Selected Pieces — Bengalot",
    metaDescription:
      "A selected collection of Bengalot pieces across departments.",
    kind: "best",
    isDemo: true,
  },
  {
    slug: "sale",
    eyebrow: "The archive",
    title: "The Quiet",
    accent: "Sale.",
    description:
      "A few last pieces, a few last sizes. Considered reductions on small-run collections.",
    palette: ["var(--color-magenta)", "var(--color-indigo)"],
    note: "Sale pieces exchange for size only",
    closingTitle: "A good piece is never wasted.",
    closingText:
      "These are the last of their runs, not a separate quality. See the return policy for what applies to sale pieces.",
    metaTitle: "Sale — The Bengalot archive",
    metaDescription:
      "Last pieces and quiet reductions from Bengalot. Limited runs and final sizes, delivered with care.",
    kind: "sale",
    isDemo: true,
  },
  {
    slug: "royal-collection",
    eyebrow: "The Royal Collection",
    title: "The Royal",
    accent: "Collection.",
    description:
      "Deep indigo, gold thread and celebration-ready silhouettes. A considered collection of festive pieces for the moments that deserve a little ceremony.",
    palette: ["var(--color-indigo)", "var(--color-indigo-luminous)"],
    note: "Festive pieces · small runs",
    closingTitle: "Made for the moments you keep.",
    closingText:
      "Jewel tones, hand-finished details and pieces that move from celebration to everyday without missing a step.",
    metaTitle: "The Royal Collection — Festive collections from Bengalot",
    metaDescription:
      "Explore the Royal Collection: hand-finished panjabis, jamdani, jewellery and festive pieces from Bengalot.",
    kind: "royal",
    isDemo: true,
  },
  {
    slug: "heirloom-collection",
    eyebrow: "The Heirloom Collection",
    title: "The Heirloom",
    accent: "Collection.",
    description:
      "Handloom sarees, hand-finished panjabis and pieces made slowly by people whose names we know. Cloth with a memory, made to be kept.",
    palette: ["var(--color-magenta)", "var(--color-terracotta)"],
    note: "Handloom · hand-finished",
    closingTitle: "Made by hand. Kept for years.",
    closingText:
      "A quiet collection of heirloom pieces, selected for the way they wear over time.",
    metaTitle: "The Heirloom Collection — Handloom craft from Bengal",
    metaDescription:
      "Handwoven jamdani, hand-finished panjabis and heirloom pieces made in small batches by Bengalot.",
    kind: "heirloom",
    isDemo: true,
  },
];

export function getCollectionProducts(
  kind: StoreCollection["kind"],
  catalogue: Product[] = products
): Product[] {
  switch (kind) {
    case "new":
      return catalogue
        .filter((product) => product.sets.includes("new") || product.badge === "New")
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case "best":
      return catalogue.filter((product) => product.sets.includes("best"));
    case "sale":
      return catalogue.filter(
        (product) => product.compareAt && product.compareAt > product.price
      );
    case "royal":
      return catalogue
        .filter((product) =>
          product.tags.some((tag) =>
            ["Festive", "Signature", "Bridal", "Gift", "Gold", "Jewelry"].includes(tag)
          )
        )
        .slice(0, 12);
    case "heirloom":
      return catalogue
        .filter((product) =>
          product.tags.some((tag) =>
            ["Jamdani", "Handloom", "Heritage", "Handmade", "Hand-embroidered", "Hand-embroidery"].includes(tag)
          )
        )
        .slice(0, 12);
    default:
      return catalogue;
  }
}

export function getCollection(slug: string, catalogue: Product[] = products) {
  const config = collectionConfigs.find((collection) => collection.slug === slug);
  if (!config) return undefined;
  if (STORE_SETTINGS.hideDemoContent && config.isDemo) return undefined;
  const collectionProducts = getCollectionProducts(config.kind, catalogue);
  const maxOff = Math.max(
    0,
    ...collectionProducts.map(
      (product) => discountedPrice(product.price, product.compareAt) ?? 0
    )
  );

  const statsByKind: Record<
    StoreCollection["kind"],
    { value: string; label: string }[]
  > = {
    new: [
      { value: String(collectionProducts.length), label: "new pieces" },
      { value: "Online", label: "direct" },
      { value: "COD", label: "payment" },
    ],
    best: [
      { value: String(collectionProducts.length), label: "pieces" },
      { value: "COD", label: "payment" },
      { value: "Online", label: "direct" },
    ],
    sale: [
      { value: `−${maxOff}%`, label: "up to" },
      { value: String(collectionProducts.length), label: "pieces" },
      { value: "COD", label: "payment" },
    ],
    royal: [
      { value: String(collectionProducts.length), label: "festive pieces" },
      { value: "COD", label: "payment" },
      { value: "Online", label: "direct" },
    ],
    heirloom: [
      { value: String(collectionProducts.length), label: "handmade pieces" },
      { value: "COD", label: "payment" },
      { value: "Online", label: "direct" },
    ],
  };

  const note =
    config.kind === "sale" && !STORE_SETTINGS.exchangeWindowEnabled
      ? undefined
      : config.note;

  return {
    ...config,
    products: collectionProducts,
    stats: statsByKind[config.kind],
    note,
  };
}

export function getCollectionSummaries(catalogue: Product[] = products) {
  return collectionConfigs
    .filter((collection) => !STORE_SETTINGS.hideDemoContent || !collection.isDemo)
    .map((collection) => {
      const products = getCollectionProducts(collection.kind, catalogue);
      return {
        ...collection,
        productCount: products.length,
        coverProduct: products[0],
      };
    });
}
