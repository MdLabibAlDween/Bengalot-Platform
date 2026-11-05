import { BarChart3 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { SalesReport, type SalesOrder } from "@/components/admin/sales-report";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminPageRole } from "@/lib/admin/auth";

export default async function AdminReportsPage() {
  await requireAdminPageRole(["super_admin", "manager"]);
  const admin = createAdminSupabaseClient();
  const { data } = admin
    ? await admin
        .from("orders")
        .select(
          "id,order_no,created_at,status,payment,payment_status,customer,phone,district,subtotal,discount,bundle_savings,gift_card_amount,delivery,total,items"
        )
        .order("created_at", { ascending: false })
        .limit(2000)
    : { data: [] };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Revenue"
        title="Sales reports"
        description="Filter sales by date, print a clean ledger for your records and export the same data to CSV."
      />
      <SalesReport orders={(data ?? []) as SalesOrder[]} />
      <div className="mt-4 flex items-start gap-2 rounded-[16px] border border-indigo/15 bg-indigo/[0.04] p-3.5 text-[0.62rem] leading-relaxed text-muted-foreground">
        <BarChart3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo" />
        Printed reports use the Bengalot invoice style and include order, customer, district, status, payment, delivery and total columns. CSV opens in Excel or Google Sheets.
      </div>
    </div>
  );
}
