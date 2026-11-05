import { AdminPageHeader } from "@/components/admin/admin-ui";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminTaxonomyPage() {
  await requireAdminPageRole(["super_admin", "manager", "content_editor"]);
  const admin = createAdminSupabaseClient();
  const [categories, collections, bundles, products] = admin
    ? await Promise.all([
        admin.from("store_categories").select("*").order("department").order("sort"),
        admin.from("store_collections").select("*").order("sort"),
        admin.from("store_bundles").select("*").order("department").order("sort"),
        admin
          .from("products")
          .select("slug,name,department")
          .order("name", { ascending: true })
          .limit(2000),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue structure"
        title="Categories, collections & bundles"
        description="Shape how the catalogue is browsed. Categories feed the department navigation, collections can be curated by hand, and bundles group real products into complete outfits."
      />
      <TaxonomyManager
        initialCategories={(categories.data ?? []) as never[]}
        initialCollections={(collections.data ?? []) as never[]}
        initialBundles={(bundles.data ?? []) as never[]}
        products={(products.data ?? []) as never[]}
      />
    </div>
  );
}
