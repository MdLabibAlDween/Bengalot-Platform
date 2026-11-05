import "server-only";

import { NextResponse } from "next/server";
import { getAdminContext, isAdminRole, type AdminRole } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function requireAdminApi() {
  const context = await getAdminContext();
  if (!context.configured) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured. Add the four Supabase keys to .env.local." },
        { status: 503 }
      ),
    };
  }
  if (!context.user) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  if (!context.profile || !isAdminRole(context.profile.role) || context.profile.is_blacklisted) {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  const profile = context.profile;
  const admin = createAdminSupabaseClient();
  if (!admin) {
    return {
      error: NextResponse.json({ error: "Service role is not configured." }, { status: 503 }),
    };
  }
  return { context: { ...context, profile }, admin };
}

export async function requireAdminRoleApi(allowed: readonly AdminRole[]) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth;
  if (!isAdminRole(auth.context.profile.role) || !allowed.includes(auth.context.profile.role)) {
    return {
      error: NextResponse.json(
        { error: "Your staff role does not allow this action." },
        { status: 403 }
      ),
    };
  }
  return auth;
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
