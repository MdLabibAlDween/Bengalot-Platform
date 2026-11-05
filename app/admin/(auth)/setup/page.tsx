import { redirect } from "next/navigation";
import { AdminSetupForm } from "@/components/admin/auth-forms";
import { hasAnyAdmin } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  if (await hasAnyAdmin()) redirect("/admin/login");
  return <AdminSetupForm configured={isSupabaseConfigured()} />;
}
