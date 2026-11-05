import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import {
  bookSteadfastOrder,
  syncAllSteadfastOrders,
  syncSteadfastOrder,
  type SteadfastOrderRow,
} from "@/lib/steadfast";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("book"), orderId: z.string().uuid() }),
  z.object({ action: z.literal("sync"), orderId: z.string().uuid() }),
  z.object({ action: z.literal("sync_all") }),
]);

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi([
    "super_admin",
    "manager",
    "order_staff",
  ]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid courier action.");

  if (parsed.data.action === "sync_all") {
    const result = await syncAllSteadfastOrders(auth.admin);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "steadfast_bulk_sync",
      entity: "courier_shipments",
      after: { total: result.total, succeeded: result.succeeded, failed: result.failed },
    });
    revalidatePath("/admin/couriers");
    revalidatePath("/admin/orders");
    return NextResponse.json({ ok: true, ...result });
  }

  const { data: order } = await auth.admin
    .from("orders")
    .select("*")
    .eq("id", parsed.data.orderId)
    .maybeSingle();
  if (!order) return badRequest("Order not found.");
  const row = order as SteadfastOrderRow;

  if (parsed.data.action === "book") {
    if (["Cancelled", "Returned", "Refunded", "Failed Delivery"].includes(row.status)) {
      return badRequest("This order is already closed and cannot be booked.");
    }
    try {
      const result = await bookSteadfastOrder(auth.admin, row);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error, alreadyBooked: result.alreadyBooked ?? false },
          { status: result.alreadyBooked ? 409 : 400 }
        );
      }
      await writeAuditLog({
        actorId: auth.context.user.id,
        actorEmail: auth.context.profile.email,
        action: "steadfast_parcel_booked",
        entity: "orders",
        entityId: row.id,
        after: {
          consignmentId: result.parcel.consignment_id,
          trackingCode: result.parcel.tracking_code,
        },
      });
      revalidatePath("/admin/orders");
      revalidatePath("/admin/couriers");
      revalidatePath("/", "layout");
      return NextResponse.json({ ok: true, parcel: result.parcel });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not book the parcel." },
        { status: 502 }
      );
    }
  }

  try {
    const result = await syncSteadfastOrder(auth.admin, row.id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    revalidatePath("/admin/orders");
    revalidatePath("/admin/couriers");
    revalidatePath("/", "layout");
    return NextResponse.json({ ...result, ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not sync the parcel." },
      { status: 502 }
    );
  }
}
