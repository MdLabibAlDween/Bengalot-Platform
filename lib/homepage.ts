import type { ArtIcon } from "./types";
import { STORE_SETTINGS } from "./settings";

/**
 * Home-page content bridge.
 *
 * The storefront is still credential-free, so this file supplies the editable
 * defaults. In production each object maps 1:1 to a Supabase row created by
 * `20261103000200_homepage_content.sql`:
 *
 *   HOMEPAGE_SECTIONS  -> homepage_sections
 *   HERO_SLIDES        -> hero_slides
 *   WHY_CARDS          -> homepage_feature_cards
 *   BRAND_STORY        -> home_blocks / homepage_sections.content
 *   OFFER_CAMPAIGNS    -> offer_campaigns
 *   SOCIAL_STRIP       -> home_blocks / social_posts
 *
 * The admin toggles and reorders sections through `enabled` + `sort`, edits
 * every line here, and picks linked products/categories/collections by slug.
 */

export type HomeSectionKey =
  | "announcement"
  | "hero"
  | "trust"
  | "departments"
  | "products"
  | "bundles"
  | "categories"
  | "collections"
  | "offer"
  | "giftcards"
  | "why"
  | "story"
  | "reviews"
  | "reels"
  | "social"
  | "newsletter"
  | "recentlyViewed";

export type HomeSection = {
  key: HomeSectionKey;
  label: string;
  enabled: boolean;
  sort: number;
  isDemo?: boolean;
};

export const HOMEPAGE_SECTIONS: HomeSection[] = [
  { key: "announcement", label: "Announcement bar", enabled: true, sort: 0 },
  { key: "hero", label: "Hero", enabled: true, sort: 1 },
  { key: "trust", label: "Trust strip", enabled: true, sort: 2 },
  { key: "departments", label: "Shop by department", enabled: true, sort: 3 },
  { key: "products", label: "New arrivals & selected pieces", enabled: true, sort: 4 },
  { key: "bundles", label: "Complete outfits", enabled: true, sort: 5 },
  { key: "categories", label: "Shop by category", enabled: true, sort: 6 },
  { key: "collections", label: "Featured collections", enabled: true, sort: 7 },
  { key: "offer", label: "Offer banner", enabled: true, sort: 8 },
  { key: "giftcards", label: "Gift cards", enabled: true, sort: 9 },
  { key: "why", label: "Why Bengalot", enabled: true, sort: 10 },
  { key: "story", label: "Brand story", enabled: true, sort: 11 },
  { key: "reviews", label: "Customer reviews", enabled: true, sort: 12 },
  { key: "reels", label: "Model reels", enabled: true, sort: 13 },
  { key: "social", label: "Social strip", enabled: true, sort: 14 },
  { key: "newsletter", label: "Newsletter", enabled: true, sort: 15 },
  { key: "recentlyViewed", label: "Recently viewed", enabled: true, sort: 16 },
];

export function isDemoVisible(isDemo?: boolean) {
  return !isDemo || !STORE_SETTINGS.hideDemoContent;
}

export function getHomeSections() {
  return HOMEPAGE_SECTIONS.filter((section) => section.enabled).sort(
    (a, b) => a.sort - b.sort
  );
}

export function homeSectionEnabled(key: HomeSectionKey) {
  return HOMEPAGE_SECTIONS.some((section) => section.key === key && section.enabled);
}

/* -------------------------------------------------------------------------- */
/*  Section copy                                                              */
/* -------------------------------------------------------------------------- */

export type SectionCopy = {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  linkLabel?: string;
  linkHref?: string;
};

export const SECTION_COPY: Record<
  | "departments"
  | "products"
  | "bundles"
  | "categories"
  | "collections"
  | "giftcards"
  | "why"
  | "reviews"
  | "reels"
  | "social"
  | "recentlyViewed",
  SectionCopy
