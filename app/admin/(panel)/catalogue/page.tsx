import Link from "next/link";
import { ArrowUpRight, ImageIcon, Layers, Package, Plus, Tags } from "lucide-react";
import { AdminPageHeader, AdminStat } from "@/components/admin/admin-ui";
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
  const products = data ?? [];

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

      <div className="mt-4 rounded-[16px] border border-gold/30 bg-gold/[0.05] px-4 py-3 text-[0.62rem] leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Demo products</strong> stay visible on the
        storefront with a Demo badge and a preview notice, but ordering is disabled.
        Edit a product and uncheck <em>Demo product</em> when its real photos, price and
        stock are ready.
      </div>

      <div className="mt-4 overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-3.5">
          <h2 className="font-display text-xl">All products</h2>
          <span className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">{products.length} rows</span>
        </div>
        {products.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto h-6 w-6 text-muted-foreground/40" />
            <p className="mt-2 font-display text-xl">No products yet.</p>
            <Link href="/admin/catalogue/products/new" className="cta-primary mt-4 inline-flex h-9 items-center rounded-full px-4 text-[0.58rem] font-bold uppercase tracking-[0.1em]">
              Add the first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[var(--muted)] text-[0.48rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>{["Product", "Department", "Price", "Stock", "Status", ""].map((head) => <th key={head} className="px-4 py-2.5">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.66rem]">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--muted)] text-[0.5rem] font-bold text-muted-foreground">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                          ) : product.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span>
                          <span className="block font-semibold">{product.name}</span>
                          <span className="block font-mono text-[0.5rem] text-muted-foreground">{product.slug}</span>
                          {(product.payload as { isDemo?: boolean } | null)?.isDemo && (
                            <span className="mt-1 inline-flex rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[0.44rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
                              Demo · ordering disabled
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{product.department} / {product.category}</td>
                    <td className="px-4 py-3 tabular-nums">৳{Number(product.price).toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 tabular-nums">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-[0.48rem] font-bold uppercase tracking-[0.08em] ${product.status === "published" ? "bg-jade/10 text-jade" : "bg-[var(--muted)] text-muted-foreground"}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/catalogue/products/${product.id}`} className="inline-flex items-center gap-1 text-[0.54rem] font-bold uppercase tracking-[0.08em] text-indigo">
                        Edit <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
