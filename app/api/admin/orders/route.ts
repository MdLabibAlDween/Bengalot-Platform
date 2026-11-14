import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/lib/types";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["processing", "packed", "shipped", "delivered", "cancelled"]),
});

type OrderWithItems = Order & { order_items: OrderItem[] };

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.profile || !STAFF_ROLES.has(current.profile.role)) {
    return NextResponse.json({ message: "Not authorised." }, { status: 403 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error: readError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (readError) throw readError;
    if (!data) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const order = data as OrderWithItems;
    const nextStatus = parsed.data.status;
    if (order.status === nextStatus) {
      return NextResponse.json({ ok: true });
    }

    const physicalItems = order.order_items.filter(
      (item) => item.type === "physical" && item.product_id,
    );

    if (nextStatus === "cancelled" && order.status !== "cancelled") {
      for (const item of physicalItems) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .maybeSingle();
        if (!product) continue;
        await supabase
          .from("products")
          .update({ stock: Number(product.stock) + item.quantity })
          .eq("id", item.product_id);
      }
    }

    if (order.status === "cancelled" && nextStatus !== "cancelled") {
      const requested = new Map<string, number>();
      for (const item of physicalItems) {
        requested.set(
          item.product_id as string,
          (requested.get(item.product_id as string) ?? 0) + item.quantity,
        );
      }

      for (const [productId, quantity] of requested) {
        const { data: product } = await supabase
          .from("products")
          .select("title,stock")
          .eq("id", productId)
          .maybeSingle();
        if (!product) {
          return NextResponse.json(
            { message: "A product in this order no longer exists." },
            { status: 409 },
          );
        }
        if (Number(product.stock) < quantity) {
          return NextResponse.json(
            {
              message: `${product.title} does not have enough stock to reopen this order.`,
            },
            { status: 409 },
          );
        }
      }

      for (const [productId, quantity] of requested) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();
        if (!product) continue;
        await supabase
          .from("products")
          .update({ stock: Number(product.stock) - quantity })
          .eq("id", productId);
      }
    }

    const paymentStatus =
      nextStatus === "delivered" && order.payment_method === "cod"
        ? "paid"
        : nextStatus === "cancelled" && order.payment_status === "paid"
          ? "refunded"
          : order.payment_status === "refunded" && nextStatus !== "cancelled"
            ? "pending"
            : order.payment_status;

    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus, payment_status: paymentStatus })
      .eq("id", order.id);
    if (error) throw error;

    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "order.status",
      entity: "order",
      entity_id: order.id,
      before: {
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
      },
      after: { status: nextStatus, payment_status: paymentStatus },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/account/orders");
    revalidatePath("/checkout/success");

    return NextResponse.json({ ok: true, paymentStatus });
  } catch (error) {
    console.error("Order update failed", error);
    return NextResponse.json(
      { message: "The order could not be updated." },
      { status: 500 },
    );
  }
}
