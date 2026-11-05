import type { Metadata } from "next";
import { OrderDetailView } from "@/components/account/order-detail-view";
import { getInvoiceSettings } from "@/lib/admin/settings";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { digitsOnly, mapOrderRow, type OrderRow } from "@/lib/order-map";
import { getInvoiceForOrder } from "@/lib/invoices";
import type { Order } from "@/lib/types";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const invoice = await getInvoiceSettings();
  let initialOrder: Order | undefined;
  let invoiceNumber: string | undefined;

  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  if (supabase && admin) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email,phone")
        .eq("id", user.id)
        .maybeSingle();
      const { data: row } = await admin
        .from("orders")
        .select("*")
        .eq("order_no", orderNo.toUpperCase())
        .maybeSingle();
      if (row) {
        const email = profile?.email || user.email || "";
        const phone = digitsOnly(profile?.phone || "");
        const orderEmail = String(row.email ?? "").toLowerCase();
        const orderPhone = digitsOnly(String(row.phone ?? ""));
        if (
          (email && orderEmail === email.toLowerCase()) ||
          (phone && orderPhone === phone)
        ) {
          initialOrder = mapOrderRow(row as OrderRow);
          const invoiceRecord = await getInvoiceForOrder(admin, row.order_no);
          invoiceNumber = invoiceRecord?.invoice_no;
        }
      }
    }
  }

  return (
    <OrderDetailView
      orderNo={orderNo}
      invoice={invoice}
      invoiceNumber={invoiceNumber}
      initialOrder={initialOrder}
    />
  );
}
