import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductEditor } from "@/components/admin/product-editor";
import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit ${slug}` };
}

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireStaff("/admin/products");
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();
  const [productResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").eq("slug", slug).maybeSingle(),
    supabase.from("categories").select("*").order("sort"),
  ]);

  if (!productResult.data) notFound();

  return (
    <ProductEditor
      product={productResult.data as Product}
      categories={(categoriesResult.data ?? []) as Category[]}
    />
  );
}
