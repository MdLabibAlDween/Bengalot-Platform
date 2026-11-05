import { headers } from "next/headers";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CouriersManager } from "@/components/admin/couriers-manager";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { getSteadfastHealth } from "@/lib/steadfast";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminCouriersPage() {
  await requireAdminPageRole(["super_admin", "manager", "order_staff"]);
  const admin = createAdminSupabaseClient();
  const [health, requestHeaders, shipmentsResponse, eventsResponse] = await Promise.all([
    getSteadfastHealth(),
    headers(),
    admin
      ? admin
          .from("courier_shipments")
          .select("*")
          .eq("provider", "steadfast")
          .order("updated_at", { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] }),
    admin
      ? admin
          .from("courier_events")
          .select("*")
          .eq("provider", "steadfast")
          .order("created_at", { ascending: false })
          .limit(60)
      : Promise.resolve({ data: [] }),
  ]);

  const shipments = shipmentsResponse.data ?? [];
  const orderIds = Array.from(new Set(shipments.map((row) => row.order_id)));
  const { data: orders } = admin && orderIds.length
    ? await admin
        .from("orders")
        .select("id,status,customer,total,phone")
        .in("id", orderIds)
    : { data: [] };
  const orderMap = new Map((orders ?? []).map((order) => [order.id, order]));

  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const proto =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const webhookUrl = `${proto}://${host}/api/webhooks/steadfast`;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Sales"
        title="Courier operations"
        description="Book Steadfast parcels, follow live delivery status and inspect webhook events. Booking is idempotent by order number, so a retry cannot create a second parcel."
      />
      <CouriersManager
        health={health}
        webhookUrl={webhookUrl}
        shipments={shipments.map((row) => ({
          ...row,
          customer: orderMap.get(row.order_id)?.customer ?? "Customer",
          order_status: orderMap.get(row.order_id)?.status ?? "Unknown",
          total: Number(orderMap.get(row.order_id)?.total ?? 0),
          phone: orderMap.get(row.order_id)?.phone ?? "",
        }))}
        events={eventsResponse.data ?? []}
      />
    </div>
  );
}
