export type ArtIcon =
  | "tshirt"
  | "polo"
  | "shirt"
  | "hoodie"
  | "panjabi"
  | "kurti"
  | "saree"
  | "dress"
  | "hijab"
  | "pants"
  | "shorts"
  | "joggers"
  | "jacket"
  | "socks"
  | "innerwear"
  | "sneaker"
  | "sandal"
  | "slipper"
  | "formal"
  | "heel"
  | "kids"
  | "onesie"
  | "nightwear"
  | "jute"
  | "backpack"
  | "tote"
  | "wallet"
  | "duffel"
  | "cap"
  | "watch"
  | "belt"
  | "sunglasses"
  | "jewelry"
  | "perfume"
  | "muffler";

export type Audience = "men" | "women" | "kids" | "unisex";

export type ColorOption = {
  name: string;
  nameBn?: string;
  hex: string;
};

export type SizeOption = {
  label: string;
  stock: number;
};

export type ProductImage = {
  id: string;
  url: string;
  alt?: string;
  color?: string;
  sort: number;
};

export type ProductVariant = {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku?: string;
  price?: number;
  compareAt?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  nameBn?: string;
  department: string;
  category: string;
  audience?: Audience;
  isDemo?: boolean;
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  colors: ColorOption[];
  sizes: SizeOption[];
  variants?: ProductVariant[];
  images?: ProductImage[];
  videoUrl?: string;
  art: ArtIcon;
  palette: [string, string];
  imageUrl?: string;
  hoverImageUrl?: string;
  badge?: "New" | "Bestseller" | "Limited" | "Sale";
  shortDescription: string;
  description: string;
  materials: string;
  care: string;
  tags: string[];
  sku: string;
  sizeGuideId: string;
  collectionSlug?: string;
  collectionNote?: string;
  seoTitle?: string;
  seoDescription?: string;
  highlights?: string[];
  materialLines?: string[];
  careLines?: string[];
  fitNote?: string;
  createdAt: string;
  stock: number;
  sets: ("new" | "best" | "trending")[];
};

export type SizeGuideTemplate = {
  id: string;
  name: string;
  note: string;
  unit: string;
  columns: string[];
  rows: string[][];
  howTo: string[];
};

export type Department = {
  slug: string;
  name: string;
  nameBn: string;
  tagline: string;
  description: string;
  accent: string;
  accentDeep: string;
  icon: ArtIcon;
  groups: { title: string; categories: string[] }[];
  heroPalette: [string, string];
  editorial: string;
  sort: number;
};

export type Category = {
  slug: string;
  name: string;
  nameBn: string;
  department: string;
  audience?: Audience;
  isDemo?: boolean;
  icon: ArtIcon;
  tagline: string;
  imageUrl?: string;
};

export type Review = {
  id: string;
  productSlug: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
  isDemo?: boolean;
  status?: "pending" | "approved";
};

export type ReelPlatform = "instagram" | "youtube" | "tiktok" | "file";

export type Reel = {
  id: string;
  title: string;
  caption?: string;
  platform: ReelPlatform;
  /** Direct video file (model walk) or public reel/post URL for embeds. */
  videoUrl?: string;
  /** Fallback destination when there is no embeddable video yet. */
  watchUrl?: string;
  /** Optional poster image stored in Supabase storage. */
  posterUrl?: string;
  productSlug?: string;
  isDemo?: boolean;
  status: "draft" | "published";
  sort: number;
};

export type CartLine = {
  productSlug: string;
  size: string;
  color: string;
  qty: number;
  bundleId?: string;
  bundleName?: string;
  /**
   * A snapshot of the product at the time it was added. This lets admin-created
   * products (which are not part of the static catalogue) render correctly in
   * the cart, drawer and checkout.
   */
  snapshot?: Product;
};

export type BundleDiscountType = "none" | "percent" | "fixed";

export type BundleItem = {
  productSlug: string;
  quantity: number;
  sort: number;
};

export type Bundle = {
  id: string;
  slug: string;
  name: string;
  nameBn?: string;
  department: string;
  isDemo?: boolean;
  shortDescription: string;
  description: string;
  coverArt: ArtIcon;
  coverPalette: [string, string];
  discountType: BundleDiscountType;
  discountValue: number;
  status: "draft" | "published";
  featured: boolean;
  allowPartialPurchase: boolean;
  items: BundleItem[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  sort: number;
};

export type Coupon = {
  code: string;
  title: string;
  description: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minSpend: number;
  expires: string;
  tone: string;
  isDemo?: boolean;
  /** Empty or missing means the whole catalogue. */
  productSlugs?: string[];
};

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Handed to Courier"
  | "In Transit"
  | "Delivered"
  | "Returning"
  | "Cancelled"
  | "Returned"
  | "Failed Delivery"
  | "Refunded";

export type OrderItem = {
  productSlug: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
  bundleId?: string;
  bundleName?: string;
};

export type Order = {
  orderNo: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  bundleSavings?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  delivery: number;
  total: number;
  payment: "Cash on Delivery" | "bKash";
  paymentStatus: "Unpaid" | "Paid" | "Refunded";
  district: string;
  address: string;
  customer: string;
  phone: string;
  note?: string;
  courier?: string;
  courierStatus?: string;
  courierConsignmentId?: number;
  trackingCode?: string;
  trackingLink?: string;
  events: { status: OrderStatus | "Order Placed"; date: string; note: string }[];
};
