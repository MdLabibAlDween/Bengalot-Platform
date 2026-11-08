import { ArrowUpRight, Package, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

import { AdminProductTable } from "@/components/admin/admin-product-table";
import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireStaff("/admin/products");
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("products").select("*").order("sort");
  const products = (data ?? []) as Product[];

  const published = products.filter((product) => product.is_published).length;
  const featured = products.filter((product) => product.featured).length;
  const shelfValue = products.reduce((sum, product) => sum + product.price, 0);
  const lowStock = products.filter(
    (product) => product.type === "physical" && product.stock < 25,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.045em] text-ink sm:text-[2.8rem]">
            The shelf,{" "}
            <span className="display-italic text-teal">arranged.</span>
          </h1>
          <p className="mt-2 max-w-[34rem] text-[0.76rem] leading-relaxed text-muted">
            Everything visible in the shop. Change prices, artwork, stock and
            publication status without touching code.
          </p>
        </div>
        <Link href="/admin/promotions" className="btn btn-outline btn-sm">
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
          Homepage banners
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Published",
            value: published,
            note: "Live in the shop",
            icon: Package,
            tone: "bg-teal text-cream",
          },
          {
            label: "Featured",
            value: featured,
            note: "On the homepage rail",
            icon: Star,
            tone: "bg-butter text-ink",
          },
          {
            label: "Shelf value",
            value: formatMoney(shelfValue),
            note: "One of each product",
            icon: TrendingUp,
            tone: "bg-lavender text-ink",
          },
          {
            label: "Low stock",
            value: lowStock,
            note: "Physical tools under 25",
            icon: Package,
            tone: "bg-coral text-cream",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.2rem] border border-line bg-cream p-4">
            <div className="flex items-start justify-between">
              <span className={`grid size-8 place-items-center rounded-full ${stat.tone}`}>
                <stat.icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted">
                {stat.label}
              </span>
            </div>
            <p className="price mt-4 font-display text-[1.7rem] leading-none tracking-[-0.04em] text-ink">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[0.6rem] text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <AdminProductTable products={products} />
    </div>
  );
}
