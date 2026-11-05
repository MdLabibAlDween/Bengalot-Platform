import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { awardReviewPoints } from "@/lib/account-db";

export async function GET() {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor", "support"]);
  if ("error" in auth) return auth.error;
  const { data, error } = await auth.admin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reviews: data ?? [] });
}

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]).optional(),
  action: z.enum(["status", "delete"]).default("status"),
});

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor", "support"]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid review action.");

  if (parsed.data.action === "delete") {
    const { error } = await auth.admin.from("reviews").delete().eq("id", parsed.data.id);
    if (error) return badRequest(error.message);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "review_deleted",
      entity: "reviews",
      entityId: parsed.data.id,
    });
  } else {
    if (!parsed.data.status) return badRequest("Choose approved or rejected.");
    const { data: review } = await auth.admin
      .from("reviews")
      .select("id,profile_id,title,status")
      .eq("id", parsed.data.id)
      .maybeSingle();
    const { error } = await auth.admin
      .from("reviews")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id);
    if (error) return badRequest(error.message);
    if (parsed.data.status === "approved" && review && review.status !== "approved") {
      await awardReviewPoints(auth.admin, {
        profileId: review.profile_id,
        reviewId: review.id,
        title: review.title,
      });
    }
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "review_moderated",
      entity: "reviews",
      entityId: parsed.data.id,
      after: { status: parsed.data.status },
    });
  }
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
