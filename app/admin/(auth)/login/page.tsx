import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/auth-forms";
import { getAdminContext, isAdminRole } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const context = await getAdminContext();
  if (
    context.configured &&
    context.user &&
    context.profile &&
    isAdminRole(context.profile.role) &&
    !context.profile.is_blacklisted
  ) {
    redirect("/admin");
  }

  return <AdminLoginForm configured={isSupabaseConfigured()} />;
}
