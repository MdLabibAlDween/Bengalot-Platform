import { AdminPageHeader } from "@/components/admin/admin-ui";
import { StaffManager } from "@/components/admin/staff-manager";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminStaffPage() {
  const context = await requireAdminPageRole(["super_admin"]);
  const admin = createAdminSupabaseClient();
  const { data } = admin
    ? await admin
        .from("profiles")
        .select("id,email,full_name,role,is_blacklisted,created_at")
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="Staff & roles"
        description="Super admins, managers, order staff, content editors and support accounts. Every role change is written to the audit log."
      />
      <StaffManager initial={data ?? []} currentRole={context.profile?.role ?? "customer"} />
    </div>
  );
}
