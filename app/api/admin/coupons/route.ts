import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";

const schema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(3).max(40).regex(/^[A-Z0-9_-]+$/),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  type: z.enum(["percent", "fixed", "shipping"]),
  value: z.number().int().min(0).max(100000),
  minSpend: z.number().int().min(0).max(10000000),
  expiresAt: z.string().trim().max(20).optional(),
  status: z.enum(["active", "inactive"]),
  isDemo: z.boolean().optional(),
  productSlugs: z.array(z.string().trim().min(1).max(120)).max(500).optional(),
});

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const { data, error } = await auth.admin.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid coupon.");
  const input = parsed.data;
  const payload = {
    code: input.code.toUpperCase(),
    title: input.title,
    description: input.description || null,
    type: input.type,
    value: input.type === "shipping" ? 0 : input.value,
    min_spend: input.minSpend,
    expires_at: input.expiresAt || null,
    status: input.status,
    is_demo: Boolean(input.isDemo),
    product_slugs: input.productSlugs ?? [],
  };
  const query = input.id
    ? auth.admin.from("coupons").update(payload).eq("id", input.id)
    : auth.admin.from("coupons").insert(payload);
  const { data, error } = await query.select("*").single();
  if (error) return badRequest(error.message);
  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: input.id ? "coupon_updated" : "coupon_created",
    entity: "coupons",
    entityId: data.id,
    after: { code: data.code, status: data.status },
  });
  revalidatePath("/admin/offers");
  revalidatePath("/offers");
  revalidatePath("/checkout");
  return NextResponse.json({ ok: true, coupon: data });
}

export async function DELETE(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid coupon.");
  const { error } = await auth.admin.from("coupons").delete().eq("id", parsed.data.id);
  if (error) return badRequest(error.message);
  revalidatePath("/admin/offers");
  revalidatePath("/offers");
  revalidatePath("/checkout");
  return NextResponse.json({ ok: true });
}