> = {
  departments: {
    eyebrow: "Shop by department",
    title: "Find your world",
    accent: "world",
    description: "Six departments, each with its own point of view.",
    linkLabel: "All departments",
    linkHref: "/shop",
  },
  products: {
    eyebrow: "The latest",
    title: "New arrivals",
    description: "Fresh pieces from across the house.",
    linkLabel: "View all",
    linkHref: "/collections/new-arrivals",
  },
  bundles: {
    eyebrow: "Complete outfits",
    title: "One look, every piece",
    accent: "piece",
    description: "Ready-made outfits, priced as one.",
    linkLabel: "All outfits",
    linkHref: "/shop",
  },
  categories: {
    eyebrow: "Shop by category",
    title: "The pieces you wear most",
    description: "A quicker way to the right shelf.",
    linkLabel: "Browse everything",
    linkHref: "/shop",
  },
  collections: {
    eyebrow: "Featured collections",
    title: "Stories in color",
    accent: "color",
    description: "Seasonal collections worth exploring.",
    linkLabel: "All collections",
    linkHref: "/collections",
  },
  giftcards: {
    eyebrow: "The gift of choice",
    title: "Give the whole house",
    accent: "house",
    description:
      "A Bengalot gift card lets them choose the piece that feels like theirs — with a year to use it.",
    linkLabel: "Buy a gift card",
    linkHref: "/gift-cards",
  },
  why: {
    eyebrow: "Why Bengalot",
    title: "The service behind every order",
    description: "Clear promises, kept quietly.",
  },
  reviews: {
    eyebrow: "Customer reviews",
    title: "Reviews from customers",
    accent: "customers",
    description: "Real reviews will appear here once they are submitted and approved.",
  },
  reels: {
    eyebrow: "Model reels",
    title: "See it in motion",
    accent: "motion",
    description:
      "Short films of the pieces on the move — shot by the people who wear them.",
    linkLabel: "See the looks",
    linkHref: "/lookbook",
  },
  social: {
    eyebrow: "From the studio",
    title: "Follow along",
    description: "New pieces, behind the scenes and studio notes.",
    linkLabel: "Instagram",
  },
  recentlyViewed: {
    eyebrow: "Continue browsing",
    title: "Recently viewed",
    description: "Pick up where you left off.",
  },
};

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

export type HeroSlide = {
  id: string;
  slug: string;
  label: string;
  headline: string;
  accentWord: string;
  supporting: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  accentColor: string;
  accentDeep: string;
  tint: string;
  productSlugs: string[];
  collectionSlug?: string;
  status: "draft" | "published";
  isDemo?: boolean;
  sort: number;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-festive",
    slug: "the-festive-collection",
    label: "The festive collection",
    headline: "Dress like",
    accentWord: "royalty.",
    supporting: "Occasion-ready panjabis, jamdani and gold-toned finishing touches.",
    primaryLabel: "Shop Now",
    primaryHref: "/collections/royal-collection",
    secondaryLabel: "Explore Collections",
    secondaryHref: "/collections",
    accentColor: "var(--color-indigo)",
    accentDeep: "var(--color-indigo)",
    tint: "var(--color-indigo-tint)",
    productSlugs: [
      "royal-nocturne-panjabi",
      "heirloom-jamdani-saree",
      "royal-bengal-watch",
    ],
    collectionSlug: "royal-collection",
    status: "published",
    isDemo: true,
    sort: 1,
  },
  {
    id: "hero-handloom",
    slug: "the-handloom-collection",
    label: "The handloom collection",
    headline: "Heritage, worn",
    accentWord: "lightly.",
    supporting: "Handloom textures and modern cuts for everyday celebrations.",
    primaryLabel: "Shop Now",
    primaryHref: "/collections/heirloom-collection",
    secondaryLabel: "Explore Collections",
    secondaryHref: "/collections",
    accentColor: "var(--color-magenta)",
    accentDeep: "var(--color-magenta)",
    tint: "var(--color-magenta-tint)",
    productSlugs: [
      "heirloom-jamdani-saree",
      "rosewood-handloom-kurti",
      "peacock-silk-hijab",
    ],
    collectionSlug: "heirloom-collection",
    status: "published",
    isDemo: true,
    sort: 2,
  },
  {
    id: "hero-everyday",
    slug: "the-everyday-collection",
    label: "The everyday collection",
    headline: "Everyday,",
    accentWord: "elevated.",
    supporting: "Easy cotton, clean lines and leather pieces that go everywhere.",
    primaryLabel: "Shop Now",
    primaryHref: "/collections/best-sellers",
    secondaryLabel: "Explore Collections",
    secondaryHref: "/collections",
    accentColor: "var(--color-teal)",
    accentDeep: "var(--color-teal)",
    tint: "var(--color-teal-tint)",
    productSlugs: [
      "midnight-oversized-tee",
      "charcoal-tailored-chino",
      "rajshahi-leather-sneaker",
    ],
    collectionSlug: "best-sellers",
    status: "published",
    isDemo: true,
    sort: 3,
  },
  {
    id: "hero-gifting",
    slug: "the-gift-collection",
    label: "The gift collection",
    headline: "Small things, kept",
    accentWord: "close.",
    supporting: "Watches, attar and jute pieces made for giving.",
    primaryLabel: "Shop Now",
    primaryHref: "/collections/new-arrivals",
    secondaryLabel: "Explore Collections",
    secondaryHref: "/collections",
    accentColor: "var(--color-gold-ink)",
    accentDeep: "var(--color-gold-ink)",
    tint: "var(--color-gold-tint)",
    productSlugs: [
      "royal-bengal-watch",
      "amber-oud-attar",
      "golden-hour-jute-tote",
    ],
    collectionSlug: "new-arrivals",
    status: "published",
    isDemo: true,
    sort: 4,
  },
];

