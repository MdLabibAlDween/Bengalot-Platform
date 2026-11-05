import { ArrowUpRight, Mail, ReceiptText, Send } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminSettingsForm } from "@/components/admin/settings-form";
import { InvoicesManager } from "@/components/admin/invoices-manager";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { getInvoiceSettings } from "@/lib/admin/settings";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminInvoicesPage() {
  await requireAdminPageRole(["super_admin", "manager"]);
  const [invoice, admin] = await Promise.all([getInvoiceSettings(), Promise.resolve(createAdminSupabaseClient())]);
  const { data } = admin
    ? await admin
        .from("invoices")
        .select("id,invoice_no,order_no,status,issued_at,customer,total,payment,payment_status")
        .order("issued_at", { ascending: false })
        .limit(200)
    : { data: [] };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Revenue"
        title="Invoices"
        description="Every invoice is a fixed snapshot of the order at issue time. Numbers are unique and never reused. Print or save any invoice as a PDF from its row."
      />

      <InvoicesManager initial={(data ?? []) as never[]} />

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard
          title="Invoice identity & footer"
          description="These values are written into every new invoice snapshot. Changing them later does not rewrite historical invoices."
        >
          <AdminSettingsForm
            settingKey="invoice_settings"
            initialValue={invoice as unknown as Record<string, unknown>}
            fields={[
              { path: "senderName", label: "Sender name" },
              { path: "senderEmail", label: "Sender email", type: "email" },
              { path: "replyTo", label: "Reply-to email", type: "email" },
              {
                path: "prefix",
                label: "Invoice prefix",
                help: "Letters and digits only. Numbers follow PREFIX-YYMM-0001.",
              },
              {
                path: "redirectUrl",
                label: "Post-invoice redirect URL",
                help: "Use {orderNo} for the order number.",
              },
              {
                path: "autoSend",
                label: "Auto-send invoice on confirmation",
                type: "boolean",
                help: "Requires SMTP and the email sender. Invoice generation itself already happens automatically.",
              },
              { path: "footer", label: "Invoice footer", type: "textarea" },
            ]}
          />
        </AdminCard>

        <div className="space-y-4">
          <AdminCard title="How invoices work" description="No fake numbers, no mutable history.">
            <ol className="space-y-3 text-[0.66rem] leading-relaxed text-muted-foreground">
              {[
                { icon: ReceiptText, title: "Snapshot", text: "Seller, buyer, items, totals and payment status are frozen when the invoice is issued." },
                { icon: Send, title: "Unique number", text: "A database counter issues PREFIX-YYMM-0001 and never reuses a number." },
                { icon: ArrowUpRight, title: "Print / PDF", text: "Open any invoice, then print or save it as a PDF from the browser." },
                { icon: Mail, title: "Reply-to", text: "Replies go to support. Automatic email delivery waits for SMTP." },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-2.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo/10 text-indigo">
                    <Icon className="h-3 w-3" />
                  </span>
                  <span>
                    <span className="block text-[0.68rem] font-semibold text-foreground">{title}</span>
                    {text}
                  </span>
                </li>
              ))}
            </ol>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
