import { UserManager } from "@/components/admin/user-manager";
import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { profile, user } = await requireStaff("/admin/users");
  const supabase = createSupabaseAdminClient();
  const [profilesResult, ordersResult, entitlementsResult] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("user_id"),
    supabase.from("entitlements").select("user_id"),
  ]);

  const profiles = (profilesResult.data ?? []) as Profile[];
  const orderCounts = new Map<string, number>();
  for (const row of ordersResult.data ?? []) {
    if (!row.user_id) continue;
    orderCounts.set(row.user_id, (orderCounts.get(row.user_id) ?? 0) + 1);
  }
  const entitlementCounts = new Map<string, number>();
  for (const row of entitlementsResult.data ?? []) {
    entitlementCounts.set(
      row.user_id,
      (entitlementCounts.get(row.user_id) ?? 0) + 1,
    );
  }

  const users = profiles.map((entry) => ({
    ...entry,
    orderCount: orderCounts.get(entry.id) ?? 0,
    entitlementCount: entitlementCounts.get(entry.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-6">
        <p className="eyebrow">People</p>
        <h1 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.045em] text-ink sm:text-[2.8rem]">
          The people{" "}
          <span className="display-italic text-teal">behind the shelf.</span>
        </h1>
        <p className="mt-2 max-w-[42rem] text-[0.76rem] leading-relaxed text-muted">
          Real profiles, real roles, real library access. Accounts are created in
          Supabase Authentication (or by customers at /register); this screen
          assigns roles, sends reset links, manages library access and removes
          accounts.
        </p>
      </div>

      <UserManager
        users={users}
        canManage={profile?.role === "owner"}
        currentUserId={user.id}
      />
    </div>
  );
}
