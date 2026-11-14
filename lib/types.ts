export type ProductType = "digital" | "physical" | "bundle";

export type ProductSpec = {
  label: string;
  value: string;
};

export type NotionPreview = {
  kind: "notion";
  modules: { title: string; meta: string }[];
};

export type FlashcardPreview = {
  kind: "flashcards";
  cards: { front: string; hint?: string; back: string; example?: string }[];
};

export type PlannerPreview = {
  kind: "planner";
  spread: string;
  subjects: string[];
};

export type GuidePreview = {
  kind: "guide";
  chapters: string[];
  quote: string;
};

export type TimerPreview = {
  kind: "timer";
  timer: string;
  marks?: string[];
};

export type BundlePreview = {
  kind: "bundle";
  items: string[];
  /** Product slugs that unlock in the customer library with this bundle. */
  productSlugs?: string[];
};

export type ProductPreview =
  | NotionPreview
  | FlashcardPreview
  | PlannerPreview
  | GuidePreview
  | TimerPreview
  | BundlePreview
  | Record<string, unknown>;

export type Product = {
  id: string;
  slug: string;
  sku: string | null;
  title: string;
  title_bn: string | null;
  subtitle: string;
  description: string;
  category_id: string | null;
  category_slug: string;
  type: ProductType;
  format: string;
  price: number;
  compare_at: number | null;
  stock: number;
  badge: string | null;
  art_key: string;
  palette: string[];
  includes: string[];
  requirements: string[];
  specs: ProductSpec[];
  preview: ProductPreview;
  tags: string[];
  featured: boolean;
  is_published: boolean;
  sort: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
};

export type CategoryTheme = {
  from: string;
  to: string;
  ink: string;
  accent: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  tagline: string | null;
  description: string | null;
  icon: string;
  art_key: string;
  theme: CategoryTheme;
  sort: number;
  is_published: boolean;
};

export type PromotionTheme = {
  surface: string;
  ink: string;
  accent: string;
  from: string;
  to: string;
  image?: string | null;
};

export type Promotion = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta_label: string;
  cta_href: string;
  art_key: string;
  theme: PromotionTheme;
  sort: number;
  is_active: boolean;
};

export type Review = {
  id: string;
  product_id: string;
  author: string;
  city: string | null;
  rating: number;
  body: string;
  is_approved: boolean;
  created_at: string;
};

export type StoreSettings = {
  name: string;
  slogan: string;
  announcement: string;
  whatsapp: string;
  supportEmail: string;
  city: string;
  deliveryInside: number;
  deliveryOutside: number;
  freeDeliveryThreshold: number;
  currency: string;
};

export type OrderStatus =
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  slug: string;
  type: string;
  format: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
};

export type Entitlement = {
  id: string;
  user_id: string;
  product_id: string | null;
  order_id: string | null;
  title: string;
  access_label: string;
  access_url: string | null;
  granted_at: string;
  last_accessed_at: string | null;
};

export type PromoCodeType = "percent" | "fixed";

export type PromoCode = {
  code: string;
  description: string;
  type: PromoCodeType;
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  active: boolean;
  expiresAt: string | null;
};

export type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_hue: number;
  role: "customer" | "staff" | "admin" | "owner";
  created_at: string;
};

export type CartLine = {
  slug: string;
  title: string;
  price: number;
  compare_at: number | null;
  type: ProductType;
  format: string;
  art_key: string;
  palette: string[];
  quantity: number;
  stock: number;
  /** Cover photo uploaded in the studio, if the product has one. */
  image?: string;
  /** Whether this line carries digital access, including physical bundles. */
  has_digital_content?: boolean;
};
