import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { changeOrderStatus, ORDER_STATUSES } from "@/lib/admin/order-status";
import {
  bookSteadfastOrder,
  getSteadfastHealth,
  type SteadfastOrderRow,
} from "@/lib/steadfast";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
});

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "order_staff", "support"]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid order status.");

  const result = await changeOrderStatus(auth.admin, {
    orderId: parsed.data.id,
    status: parsed.data.status,
    actor: {
      id: auth.context.user.id,
      email: auth.context.profile.email,
    },
    source: "admin",
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.code });
  }

  let courierBooking:
    | { ok: boolean; message: string; trackingCode?: string; consignmentId?: number }
    | undefined;
  if (["Confirmed", "Processing"].includes(parsed.data.status)) {
    const health = await getSteadfastHealth();
    if (health.configured && health.autoBookOnConfirmed) {
      const { data: fullOrder } = await auth.admin
        .from("orders")
        .select("*")
        .eq("id", parsed.data.id)
        .maybeSingle();
      if (fullOrder) {
        try {
          const booking = await bookSteadfastOrder(
            auth.admin,
            fullOrder as SteadfastOrderRow
          );
          if (booking.ok) {
            courierBooking = {
              ok: true,
              message: `Steadfast parcel booked. Tracking ${booking.parcel.tracking_code}.`,
              trackingCode: booking.parcel.tracking_code,
              consignmentId: booking.parcel.consignment_id,
            };
          } else if ("alreadyBooked" in booking && booking.alreadyBooked) {
            courierBooking = {
              ok: true,
              message: "This order already has a Steadfast parcel.",
            };
          } else {
            courierBooking = {
              ok: false,
              message: booking.error ?? "Steadfast booking failed.",
            };
          }
        } catch (error) {
          courierBooking = {
            ok: false,
            message:
              error instanceof Error
                ? error.message
                : "Steadfast booking failed.",
          };
          await writeAuditLog({
            actorId: auth.context.user.id,
            actorEmail: auth.context.profile.email,
            action: "steadfast_auto_book_failed",
            entity: "orders",
            entityId: parsed.data.id,
            after: { error: courierBooking.message },
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true, order: result.order, courierBooking });
}
