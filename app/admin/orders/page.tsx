import { Banknote, PackageCheck, ShoppingBag, Truck } from "lucide-react";

import { AdminOrderList } from "@/components/admin/admin-order-list";
import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

type OrderWithItems = Order & { order_items: OrderItem[] };

export default async function AdminOrdersPage() {
  await requireStaff("/admin/orders");
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as OrderWithItems[];

  const inMotion = orders.filter((order) =>
    ["processing", "packed", "shipped"].includes(order.status),
  ).length;
  const delivered = orders.filter((order) => order.status === "delivered").length;
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-6">
        <p className="eyebrow">Orders</p>
        <h1 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.045em] text-ink sm:text-[2.8rem]">
          Every parcel,{" "}
          <span className="display-italic text-teal">accounted for.</span>
        </h1>
        <p className="mt-2 max-w-[36rem] text-[0.76rem] leading-relaxed text-muted">
          Customer details, order contents and the next status — all in one
          place. Changes are logged.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "In motion",
            value: inMotion,
            note: "Processing to shipped",
            icon: Truck,
            tone: "bg-butter text-ink",
          },
          {
            label: "Delivered",
            value: delivered,
            note: "Completed orders",
            icon: PackageCheck,
            tone: "bg-teal text-cream",
          },
          {
            label: "Total orders",
            value: orders.length,
            note: "All time",
            icon: ShoppingBag,
            tone: "bg-lavender text-ink",
          },
          {
            label: "Order value",
            value: formatMoney(revenue),
            note: "Excluding cancellations",
            icon: Banknote,
            tone: "bg-coral text-cream",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.2rem] border border-line bg-cream p-4">
            <div className="flex items-start justify-between">
              <span className={`grid size-8 place-items-center rounded-full ${stat.tone}`}>
                <stat.icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted">
                {stat.label}
              </span>
            </div>
            <p className="price mt-4 font-display text-[1.7rem] leading-none tracking-[-0.04em] text-ink">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[0.6rem] text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <AdminOrderList orders={orders} />
    </div>
  );
}
