import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";
import { createZinipayInvoice, isZinipayConfigured } from "@/lib/zinipay";

export const runtime = "nodejs";

const schema = z.object({
  orderNumber: z.string().trim().min(3).max(80),
});

export async function POST(request: Request) {
  if (!isZinipayConfigured()) {
    return NextResponse.json(
      { message: "Online payment is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Missing order reference." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", parsed.data.orderNumber)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const order = data as Order;

    if (order.payment_method !== "zinipay") {
      return NextResponse.json(
        { message: "This order does not use online payment." },
        { status: 400 },
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { message: "This order is already paid." },
        { status: 409 },
      );
    }

    const cookieStore = await cookies();
    const cookieOrderId = cookieStore.get("bengalot-order-access")?.value;
    const current = await getCurrentUser();
    const ownsOrder = Boolean(
      current?.user && order.user_id === current.user.id,
    );
    const isStaff = Boolean(
      current?.profile && STAFF_ROLES.has(current.profile.role),
    );

    if (cookieOrderId !== order.id && !ownsOrder && !isStaff) {
      return NextResponse.json({ message: "Not authorised." }, { status: 403 });
    }

    if (order.status === "cancelled") {
      await supabase
        .from("orders")
        .update({ status: "processing" })
        .eq("id", order.id);
    }

    const invoice = await createZinipayInvoice({
      ...order,
      status: order.status === "cancelled" ? "processing" : order.status,
    });

    if (!invoice.ok) {
      return NextResponse.json({ message: invoice.message }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      paymentUrl: invoice.paymentUrl,
    });
  } catch (error) {
    console.error("ZiniPay retry failed", error);
    return NextResponse.json(
      { message: "The payment page could not open. Please try again." },
      { status: 500 },
    );
  }
}