export function getHeroSlides() {
  return HERO_SLIDES.filter(
    (slide) => slide.status === "published" && isDemoVisible(slide.isDemo)
  )
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 5);
}

/* -------------------------------------------------------------------------- */
/*  Featured categories & collections                                         */
/* -------------------------------------------------------------------------- */

export type FeaturedCategory = {
  department: string;
  slug: string;
  icon: ArtIcon;
  sort: number;
  isDemo?: boolean;
};

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  { department: "women", slug: "sarees", icon: "saree", sort: 1, isDemo: true },
  { department: "men", slug: "panjabi-fatua", icon: "panjabi", sort: 2, isDemo: true },
  { department: "women", slug: "kurtis-tunics", icon: "kurti", sort: 3, isDemo: true },
  { department: "footwear", slug: "sneakers", icon: "sneaker", sort: 4, isDemo: true },
  { department: "bags", slug: "jute-bags", icon: "jute", sort: 5, isDemo: true },
  { department: "accessories", slug: "watches", icon: "watch", sort: 6, isDemo: true },
  { department: "women", slug: "hijabs-scarves", icon: "hijab", sort: 7, isDemo: true },
  { department: "men", slug: "shirts", icon: "shirt", sort: 8, isDemo: true },
];

export function getFeaturedCategories() {
  return FEATURED_CATEGORIES.filter((category) => isDemoVisible(category.isDemo)).sort(
    (a, b) => a.sort - b.sort
  );
}

export type FeaturedCollection = {
  slug: string;
  icon: ArtIcon;
  sort: number;
  isDemo?: boolean;
};

export const FEATURED_COLLECTIONS: FeaturedCollection[] = [
  { slug: "royal-collection", icon: "panjabi", sort: 1, isDemo: true },
  { slug: "heirloom-collection", icon: "saree", sort: 2, isDemo: true },
  { slug: "new-arrivals", icon: "kurti", sort: 3, isDemo: true },
  { slug: "best-sellers", icon: "sneaker", sort: 4, isDemo: true },
];

export function getFeaturedCollections() {
  return FEATURED_COLLECTIONS.filter((collection) => isDemoVisible(collection.isDemo)).sort(
    (a, b) => a.sort - b.sort
  );
}

/* -------------------------------------------------------------------------- */
/*  Why Bengalot                                                              */
/* -------------------------------------------------------------------------- */

export type WhyCard = {
  id: string;
  icon: "cod" | "quality" | "delivery" | "support";
  title: string;
  text: string;
  value: string;
  label: string;
  enabled: boolean;
  sort: number;
  isDemo?: boolean;
};

/**
 * No default numbers. Each visible card must have an admin-entered `value`;
 * cards with an empty value are hidden by the section component.
 */
export const WHY_CARDS: WhyCard[] = [
  {
    id: "cod",
    icon: "cod",
    title: "Cash on Delivery",
    text: "Pay the courier when your order arrives.",
    value: "COD",
    label: "Payment on delivery",
    enabled: true,
    sort: 1,
    isDemo: true,
  },
  {
    id: "quality",
    icon: "quality",
    title: "Packed with care",
    text: "Orders are prepared and packed before dispatch.",
    value: "PK",
    label: "Packing",
    enabled: true,
    sort: 2,
    isDemo: true,
  },
  {
    id: "delivery",
    icon: "delivery",
    title: "Across Bangladesh",
    text: "Delivery to Faridpur and every other district.",
    value: "BD",
    label: "Delivery coverage",
    enabled: true,
    sort: 3,
    isDemo: true,
  },
  {
    id: "support",
    icon: "support",
    title: "WhatsApp support",
    text: "Message 01341739202 for help with an order.",
    value: "WA",
    label: "Direct support",
    enabled: true,
    sort: 4,
    isDemo: true,
  },
];

