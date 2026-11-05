import type { Metadata } from "next";
import { ProfileView } from "@/components/account/profile-view";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const admin = createAdminSupabaseClient();
  const { data: profile } = user && admin
    ? await admin
        .from("profiles")
        .select("full_name,email,phone")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const initial = {
    name: profile?.full_name ?? user?.user_metadata?.full_name ?? "",
    email: profile?.email ?? user?.email ?? "",
    phone: profile?.phone ?? user?.user_metadata?.phone ?? "",
    birthday: user?.user_metadata?.birthday ?? "",
  };

  return <ProfileView initial={initial} />;
}
