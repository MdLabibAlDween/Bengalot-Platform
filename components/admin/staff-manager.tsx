"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Select } from "@/components/ui/input";

type StaffRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_blacklisted: boolean;
  created_at: string;
};

const roles = [
  ["manager", "Manager"],
  ["order_staff", "Order staff"],
  ["content_editor", "Content editor"],
  ["support", "Support"],
  ["customer", "Customer"],
];

export function StaffManager({ initial, currentRole }: { initial: StaffRow[]; currentRole: string }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [savingId, setSavingId] = useState<string | null>(null);

  const changeRole = async (row: StaffRow, role: string) => {
    setSavingId(row.id);
    const response = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, role }),
    });
    const result = await response.json().catch(() => ({}));
    setSavingId(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not update the role.");
      return;
    }
    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, role } : item)));
    toast.success("Role updated");
    router.refresh();
  };

  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2.5">
        <UserCog className="h-4 w-4 text-indigo" />
        <p className="text-[0.62rem] leading-relaxed text-muted-foreground">
          Super Admin accounts are managed only in Supabase Authentication. This screen can
          assign staff roles below Super Admin; it cannot create, promote or demote a Super
          Admin.
        </p>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-[0.68rem] text-muted-foreground">
            No profiles yet. Complete first-run setup.
          </p>
        )}
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--canvas-soft,#fbf7ef)] px-3 py-2.5"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo/10 text-[0.6rem] font-bold text-indigo">
              {(row.full_name || row.email || "?").slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.7rem] font-semibold">{row.full_name || "Unnamed"}</p>
              <p className="truncate text-[0.56rem] text-muted-foreground">{row.email}</p>
            </div>
            <div className="w-[160px]">
              <Select
                value={row.role}
                onChange={(event) => changeRole(row, event.target.value)}
                disabled={
                  savingId === row.id ||
                  currentRole !== "super_admin" ||
                  row.role === "super_admin"
                }
                aria-label={`Role for ${row.email}`}
                className="h-9 py-0 text-[0.62rem]"
              >
                {row.role === "super_admin" && (
                  <option value="super_admin">Super admin (Supabase)</option>
                )}
                {roles.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            {row.role === "super_admin" && (
              <span className="flex items-center gap-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-jade">
                <ShieldCheck className="h-3 w-3" /> Full access
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