export function getWhyCards() {
  return WHY_CARDS.filter(
    (card) => card.enabled && card.value.trim() && isDemoVisible(card.isDemo)
  ).sort((a, b) => a.sort - b.sort);
}

/* -------------------------------------------------------------------------- */
/*  Brand story                                                               */
/* -------------------------------------------------------------------------- */

export type BrandStory = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  points: { title: string; text: string }[];
  buttonLabel: string;
  buttonHref: string;
  productSlugs: string[];
  locationLine?: string;
  isDemo?: boolean;
};

export const BRAND_STORY: BrandStory = {
  eyebrow: "The house",
  title: "Cloth, considered",
  paragraphs: [
    "Bengalot is an online fashion house built around considered clothing, clear pricing and dependable delivery.",
    "We keep the range focused, the details quiet and the service personal.",
  ],
  points: [
    { title: "A focused range", text: "Fewer, better pieces instead of endless choice." },
    { title: "Everyday wear", text: "Clothing designed to move through the week." },
    { title: "Direct service", text: "Order online, pay on delivery, message us on WhatsApp." },
  ],
  buttonLabel: "Read our story",
  buttonHref: "/about",
  productSlugs: ["heirloom-jamdani-saree", "golden-hour-jute-tote"],
  isDemo: true,
};

/* -------------------------------------------------------------------------- */
/*  Offer campaigns                                                           */
/* -------------------------------------------------------------------------- */

export type OfferCampaign = {
  id: string;
  eyebrow: string;
  title: string;
  accentWord?: string;
  description: string;
  couponCode: string;
  ctaLabel: string;
  ctaHref: string;
  startAt: string;
  endAt?: string;
  status: "draft" | "published" | "ended";
  theme: "royal" | "magenta" | "gold" | "teal";
  isDemo?: boolean;
  sort?: number;
};

export const OFFER_CAMPAIGNS: OfferCampaign[] = [
  {
    id: "gold-hour",
    eyebrow: "Current offer",
    title: "The Gold Hour",
    accentWord: "Hour",
    description: "A seasonal collection with a little extra off. Use the code at checkout.",
    couponCode: "BENGALOT10",
    ctaLabel: "Shop the offer",
    ctaHref: "/collections/sale",
    startAt: "2026-10-01T00:00:00+06:00",
    endAt: "2026-12-31T23:59:59+06:00",
    status: "published",
    theme: "royal",
    isDemo: true,
  },
];

export function getActiveCampaign(now = new Date()): OfferCampaign | undefined {
  return OFFER_CAMPAIGNS.filter((campaign) => {
    if (campaign.status !== "published" || !isDemoVisible(campaign.isDemo)) return false;
    const start = new Date(campaign.startAt).getTime();
    const end = campaign.endAt ? new Date(campaign.endAt).getTime() : Number.POSITIVE_INFINITY;
    const time = now.getTime();
    return time >= start && time <= end;
  }).sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt))[0];
}

/* -------------------------------------------------------------------------- */
/*  Social strip                                                              */
/* -------------------------------------------------------------------------- */

export type SocialPost = {
  id: string;
  imageUrl: string;
  href: string;
  alt: string;
  sort: number;
  isDemo?: boolean;
};

export const SOCIAL_STRIP: {
  enabled: boolean;
  accountUrl: string;
  accountLabel: string;
  posts: SocialPost[];
} = {
  enabled: false,
  accountUrl: "",
  accountLabel: "",
  posts: [],
};

export function getSocialStrip() {
  const posts = SOCIAL_STRIP.posts
    .filter((post) => post.imageUrl && isDemoVisible(post.isDemo))
    .sort((a, b) => a.sort - b.sort);
  if (!SOCIAL_STRIP.enabled || (!SOCIAL_STRIP.accountUrl && posts.length === 0)) {
    return null;
  }
  return { ...SOCIAL_STRIP, posts };
}
