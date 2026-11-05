"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldBan, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CustomerRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_blacklisted: boolean;
  created_at: string;
};

export function CustomersManager({ initial }: { initial: CustomerRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((row) =>
      [row.full_name, row.email, row.phone].join(" ").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const toggleBlock = async (row: CustomerRow) => {
    setBusy(row.id);
    const response = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, is_blacklisted: !row.is_blacklisted }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not update customer.");
      return;
    }
    setRows((current) =>
      current.map((item) => (item.id === row.id ? { ...item, is_blacklisted: !item.is_blacklisted } : item))
    );
    toast.success(row.is_blacklisted ? "Customer unblocked" : "Customer blocked");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone" className="pl-10" />
      </div>
      <div className="overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <UserRound className="mx-auto h-6 w-6 text-muted-foreground/40" />
            <p className="mt-2 font-display text-xl">No customer accounts yet.</p>
            <p className="mt-1 text-[0.66rem] text-muted-foreground">New storefront sign-ups will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-[var(--muted)] text-[0.48rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>{["Customer", "Phone", "Joined", "Status", ""].map((head) => <th key={head} className="px-4 py-2.5">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.66rem]">
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.full_name || "Unnamed"}</p>
                      <p className="text-[0.56rem] text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(row.created_at).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-1 text-[0.48rem] font-bold uppercase tracking-[0.08em]", row.is_blacklisted ? "bg-rosewood/10 text-rosewood" : "bg-jade/10 text-jade")}>
                        {row.is_blacklisted ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => toggleBlock(row)} disabled={busy === row.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1.5 text-[0.5rem] font-bold uppercase tracking-[0.08em] transition hover:border-rosewood hover:text-rosewood">
                        <ShieldBan className="h-3 w-3" /> {row.is_blacklisted ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
