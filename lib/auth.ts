import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const STAFF_ROLES = new Set(["staff", "admin", "owner"]);

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile as Profile | null,
  };
}

export async function requireUser(nextPath = "/account") {
  const current = await getCurrentUser();
  if (!current) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return current;
}

export async function requireStaff(nextPath = "/admin") {
  const current = await getCurrentUser();
  if (!current) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (!current.profile || !STAFF_ROLES.has(current.profile.role)) {
    redirect("/account?notice=staff-only");
  }
  return current;
}
