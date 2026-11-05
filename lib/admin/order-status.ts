import "server-only";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { awardOrderPoints, notifyOrderStatus } from "@/lib/account-db";
import { writeAuditLog } from "@/lib/admin/auth";
import { sendDiscordAlert } from "@/lib/admin/discord";
import { sendOrderStatusEmail } from "@/lib/email";
import { adjustStock } from "@/lib/admin/stock";
import {
  redeemGiftCardForOrder,
  refundGiftCardForOrder,
} from "@/lib/gift-cards-db";
import { ensureInvoiceForOrder } from "@/lib/invoices";

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Handed to Courier",
  "In Transit",
  "Delivered",
  "Returning",
  "Cancelled",
  "Returned",
  "Failed Delivery",
  "Refunded",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const TERMINAL_STATUSES = new Set([
  "Cancelled",
  "Returned",
  "Failed Delivery",
  "Refunded",
]);

export function statusColor(status: string) {
  switch (status) {
    case "Delivered":
      return 0x2e7d5b;
    case "Returning":
      return 0xc9a227;
    case "Cancelled":
    case "Returned":
    case "Failed Delivery":
    case "Refunded":
      return 0xb03a2e;
    case "Handed to Courier":
    case "In Transit":
      return 0x2a6f97;
    case "Confirmed":
    case "Processing":
      return 0x3b2a8c;
    default:
      return 0xc9a227;
  }
}

export async function changeOrderStatus(
  admin: SupabaseClient,
  input: {
    orderId: string;
    status: OrderStatusValue;
    actor?: { id?: string; email?: string | null } | null;
    source?: "admin" | "steadfast_webhook" | "steadfast_sync" | "system";
    note?: string;
    skipRewards?: boolean;
  }
): Promise<
  | { ok: true; order: Record<string, unknown>; changed: boolean }
  | { ok: false; error: string; code: number }
> {
  const { data: previous } = await admin
    .from("orders")
    .select("status,order_no,customer,total,items,gift_card_code,gift_card_amount,email,phone")
    .eq("id", input.orderId)
    .maybeSingle();
  if (!previous) return { ok: false, error: "Order not found.", code: 404 };

  if (previous.status === input.status) {
    const { data: current } = await admin
      .from("orders")
      .select("id,order_no,status,customer,total,email,phone")
      .eq("id", input.orderId)
      .maybeSingle();
    return { ok: true, order: (current ?? previous) as Record<string, unknown>, changed: false };
  }

  const items = Array.isArray(previous.items)
    ? (previous.items as { productSlug: string; size: string; color?: string; qty: number }[])
    : [];
  const wasTerminal = TERMINAL_STATUSES.has(String(previous.status));
  const isTerminal = TERMINAL_STATUSES.has(input.status);
  const stockDirection: 1 | -1 | null =
    !wasTerminal && isTerminal ? 1 : wasTerminal && !isTerminal ? -1 : null;

  let adjusted = false;
  let giftAdjusted: "refund" | "redeem" | null = null;
  const giftCode = previous.gift_card_code ?? "";
  const giftAmount = Number(previous.gift_card_amount ?? 0);

  if (giftCode && giftAmount > 0) {
    if (!wasTerminal && isTerminal) {
      const refund = await refundGiftCardForOrder(
        admin,
        giftCode,
        giftAmount,
        previous.order_no
      );
      if (!refund.ok) return { ok: false, error: refund.error, code: 409 };
      giftAdjusted = "refund";
    } else if (wasTerminal && !isTerminal) {
      const redeem = await redeemGiftCardForOrder(
        admin,
        giftCode,
        giftAmount,
        previous.order_no
      );
      if (!redeem.ok) return { ok: false, error: redeem.error, code: 409 };
      giftAdjusted = "redeem";
    }
  }

  const undoGift = async () => {
    if (!giftCode || giftAmount <= 0 || !giftAdjusted) return;
    if (giftAdjusted === "refund") {
      await redeemGiftCardForOrder(admin, giftCode, giftAmount, previous.order_no);
    } else {
      await refundGiftCardForOrder(admin, giftCode, giftAmount, previous.order_no);
    }
  };

  if (stockDirection && items.length > 0) {
    const adjustment = await adjustStock(admin, items, stockDirection);
    if (!adjustment.ok) {
      await undoGift();
      return { ok: false, error: adjustment.error, code: 409 };
    }
    adjusted = true;
  }

  const { data, error } = await admin
    .from("orders")
    .update({ status: input.status })
    .eq("id", input.orderId)
    .select("id,order_no,status,customer,total,email,phone")
    .single();
  if (error || !data) {
    await undoGift();
    if (adjusted && stockDirection) {
      await adjustStock(admin, items, stockDirection === 1 ? -1 : 1);
    }
    return { ok: false, error: error?.message ?? "Could not update the order.", code: 400 };
  }

  if (input.actor?.id) {
    await writeAuditLog({
      actorId: input.actor.id,
      actorEmail: input.actor.email ?? null,
      action:
        input.source === "steadfast_webhook" || input.source === "steadfast_sync"
          ? "order_status_synced_from_courier"
          : "order_status_updated",
      entity: "orders",
      entityId: input.orderId,
      before: previous,
      after: data,
    });
  }

  await admin.from("order_events").insert({
    order_id: data.id,
    order_no: data.order_no,
    status: data.status,
    note:
      input.note ??
      (input.actor?.email
        ? `Status changed by ${input.actor.email}.`
        : "Status updated by the store."),
    actor_email: input.actor?.email ?? null,
  });

  await notifyOrderStatus(
    admin,
    {
      order_no: data.order_no,
      customer: data.customer,
      email: data.email,
      phone: data.phone,
    },
    data.status
  );

  if (data.status === "Delivered" && !input.skipRewards) {
    await awardOrderPoints(admin, {
      order_no: data.order_no,
      total: Number(data.total),
      email: data.email,
      phone: data.phone,
    });
  }

  if (["Confirmed", "Processing", "Delivered"].includes(data.status)) {
    try {
      await ensureInvoiceForOrder(admin, data.order_no);
    } catch {
      // Invoicing is best-effort and must not roll back a status change.
    }
  }

  const previousStatus = String(previous.status);
  after(async () => {
    await Promise.allSettled([
      (async () => {
        try {
          await sendDiscordAlert(
            {
              title: `Order ${data.order_no} — ${data.status}`,
              description: `Status changed from **${previousStatus}** to **${data.status}**.`,
              color: statusColor(data.status),
              event: "order_status",
              fields: [
                {
                  name: "Customer",
                  value: String(data.customer ?? previous.customer ?? "—"),
                  inline: true,
                },
                {
                  name: "Total",
                  value: `৳${Number(data.total ?? previous.total ?? 0).toLocaleString("en-US")}`,
                  inline: true,
                },
              ],
            },
            { source: "order_status" }
          );
        } catch {
          // A status update must succeed even when Discord is unreachable.
        }
      })(),
      (async () => {
        try {
          const { data: fullOrder } = await admin
            .from("orders")
            .select("*")
            .eq("id", input.orderId)
            .maybeSingle();
          if (fullOrder?.email) {
            await sendOrderStatusEmail(admin, fullOrder as never, data.status);
          }
        } catch {
          // Email delivery is best-effort and never rolls back a status change.
        }
      })(),
    ]);
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/couriers");
  return { ok: true, order: data as Record<string, unknown>, changed: true };
}
