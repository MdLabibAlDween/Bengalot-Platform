import { NextResponse } from "next/server";
import { requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import { steadfastBalance, steadfastPing } from "@/lib/steadfast";

export async function POST() {
  const auth = await requireAdminRoleApi(["super_admin", "manager"]);
  if ("error" in auth) return auth.error;
  try {
    await steadfastPing();
    const balance = await steadfastBalance();
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "steadfast_connection_tested",
      entity: "integrations",
      entityId: "steadfast",
      after: { ok: true },
    });
    return NextResponse.json({
      ok: true,
      message: `Steadfast is reachable and the API keys are valid. Available balance: ৳${balance.toLocaleString("en-US")}.`,
      balance,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not reach Steadfast with the saved credentials.",
      },
      { status: 400 }
    );
  }
}
