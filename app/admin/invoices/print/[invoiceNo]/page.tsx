import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { InvoicePrintButton } from "@/components/invoice/print-button";
import { EmailText } from "@/components/site/email-display";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { InvoiceRow } from "@/lib/invoices";
import { formatBDT, formatDate } from "@/lib/utils";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ invoiceNo: string }>;
}) {
  await requireAdminPageRole(["super_admin", "manager"]);
  const { invoiceNo } = await params;
  const admin = createAdminSupabaseClient();
  const { data } = admin
    ? await admin
        .from("invoices")
        .select("*")
        .eq("invoice_no", decodeURIComponent(invoiceNo))
        .maybeSingle()
    : { data: null };
  if (!data) notFound();
  const invoice = data as InvoiceRow;
  const seller = invoice.seller ?? {};
  const customer = invoice.customer ?? {};
  const footer =
    (invoice.snapshot?.footer as string | undefined) ??
    "Thank you for shopping with Bengalot.";
  const safeFooter = footer.replace(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    "our support team"
  );

  return (
    <div className="min-h-screen bg-white text-[#1a1626] print:bg-white">
      <style>{`
        @media print {
          @page { margin: 18mm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
      <div className="mx-auto max-w-[820px] px-6 py-10 print:px-0 print:py-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to invoices
          </Link>
          <InvoicePrintButton />
        </div>

        <header className="flex items-start justify-between gap-6 border-b-2 border-[#c9a227] pb-6">
          <div>
            <p className="font-display text-3xl tracking-[0.16em]">BENGALOT</p>
            <p className="mt-2 text-xs leading-relaxed text-[#6b6578]">
              {seller.name ?? "Bengalot"}
              <br />
              {seller.address ?? "Saltha, Faridpur, Bangladesh"}
              <br />
              {seller.email ? (
                <EmailText email={seller.email} fallback="" />
              ) : null}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#6b6578]">
              Invoice
            </p>
            <p className="mt-1 font-mono text-lg font-semibold">{invoice.invoice_no}</p>
            <p className="mt-2 text-[0.68rem] text-[#6b6578]">{formatDate(invoice.issued_at)}</p>
            {invoice.status === "void" && (
              <p className="mt-2 inline-flex rounded-full bg-rose-100 px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-rose-800">
                Void
              </p>
            )}
          </div>
        </header>

        <div className="mt-8 grid gap-8 text-[0.74rem] sm:grid-cols-2">
          <div>
            <p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-[#6b6578]">
              Billed to
            </p>
            <p className="mt-2 font-semibold">{customer.name}</p>
            <p className="mt-1 leading-relaxed text-[#6b6578]">
              {customer.phone}
              {customer.email ? <><br />{customer.email}</> : null}
              <br />
              {customer.address}
              {customer.district ? `, ${customer.district}` : ""}
            </p>
          </div>
          <div>
            <p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-[#6b6578]">
              Order & payment
            </p>
            <p className="mt-2 font-mono">{invoice.order_no}</p>
            <p className="mt-1 text-[#6b6578]">{formatDate(invoice.issued_at)}</p>
            <p className="mt-2">
              {invoice.payment ?? "Cash on Delivery"} · {invoice.payment_status ?? "Unpaid"}
            </p>
          </div>
        </div>

        <table className="mt-8 w-full border-collapse text-left text-[0.7rem]">
          <thead>
            <tr className="border-b border-[#e5dfd3] text-[0.5rem] uppercase tracking-[0.14em] text-[#6b6578]">
              <th className="py-2.5">Item</th>
              <th className="py-2.5 text-center">Qty</th>
              <th className="py-2.5 text-right">Unit</th>
              <th className="py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items ?? []).map((item, index) => (
              <tr key={`${item.name}-${index}`} className="border-b border-[#f0ece4]">
                <td className="py-3">
                  <p className="font-medium">{item.name ?? "Item"}</p>
                  <p className="mt-0.5 text-[0.58rem] text-[#6b6578]">
                    {[item.color, item.size, item.bundleName ? `Bundle: ${item.bundleName}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </td>
                <td className="py-3 text-center">{item.qty ?? 1}</td>
                <td className="py-3 text-right">{formatBDT(Number(item.price ?? 0))}</td>
                <td className="py-3 text-right font-medium">
                  {formatBDT(Number(item.price ?? 0) * Number(item.qty ?? 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-6 w-full max-w-[300px] space-y-2 text-[0.7rem]">
          <div className="flex justify-between text-[#6b6578]">
            <span>Subtotal</span>
            <span>{formatBDT(Number(invoice.subtotal))}</span>
          </div>
          {Number(invoice.discount) > 0 && (
            <div className="flex justify-between text-[#6b6578]">
              <span>Discount</span>
              <span>−{formatBDT(Number(invoice.discount))}</span>
            </div>
          )}
          <div className="flex justify-between text-[#6b6578]">
            <span>Delivery</span>
            <span>{formatBDT(Number(invoice.delivery))}</span>
          </div>
          <div className="flex justify-between border-t border-[#1a1626] pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatBDT(Number(invoice.total))}</span>
          </div>
        </div>

        <footer className="mt-10 border-t border-[#e5dfd3] pt-4 text-[0.6rem] leading-relaxed text-[#6b6578]">
          <p>{safeFooter}</p>
          <p className="mt-1">
            Questions?{" "}
            <EmailText
              email={seller.replyTo ?? seller.email ?? "support@bengalot.com"}
              fallback="our support team"
            />
          </p>
        </footer>
      </div>
    </div>
  );
}
