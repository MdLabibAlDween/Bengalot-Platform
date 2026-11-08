import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["processing", "packed", "shipped", "delivered", "cancelled"]),
});

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
    const { data: before } = await supabase
      .from("orders")
      .select("order_number,status")
      .eq("id", parsed.data.id)
      .maybeSingle();

    const { error } = await supabase
      .from("orders")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id);
    if (error) throw error;

    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "order.status",
      entity: "order",
      entity_id: parsed.data.id,
      before,
      after: { status: parsed.data.status },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/account/orders");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Order update failed", error);
    return NextResponse.json(
      { message: "The order could not be updated." },
      { status: 500 },
    );
  }
}
