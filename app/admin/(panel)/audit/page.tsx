import { Activity, ArrowUpRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminPageRole } from "@/lib/admin/auth";

export default async function AdminAuditPage() {
  await requireAdminPageRole(["super_admin"]);
  const admin = createAdminSupabaseClient();
  const { data } = admin
    ? await admin
        .from("audit_logs")
        .select("id,action,entity,entity_id,actor_email,created_at")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <div>
      <AdminPageHeader
        eyebrow="System"
        title="Audit log"
        description="A permanent trail of every admin write, role change and settings update."
      />
      <div className="overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-3.5">
          <Activity className="h-4 w-4 text-indigo" />
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Latest 100 entries
          </p>
        </div>
        {(data ?? []).length === 0 ? (
          <div className="p-10 text-center">
            <Activity className="mx-auto h-6 w-6 text-muted-foreground/40" />
            <p className="mt-2 text-[0.75rem] font-semibold">No activity yet.</p>
            <p className="mt-1 text-[0.62rem] text-muted-foreground">
              Update a setting or role to create the first entry.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {(data ?? []).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-5 py-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.7rem] font-medium">{entry.action.replace(/_/g, " ")}</p>
                  <p className="mt-0.5 text-[0.55rem] uppercase tracking-[0.08em] text-muted-foreground">
                    {entry.entity}
                    {entry.entity_id ? ` · ${entry.entity_id.slice(0, 12)}` : ""} ·{" "}
                    {entry.actor_email ?? "system"}
                  </p>
                </div>
                <span className="shrink-0 text-[0.55rem] text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="border-t border-[var(--color-border)] px-5 py-3 text-[0.58rem] text-muted-foreground">
          Need more than 100 rows? Connect the reports export.
          <ArrowUpRight className="ml-1 inline h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
