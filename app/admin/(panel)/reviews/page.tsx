import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminReviewsPage() {
  await requireAdminPageRole(["super_admin", "manager", "content_editor", "support"]);
  const admin = createAdminSupabaseClient();
  const { data } = admin
    ? await admin.from("reviews").select("*").order("created_at", { ascending: false }).limit(500)
    : { data: [] };
  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Reviews"
        description="Moderate verified-buyer reviews before they appear on product pages."
      />
      <ReviewsManager initial={data ?? []} />
    </div>
  );
}
