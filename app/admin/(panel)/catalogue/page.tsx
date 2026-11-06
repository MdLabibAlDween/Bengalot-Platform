import Link from "next/link";
import { ImageIcon, Layers, Package, Plus, Tags } from "lucide-react";
import { AdminPageHeader, AdminStat } from "@/components/admin/admin-ui";
import {
  CatalogueTable,
  type CatalogueProduct,
} from "@/components/admin/catalogue-table";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { categories, departments } from "@/lib/data";

export default async function AdminCataloguePage() {
  const admin = createAdminSupabaseClient();
  const { data } = admin
    ? await admin
        .from("products")
        .select("id,slug,name,status,department,category,price,stock,image_url,payload")
        .order("created_at", { ascending: false })
        .limit(500)
    : { data: [] };
  const products = (data ?? []) as CatalogueProduct[];
  const demoCount = products.filter((product) => Boolean(product.payload?.isDemo)).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Catalogue"
        description="Add, edit, publish and remove products. Published products are available to the storefront bridge."
      >
        <Link
          href="/admin/catalogue/products/new"
          className="cta-primary inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.58rem] font-bold uppercase tracking-[0.1em]"
        >
          <Plus className="h-3.5 w-3.5" /> Add product
        </Link>
        <Link
          href="/admin/media"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[0.58rem] font-bold uppercase tracking-[0.1em]"
        >
          <ImageIcon className="h-3.5 w-3.5" /> Images
        </Link>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStat label="Products" value={products.length} icon={Package} tone="indigo" />
        <AdminStat label="Departments" value={departments.length} icon={Layers} tone="magenta" />
        <AdminStat label="Categories" value={categories.length} icon={Tags} tone="teal" />
      </div>

      {demoCount > 0 && (
        <div className="mt-4 rounded-[16px] border border-gold/30 bg-gold/[0.05] px-4 py-3 text-[0.62rem] leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Demo products</strong> stay visible on the
          storefront with a Demo badge and a preview notice, but ordering is disabled.
          Select them below to delete them in bulk, or uncheck <em>Demo product</em> when
          real photos, price and stock are ready.
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-3.5">
          <h2 className="font-display text-xl">All products</h2>
          <span className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {products.length} rows
          </span>
        </div>
        {products.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto h-6 w-6 text-muted-foreground/40" />
            <p className="mt-2 font-display text-xl">No products yet.</p>
            <Link
              href="/admin/catalogue/products/new"
              className="cta-primary mt-4 inline-flex h-9 items-center rounded-full px-4 text-[0.58rem] font-bold uppercase tracking-[0.1em]"
            >
              Add the first product
            </Link>
          </div>
        ) : (
          <CatalogueTable products={products} />
        )}
      </div>
    </div>
  );
}
