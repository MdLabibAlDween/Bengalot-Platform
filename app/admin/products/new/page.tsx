import type { Metadata } from "next";

import { ProductEditor } from "@/components/admin/product-editor";
import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add product",
};

function emptyProduct(categories: Category[]): Product {
  const category = categories[0];
  const fallback = {
    "notion-templates": { art_key: "notion", palette: ["#0B4F4A", "#0E7C7B", "#F6D365"] },
    "study-cards": { art_key: "cards", palette: ["#E05A3F", "#F0755A", "#F6D365"] },
    "printed-planners": { art_key: "planner", palette: ["#2A6F97", "#8ECAE6", "#F6D365"] },
    "focus-productivity": { art_key: "guide", palette: ["#2B2D42", "#4A4E69", "#EF8354"] },
    bundles: { art_key: "bundle", palette: ["#E05A3F", "#0E7C7B", "#F6D365"] },
  }[category?.slug ?? ""];

  return {
    id: "",
    slug: "",
    sku: null,
    title: "",
    title_bn: null,
    subtitle: "",
    description: "",
    category_id: null,
    category_slug: category?.slug ?? "",
    type: "physical",
    format: "",
    price: 0,
    compare_at: null,
    stock: 0,
    badge: null,
    art_key: fallback?.art_key ?? "notion",
    palette: fallback?.palette ?? ["#0d6f6d", "#0e7c7b", "#f6d365"],
    includes: [],
    requirements: [],
    specs: [],
    preview: {},
    tags: [],
    featured: false,
    is_published: true,
    sort: 99,
    rating: 4.9,
    review_count: 0,
    created_at: "",
    updated_at: "",
  };
}

export default async function AdminNewProductPage() {
  await requireStaff("/admin/products/new");
  const supabase = createSupabaseAdminClient();
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase.from("products").select("*").order("sort"),
  ]);
  const categories = (categoriesResult.data ?? []) as Category[];

  return (
    <ProductEditor
      mode="create"
      product={emptyProduct(categories)}
      categories={categories}
      products={(productsResult.data ?? []) as Product[]}
    />
  );
}
