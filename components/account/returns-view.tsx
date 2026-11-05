"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  RotateCcw,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountHeading } from "./account-heading";
import { STORE_SETTINGS } from "@/lib/settings";
import { cn, formatDate } from "@/lib/utils";
import type { Order } from "@/lib/types";

type ReturnRequest = {
  id: string;
  reference: string;
  orderNo: string;
  item: string;
  reason: string;
  date: string;
  status: "Under review" | "Approved" | "Completed" | "Rejected";
  resolution: string;
};

const statusStyles: Record<ReturnRequest["status"], string> = {
  "Under review": "bg-amber-50 text-amber-800",
  Approved: "bg-teal-50 text-teal-800",
  Completed: "bg-emerald-50 text-emerald-800",
  Rejected: "bg-rose-50 text-rose-800",
};

const reasons = [
  "Size / fit",
  "Color not as expected",
  "Changed my mind",
  "Item arrived damaged",
  "Wrong item received",
  "Quality not as expected",
];

function mapReturn(row: Record<string, unknown>): ReturnRequest {
  const status =
    row.status === "requested"
      ? "Under review"
      : row.status === "approved"
        ? "Approved"
        : row.status === "rejected"
          ? "Rejected"
          : "Completed";
  const items = Array.isArray(row.items) ? (row.items as { name?: string }[]) : [];
  return {
    id: `RT-${String(row.id).slice(0, 6).toUpperCase()}`,
    reference: String(row.id),
    orderNo: String(row.order_no ?? ""),
    item: items.map((item) => item.name).filter(Boolean).join(", ") || "Item",
    reason: String(row.reason ?? ""),
    date: String(row.created_at ?? "").slice(0, 10),
    status,
    resolution:
      row.admin_note
        ? String(row.admin_note)
        : status === "Under review"
          ? "We will review your request within one working day."
          : `This request is ${status.toLowerCase()}.`,
  };
}

export function ReturnsView() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    orderNo: "",
    item: "",
    reason: "Size / fit",
    notes: "",
  });

  useEffect(() => {
    void fetch("/api/account/returns", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        if (Array.isArray(data.returns)) setReturns(data.returns.map(mapReturn));
      })
      .catch(() => undefined);
    void fetch("/api/account/orders", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        if (Array.isArray(data.orders)) {
          setOrders(
            (data.orders as Order[]).filter((order) =>
              ["Delivered", "Confirmed", "Processing", "In Transit", "Handed to Courier"].includes(order.status)
            )
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const eligibleOrders = orders;
  const selectedOrder = useMemo(
    () => eligibleOrders.find((o) => o.orderNo === form.orderNo),
    [eligibleOrders, form.orderNo]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderNo || !form.item) {
      toast.error("Please choose the order and item.");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/account/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNo: form.orderNo,
        item: form.item,
        reason: form.reason,
        details: form.notes,
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not submit the return request.");
      return;
    }
    setReturns((current) => [mapReturn(result.request), ...current]);
    toast.success("Return request received", {
      description: "We will confirm by WhatsApp within one working day.",
    });
    setOpen(false);
    setForm({ orderNo: "", item: "", reason: "Size / fit", notes: "" });
  };

  return (
    <div>
      <AccountHeading
        eyebrow="If it isn't right"
        title="Returns & claims"
        description="Start a real return, exchange or claim and we will review it."
        action={
          <Button variant="gold" onClick={() => setOpen(true)}>
            <RotateCcw className="h-4 w-4" /> Start a request
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Check,
            title:
              STORE_SETTINGS.exchangeWindowEnabled && STORE_SETTINGS.exchangeWindowDays > 0
                ? `${STORE_SETTINGS.exchangeWindowDays}-day window`
                : "Return window",
            text: "From the day your parcel arrives.",
          },
          {
            icon: RotateCcw,
            title: "Size exchange",
            text:
              STORE_SETTINGS.exchangeWindowEnabled
                ? "Ask us about a size exchange and delivery cover."
                : "Ask our team about the options for your item.",
          },
          { icon: Truck, title: "Pickup", text: "A pickup can be arranged from your door." },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <item.icon className="h-4 w-4 text-gold" />
            <p className="mt-2.5 text-xs font-semibold">{item.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold">
              Your requests
            </p>
            <h3 className="mt-1 font-display text-xl">Your claims</h3>
          </div>
          <span className="text-[0.54rem] uppercase tracking-[0.1em] text-muted-foreground">
            {returns.length} requests
          </span>
        </div>

        {returns.length === 0 ? (
          <div className="py-14 text-center">
            <RotateCcw className="mx-auto h-7 w-7 text-gold/60" />
            <p className="mt-3 font-display text-2xl">No claims yet.</p>
            <p className="mt-1 text-[0.7rem] text-muted-foreground">
              Start a request if something is not right.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {returns.map((request) => (
              <div key={request.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--muted)] text-gold">
                  <RotateCcw className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.74rem] font-semibold">{request.id}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.46rem] font-bold uppercase tracking-[0.08em]",
                        statusStyles[request.status]
                      )}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.68rem] text-muted-foreground">
                    {request.item} · {request.reason}
                  </p>
                  <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                    Order {request.orderNo} · {formatDate(request.date)}
                  </p>
                  <p className="mt-2 text-[0.62rem] text-muted-foreground">
                    {request.resolution}
                  </p>
                </div>
                {request.status === "Under review" && (
                  <button
                    type="button"
                    onClick={() => toast("Your request is with the atelier.")}
                    className="flex items-center gap-1 text-[0.54rem] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-gold"
                  >
                    View <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-gold/35 bg-gold/[0.05] p-4">
        <Camera className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p className="text-[0.66rem] leading-relaxed text-muted-foreground">
          Had a problem with a piece? A photo helps us sort it faster. Send one on WhatsApp
          along with your order number and we will take it from there.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Start a return or exchange</DialogTitle>
          <DialogDescription>
            We&apos;ll review your request within one working day and arrange a pickup if
            approved.
          </DialogDescription>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="return-order">Order</Label>
              <Select
                id="return-order"
                value={form.orderNo}
                onChange={(e) => setForm({ ...form, orderNo: e.target.value, item: "" })}
              >
                <option value="">Choose an order</option>
                {eligibleOrders.map((order) => (
                  <option key={order.orderNo} value={order.orderNo}>
                    {order.orderNo} · {formatDate(order.date)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="return-item">Which piece?</Label>
              <Select
                id="return-item"
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                disabled={!selectedOrder}
              >
                <option value="">Choose an item</option>
                {selectedOrder?.items.map((item) => (
                  <option key={item.productSlug} value={item.name}>
                    {item.name} · {item.size}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="return-reason">Reason</Label>
              <Select
                id="return-reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              >
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="return-notes">Anything else? (optional)</Label>
              <Textarea
                id="return-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Tell us what happened, or which size/color you'd prefer."
                className="min-h-[88px]"
              />
            </div>
            <div>
              <Label>Photo (optional)</Label>
              <a
                href="https://wa.me/8801341739202"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] py-4 text-[0.66rem] text-muted-foreground transition hover:border-gold hover:text-gold"
              >
                <Camera className="h-4 w-4" />
                Send photos on WhatsApp after submitting
              </a>
            </div>
            <p className="text-[0.6rem] leading-relaxed text-muted-foreground">
              By submitting, you confirm the item is unused with tags intact.{" "}
              <a href="/return-policy" className="underline underline-offset-2 hover:text-gold">
                Read the full policy
              </a>
              .
            </p>
            <Button type="submit" variant="gold" className="w-full" disabled={saving}>
              {saving ? "Submitting…" : "Submit request"} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
