import { Gift, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminSettingsForm } from "@/components/admin/settings-form";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { getRewardsConfig } from "@/lib/account-db";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function when(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminRewardsPage() {
  await requireAdminPageRole(["super_admin", "manager"]);
  const admin = createAdminSupabaseClient();
  const config = await getRewardsConfig();
  const { data: ledger } = admin
    ? await admin
        .from("reward_ledger")
        .select("id,profile_id,kind,points,reference,note,created_at")
        .order("created_at", { ascending: false })
        .limit(80)
    : { data: [] };

  const rows = ledger ?? [];
  const profileIds = Array.from(new Set(rows.map((row) => row.profile_id)));
  const { data: profiles } = admin && profileIds.length
    ? await admin.from("profiles").select("id,full_name,email").in("id", profileIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  const earned = rows.filter((row) => Number(row.points) > 0).reduce((sum, row) => sum + Number(row.points), 0);
  const redeemed = Math.abs(
    rows.filter((row) => Number(row.points) < 0).reduce((sum, row) => sum + Number(row.points), 0)
  );
  const outstanding = rows.reduce((sum, row) => sum + Number(row.points), 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Customers"
        title="Rewards & loyalty"
        description="Points are earned on delivered orders and approved reviews. Redeeming a reward creates a one-use coupon tied to the customer's account."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Points issued", value: earned.toLocaleString("en-US"), icon: TrendingUp, tone: "jade" },
          { label: "Points redeemed", value: redeemed.toLocaleString("en-US"), icon: TrendingDown, tone: "magenta" },
          { label: "Outstanding", value: outstanding.toLocaleString("en-US"), icon: Gift, tone: "indigo" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-[1.8rem] leading-none tabular-nums">{value}</p>
              </div>
              <span
                className={
                  tone === "jade"
                    ? "grid h-9 w-9 place-items-center rounded-full bg-jade/10 text-jade"
                    : tone === "magenta"
                      ? "grid h-9 w-9 place-items-center rounded-full bg-magenta/10 text-magenta"
                      : "grid h-9 w-9 place-items-center rounded-full bg-indigo/10 text-indigo"
                }
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <AdminCard
            title="Programme settings"
            description="These values drive the account rewards page, earning rules and the redeemable catalogue."
          >
            <AdminSettingsForm
              settingKey="rewards_config"
              initialValue={config as unknown as Record<string, unknown>}
              fields={[
                {
                  path: "enabled",
                  label: "Rewards enabled",
                  type: "boolean",
                  help: "When off, customers see a tasteful disabled state and no points are awarded.",
                },
                {
                  path: "pointsPerHundred",
                  label: "Points per ৳100",
                  type: "number",
                  min: 0,
                  step: 1,
                  help: "Awarded when an order is marked Delivered.",
                },
                {
                  path: "reviewPoints",
                  label: "Points per approved review",
                  type: "number",
                  min: 0,
                  step: 1,
                },
                {
                  path: "signupPoints",
                  label: "Points on signup",
                  type: "number",
                  min: 0,
                  step: 1,
                  help: "Reserved for the signup reward. Not applied automatically yet.",
                },
                {
                  path: "tiers",
                  label: "Tiers (JSON)",
                  type: "json",
                  help: "Array of { name, min, perk }. Keep the thresholds ascending.",
                },
                {
                  path: "rewards",
                  label: "Reward catalogue (JSON)",
                  type: "json",
                  help: "Array of { key, label, points, type, value, minSpend, description, expiresInDays }.",
                },
              ]}
            />
          </AdminCard>

          <div className="mt-4 rounded-[20px] border border-gold/30 bg-gold/[0.05] p-4 text-[0.64rem] leading-relaxed text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-gold-ink">
              <Sparkles className="h-3.5 w-3.5" /> Redemption is atomic
            </p>
            <p className="mt-1.5">
              The database checks the customer&apos;s balance, inserts the coupon and deducts the
              points in one transaction. Two simultaneous requests cannot spend the same points.
            </p>
          </div>
        </div>

        <AdminCard
          title="Recent points activity"
          description="Every order, review, adjustment and redemption in the ledger."
        >
          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center">
              <Gift className="mx-auto h-6 w-6 text-muted-foreground/35" />
              <p className="mt-2 text-[0.7rem] font-semibold">No points activity yet.</p>
              <p className="mt-1 text-[0.6rem] text-muted-foreground">
                Points appear when an order is delivered or a review is approved.
              </p>
            </div>
          ) : (
            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead className="sticky top-0 bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    {["Customer", "Activity", "Points", "When"].map((head) => (
                      <th key={head} className="px-3 py-2.5">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-[0.62rem]">
                  {rows.map((row) => {
                    const profile = profileMap.get(row.profile_id);
                    return (
                      <tr key={row.id} className="hover:bg-[var(--muted)]/30">
                        <td className="px-3 py-2.5">
                          <p className="font-medium">{profile?.full_name || "Customer"}</p>
                          <p className="text-[0.52rem] text-muted-foreground">{profile?.email ?? row.profile_id.slice(0, 8)}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="capitalize">{row.kind}</p>
                          <p className="max-w-[200px] truncate text-[0.52rem] text-muted-foreground">{row.note ?? row.reference ?? "—"}</p>
                        </td>
                        <td className={row.points >= 0 ? "px-3 py-2.5 font-semibold tabular-nums text-jade" : "px-3 py-2.5 font-semibold tabular-nums text-rosewood"}>
                          {row.points >= 0 ? "+" : ""}{row.points}
                        </td>
                        <td className="px-3 py-2.5 text-[0.54rem] text-muted-foreground">{when(row.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
