"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Mail, Plus, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatBDT } from "@/lib/utils";

type Invoice = {
  id: string;
  invoice_no: string;
  order_no: string;
  status: "issued" | "void";
  issued_at: string;
  customer: { name?: string; phone?: string; email?: string } | null;
  total: number;
  payment: string | null;
  payment_status: string | null;
};

export function InvoicesManager({ initial }: { initial: Invoice[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [emailing, setEmailing] = useState<string | null>(null);

  const stats = useMemo(() => {
    const issued = initial.filter((invoice) => invoice.status === "issued");
    const month = new Date().toISOString().slice(0, 7);
    return {
      count: issued.length,
      value: issued.reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0),
      thisMonth: issued.filter((invoice) => invoice.issued_at.slice(0, 7) === month).length,
    };
  }, [initial]);

  const generateMissing = async () => {    setBusy(true);
    const response = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_missing" }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not generate missing invoices.");
      return;
    }
    toast.success("Invoice backfill complete", {
      description: `${result.created ?? 0} created, ${result.failed ?? 0} failed.`,
    });
    router.refresh();
  };

  const emailInvoice = async (invoice: Invoice) => {
    if (!invoice.customer?.email) {
      toast.error("This customer has no email address on the order.");
      return;
    }
    if (!window.confirm(`Email invoice ${invoice.invoice_no} to ${invoice.customer.email}?`)) return;
    setEmailing(invoice.id);
    const response = await fetch("/api/admin/invoices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNo: invoice.invoice_no }),
    });
    const result = await response.json().catch(() => ({}));
    setEmailing(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not email the invoice.");
      return;
    }
    toast.success("Invoice email sent");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Issued invoices", value: String(stats.count), helper: "Non-void" },
          { label: "Invoiced value", value: formatBDT(stats.value), helper: "All issued" },
          { label: "This month", value: String(stats.thisMonth), helper: "New invoices" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-[1.7rem] leading-none tabular-nums">{stat.value}</p>
            <p className="mt-2 text-[0.56rem] text-muted-foreground">{stat.helper}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Ledger
            </p>
            <h2 className="mt-1 font-display text-xl">Issued invoices</h2>
          </div>
          <Button type="button" size="sm" onClick={generateMissing} disabled={busy}>
            <Plus className="h-3.5 w-3.5" /> {busy ? "Generating…" : "Generate missing"}
          </Button>
        </div>

        {initial.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <ReceiptText className="mx-auto h-7 w-7 text-muted-foreground/35" />
            <p className="mt-3 font-display text-xl">No invoices yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-[0.66rem] leading-relaxed text-muted-foreground">
              Invoices are generated automatically when an order is created or confirmed.
              Use “Generate missing” to backfill historical orders.
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={generateMissing} disabled={busy}>
              <Plus className="h-3.5 w-3.5" /> Generate missing
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Invoice", "Order", "Customer", "Total", "Issued", "Payment", "Status", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {initial.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-mono font-semibold">
                        <FileText className="h-3.5 w-3.5 text-gold" />
                        {invoice.invoice_no}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.58rem] text-muted-foreground">
                      {invoice.order_no}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{invoice.customer?.name ?? "Customer"}</p>
                      <p className="text-[0.52rem] text-muted-foreground">
                        {invoice.customer?.phone ?? invoice.customer?.email ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{formatBDT(invoice.total)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(invoice.issued_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {invoice.payment ?? "—"} · {invoice.payment_status ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[0.44rem] font-bold uppercase tracking-[0.08em]",
                          invoice.status === "issued"
                            ? "bg-jade/10 text-jade"
                            : "bg-[var(--muted)] text-muted-foreground"
                        )}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => emailInvoice(invoice)}
                          disabled={emailing === invoice.id || !invoice.customer?.email}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:border-indigo hover:text-indigo disabled:opacity-40"
                        >
                          <Mail className="h-3 w-3" />
                          {emailing === invoice.id ? "Sending…" : "Email"}
                        </button>
                        <a
                          href={`/admin/invoices/print/${encodeURIComponent(invoice.invoice_no)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:border-indigo hover:text-indigo"
                        >
                          <Download className="h-3 w-3" /> Print / PDF
                        </a>
                      </div>
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
