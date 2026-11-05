import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CouponsManager } from "@/components/admin/coupons-manager";
import { OfferCampaignsManager } from "@/components/admin/offer-campaigns-manager";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { products as demoProducts } from "@/lib/data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getOfferCampaigns } from "@/lib/offers-db";

export default async function AdminOffersPage() {
  await requireAdminPageRole(["super_admin", "manager", "content_editor"]);
  const admin = createAdminSupabaseClient();
  const [couponResult, campaignResult, productResult] = await Promise.all([
    admin
      ? admin.from("coupons").select("*").order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    getOfferCampaigns(),
    admin
      ? admin
          .from("products")
          .select("slug,name,department,category,price,status,payload")
          .order("name")
      : Promise.resolve({ data: [] }),
  ]);

  const bySlug = new Map<string, {
    slug: string;
    name: string;
    department: string;
    category: string;
    price: number;
    status?: string;
    isDemo?: boolean;
  }>();
  for (const product of demoProducts) {
    bySlug.set(product.slug, {
      slug: product.slug,
      name: product.name,
      department: product.department,
      category: product.category,
      price: product.price,
      isDemo: Boolean(product.isDemo),
    });
  }
  for (const row of productResult.data ?? []) {
    const payload = (row.payload ?? {}) as { isDemo?: boolean };
    bySlug.set(row.slug, {
      slug: row.slug,
      name: row.name,
      department: row.department,
      category: row.category,
      price: Number(row.price),
      status: row.status,
      isDemo: payload.isDemo === true,
    });
  }
  const productOptions = [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
  const couponCodes = (couponResult.data ?? []).map((row) => row.code as string);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Revenue"
        title="Offers & coupons"
        description="Control the homepage countdown, campaign copy and CTA, then choose exactly which products each coupon can discount."
      />

      <OfferCampaignsManager initial={campaignResult} coupons={couponCodes} />

      <section>
        <div className="mb-4">
          <p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-gold">
            Coupon codes
          </p>
          <h2 className="mt-1 font-display text-2xl">Coupon builder.</h2>
          <p className="mt-1 max-w-2xl text-[0.66rem] leading-relaxed text-muted-foreground">
            Set the discount, minimum spend, expiry and product scope. An empty product
            selection applies the code to the whole catalogue.
          </p>
        </div>
        <CouponsManager initial={couponResult.data ?? []} products={productOptions} />
      </section>
    </div>
  );
}
