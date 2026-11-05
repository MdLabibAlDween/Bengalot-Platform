"use client";

import { useMemo, useState } from "react";
import { Download, Printer, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatBDT } from "@/lib/utils";

export type SalesOrder = {
  id: string;
  order_no: string;
  created_at: string;
  status: string;
  payment: string;
  payment_status: string;
  customer: string;
  phone: string;
  district: string;
  subtotal: number;
  discount: number;
  bundle_savings: number;
  gift_card_amount: number;
  delivery: number;
  total: number;
  items: { name: string; qty: number; price: number }[];
};

function escapeHtml(value: unknown) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  // Prevent spreadsheet formula injection in exported customer data.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function SalesReport({ orders }: { orders: SalesOrder[] }) {
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return isoDate(date);
  });
  const [to, setTo] = useState(() => isoDate(new Date()));

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const day = order.created_at.slice(0, 10);
        return day >= from && day <= to;
      }),
    [orders, from, to]
  );

  const totals = useMemo(() => {
    const gross = filtered.reduce((sum, order) => sum + order.subtotal, 0);
    const delivery = filtered.reduce((sum, order) => sum + order.delivery, 0);
    const discounts = filtered.reduce(
      (sum, order) => sum + order.discount + order.bundle_savings + order.gift_card_amount,
      0
    );
    const net = filtered.reduce((sum, order) => sum + order.total, 0);
    return {
      gross,
      delivery,
      discounts,
      net,
      average: filtered.length ? Math.round(net / filtered.length) : 0,
      cod: filtered
        .filter((order) => order.payment_status !== "Paid")
        .reduce((sum, order) => sum + order.total, 0),
    };
  }, [filtered]);

  const print = () => {
    const win = window.open("", "_blank", "width=980,height=900");
    if (!win) return;
    const rows = filtered
      .map(
        (order) => `<tr>
          <td>${escapeHtml(order.order_no)}</td>
          <td>${escapeHtml(new Date(order.created_at).toLocaleDateString("en-GB"))}</td>
          <td>${escapeHtml(order.customer)}<br/><span class="muted">${escapeHtml(order.phone)}</span></td>
          <td>${escapeHtml(order.district)}</td>
          <td>${escapeHtml(order.status)}</td>
          <td>${escapeHtml(order.payment)}</td>
          <td class="num">৳${order.subtotal.toLocaleString("en-US")}</td>
          <td class="num">৳${order.delivery.toLocaleString("en-US")}</td>
          <td class="num">৳${order.total.toLocaleString("en-US")}</td>
        </tr>`
      )
      .join("");
    win.document.write(`<!doctype html><html><head><title>Bengalot sales report</title>
      <style>
        body{font-family:Arial,sans-serif;color:#0f0b1e;padding:32px}
        h1{font-family:Georgia,serif;font-size:30px;margin:0}
        .muted{color:#6b6578;font-size:10px}
        .head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #0f0b1e;padding-bottom:14px}
        .totals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}
        .totals div{border:1px solid #e7dccb;border-radius:10px;padding:10px}
        .totals span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#6b6578}
        .totals strong{display:block;margin-top:4px;font-size:17px}
        table{width:100%;border-collapse:collapse;font-size:11px}
        th{text-align:left;background:#f1e8d8;padding:8px 6px;font-size:9px;text-transform:uppercase;letter-spacing:.8px}
        td{padding:7px 6px;border-bottom:1px solid #eee;vertical-align:top}
        .num{text-align:right;white-space:nowrap}
        footer{margin-top:22px;border-top:1px solid #ddd;padding-top:10px;color:#6b6578;font-size:10px}
      </style></head><body>
      <div class="head"><div><h1>BENGALOT</h1><div class="muted">Saltha, Faridpur · Sales report</div></div>
      <div class="muted">${escapeHtml(from)} to ${escapeHtml(to)}<br/>Printed ${escapeHtml(new Date().toLocaleString("en-GB"))}</div></div>
      <div class="totals">
        <div><span>Orders</span><strong>${filtered.length}</strong></div>
        <div><span>Net sales</span><strong>৳${totals.net.toLocaleString("en-US")}</strong></div>
        <div><span>Average order</span><strong>৳${totals.average.toLocaleString("en-US")}</strong></div>
        <div><span>Product subtotal</span><strong>৳${totals.gross.toLocaleString("en-US")}</strong></div>
        <div><span>Delivery collected</span><strong>৳${totals.delivery.toLocaleString("en-US")}</strong></div>
        <div><span>COD outstanding</span><strong>৳${totals.cod.toLocaleString("en-US")}</strong></div>
      </div>
      <table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>District</th><th>Status</th><th>Payment</th><th class="num">Subtotal</th><th class="num">Delivery</th><th class="num">Total</th></tr></thead><tbody>${rows}</tbody></table>
      <footer>Discounts, bundle savings and gift-card deductions: ৳${totals.discounts.toLocaleString("en-US")}. Bengalot · bengalot.com</footer>
      <script>window.onload=function(){setTimeout(function(){window.print()},350)}</script>
      </body></html>`);
    win.document.close();
  };

  const csv = () => {
    const header = [
      "Order",
      "Date",
      "Customer",
      "Phone",
      "District",
      "Status",
      "Payment",
      "Subtotal",
      "Delivery",
      "Total",
    ];
    const rows = filtered.map((order) => [
      order.order_no,
      order.created_at,
      order.customer,
      order.phone,
      order.district,
      order.status,
      order.payment,
      order.subtotal,
      order.delivery,
      order.total,
    ]);
    const content = [header, ...rows]
      .map((row) => row.map((value) => csvCell(value)).join(","))
      .join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bengalot-sales-${from}-to-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div>
          <Label htmlFor="report-from">From</Label>
          <Input id="report-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="report-to">To</Label>
          <Input id="report-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={csv}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button type="button" onClick={print}>
            <Printer className="h-4 w-4" /> Print report
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Orders", String(filtered.length)],
          ["Net sales", formatBDT(totals.net)],
          ["Average order", formatBDT(totals.average)],
          ["COD outstanding", formatBDT(totals.cod)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
          <ReceiptText className="h-4 w-4 text-indigo" />
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Sales ledger · {from} to {to}
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <ReceiptText className="mx-auto h-6 w-6 text-muted-foreground/40" />
            <p className="mt-2 font-display text-xl">No sales in this period.</p>
            <p className="mt-1 text-[0.66rem] text-muted-foreground">Change the dates or place a test order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[var(--muted)] text-[0.48rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Order", "Date", "Customer", "District", "Status", "Payment", "Subtotal", "Delivery", "Total"].map((head) => (
                    <th key={head} className="px-3 py-2.5 font-bold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td className="px-3 py-2.5 font-mono">{order.order_no}</td>
                    <td className="px-3 py-2.5">{new Date(order.created_at).toLocaleDateString("en-GB")}</td>
                    <td className="px-3 py-2.5">
                      {order.customer}
                      <span className="block text-[0.55rem] text-muted-foreground">{order.phone}</span>
                    </td>
                    <td className="px-3 py-2.5">{order.district}</td>
                    <td className="px-3 py-2.5">{order.status}</td>
                    <td className="px-3 py-2.5">{order.payment}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatBDT(order.subtotal)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatBDT(order.delivery)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{formatBDT(order.total)}</td>
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
