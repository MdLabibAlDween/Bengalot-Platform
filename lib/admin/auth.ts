import "server-only";

import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const ADMIN_ROLES = [
  "super_admin",
  "manager",
  "order_staff",
  "content_editor",
  "support",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_blacklisted: boolean;
};

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return Boolean(role && (ADMIN_ROLES as readonly string[]).includes(role));
}

/**
 * Admin authorization must use Supabase Auth app_metadata, never the editable
 * `profiles.role` column. Customers can update their own profile row through
 * the public API, so a profile role is not a trusted authorization source.
 */
export function trustedAdminRole(user: {
  app_metadata?: Record<string, unknown> | null;
} | null | undefined): AdminRole | "customer" {
  const raw = user?.app_metadata?.role;
  if (raw === "admin") return "super_admin";
  if (typeof raw === "string" && isAdminRole(raw)) return raw;
  return "customer";
}

export async function getAdminContext() {
  if (!isSupabaseConfigured()) {
    return { configured: false as const, user: null, profile: null };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { configured: false as const, user: null, profile: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true as const, user: null, profile: null };
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return { configured: true as const, user, profile: null };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id,email,full_name,role,is_blacklisted")
    .eq("id", user.id)
    .maybeSingle();

  const trustedRole = trustedAdminRole(user);

  return {
    configured: true as const,
    user,
    profile: profile
      ? ({ ...(profile as AdminProfile), role: trustedRole } as AdminProfile)
      : null,
  };
}

export async function requireAdminPage() {
  const context = await getAdminContext();
  if (!context.configured) {
    return { ...context, authorized: false as const };
  }
  if (!context.user) {
    redirect("/admin/login");
  }
  if (!context.profile || !isAdminRole(context.profile.role) || context.profile.is_blacklisted) {
    redirect("/admin/login?error=not-admin");
  }
  return { ...context, authorized: true as const, profile: context.profile };
}

export async function requireAdminPageRole(allowed: readonly AdminRole[]) {
  const context = await requireAdminPage();
  if (!context.profile) redirect("/admin/login?error=not-admin");
  if (!isAdminRole(context.profile.role) || !allowed.includes(context.profile.role)) {
    redirect("/admin");
  }
  return context;
}

export async function hasAnyAdmin() {
  const admin = createAdminSupabaseClient();
  if (!admin) return false;
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .in("role", [...ADMIN_ROLES]);
  return Boolean(count && count > 0);
}

export async function writeAuditLog(input: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}) {
  const admin = createAdminSupabaseClient();
  if (!admin) return;
  await admin.from("audit_logs").insert({
    actor_id: input.actorId ?? null,
    actor_email: input.actorEmail ?? null,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
  });
}
