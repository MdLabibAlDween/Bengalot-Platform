import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CustomersManager, type CustomerRow } from "@/components/admin/customers-manager";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminPageRole } from "@/lib/admin/auth";

export default async function AdminCustomersPage() {
  await requireAdminPageRole(["super_admin", "manager", "support"]);
  const admin = createAdminSupabaseClient();
  const { data } = admin
    ? await admin
        .from("profiles")
        .select("id,email,full_name,phone,is_blacklisted,created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false })
        .limit(500)
    : { data: [] };
  return (
    <div>
      <AdminPageHeader
        eyebrow="Customers"
        title="Customer accounts"
        description="Search customer profiles, see how they joined and block abusive accounts."
      />
      <CustomersManager initial={(data ?? []) as CustomerRow[]} />
    </div>
  );
}
