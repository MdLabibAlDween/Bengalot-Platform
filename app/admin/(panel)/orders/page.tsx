import { Banknote, ShoppingBag } from "lucide-react";
import { AdminPageHeader, AdminStat } from "@/components/admin/admin-ui";
import { OrdersManager, type AdminOrder } from "@/components/admin/orders-manager";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatBDT } from "@/lib/utils";
import { requireAdminPageRole } from "@/lib/admin/auth";

export default async function AdminOrdersPage() {
  await requireAdminPageRole(["super_admin", "manager", "order_staff", "support"]);
  const admin = createAdminSupabaseClient();
  const { data } = admin
    ? await admin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };
  const orders = (data ?? []) as AdminOrder[];
  const pending = orders.filter((order) => order.status === "Pending").length;
  const delivered = orders.filter((order) => order.status === "Delivered").length;
  const revenue = orders
    .filter((order) => !["Cancelled", "Returned", "Refunded"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Order desk"
        description="Every guest checkout is stored in Supabase. Track status, inspect items and move orders through fulfilment."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <AdminStat label="Total orders" value={orders.length} icon={ShoppingBag} tone="indigo" />
        <AdminStat label="Pending" value={pending} icon={ShoppingBag} tone="saffron" />
        <AdminStat label="Collected / due" value={formatBDT(revenue)} helper={`${delivered} delivered`} icon={Banknote} tone="jade" />
      </div>
      <OrdersManager orders={orders} />
    </div>
  );
}
