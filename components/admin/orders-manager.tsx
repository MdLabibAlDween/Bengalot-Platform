"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Copy,
  ExternalLink,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Input, Select } from "@/components/ui/input";
import { cn, formatBDT } from "@/lib/utils";

export type AdminOrder = {
  id: string;
  order_no: string;
  status: string;
  payment: string;
  payment_status: string;
  customer: string;
  phone: string;
  email: string | null;
  district: string;
  address: string;
  note: string | null;
  total: number;
  items: {
    productSlug?: string;
    name: string;
    size: string;
    color: string;
    qty: number;
    price: number;
  }[];
  courier: string | null;
  courier_status: string | null;
  courier_consignment_id: number | string | null;
  courier_tracking_link: string | null;
  courier_last_synced_at: string | null;
  tracking_code: string | null;
  created_at: string;
};

const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Handed to Courier",
  "In Transit",
  "Delivered",
  "Returning",
  "Cancelled",
  "Returned",
  "Failed Delivery",
  "Refunded",
];

const tone: Record<string, string> = {
  Pending: "bg-saffron/15 text-gold-ink",
  Confirmed: "bg-indigo/10 text-indigo",
  Processing: "bg-indigo/10 text-indigo",
  "Handed to Courier": "bg-teal/10 text-teal",
  "In Transit": "bg-teal/10 text-teal",
  Delivered: "bg-jade/10 text-jade",
  Returning: "bg-saffron/15 text-gold-ink",
  Cancelled: "bg-rosewood/10 text-rosewood",
  Returned: "bg-rosewood/10 text-rosewood",
  "Failed Delivery": "bg-rosewood/10 text-rosewood",
  Refunded: "bg-[var(--muted)] text-muted-foreground",
};

function pretty(value: string | null | undefined) {
  return (value ?? "").replace(/_/g, " ");
}

function courierTone(status: string | null) {
  if (!status) return "bg-[var(--muted)] text-muted-foreground";
  if (status === "delivered") return "bg-jade/10 text-jade";
  if (status.includes("return") || status.includes("cancel")) return "bg-saffron/15 text-gold-ink";
  if (status.includes("approval")) return "bg-indigo/10 text-indigo";
  return "bg-teal/10 text-teal";
}

function when(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersManager({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(orders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [courierBusy, setCourierBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!query) return true;
      return [
        order.order_no,
        order.customer,
        order.phone,
        order.email ?? "",
        order.district,
        order.tracking_code ?? "",
        order.courier_status ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, search, statusFilter]);

  const changeStatus = async (order: AdminOrder, status: string) => {
    setSavingId(order.id);
    const response = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status }),
    });
    const result = await response.json().catch(() => ({}));
    setSavingId(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not update order.");
      return;
    }
    setRows((current) =>
      current.map((row) =>
        row.id === order.id
          ? {
              ...row,
              status,
              ...(result.courierBooking?.trackingCode
                ? {
                    tracking_code: result.courierBooking.trackingCode,
                    courier: "Steadfast",
                    courier_consignment_id: result.courierBooking.consignmentId ?? null,
                    courier_tracking_link: `https://steadfast.com.bd/t/${result.courierBooking.trackingCode}`,
                  }
                : {}),
            }
          : row
      )
    );
    if (result.courierBooking && !result.courierBooking.ok) {
      toast.warning("Order updated — courier booking failed", {
        description: result.courierBooking.message,
      });
    } else if (result.courierBooking?.ok && result.courierBooking.trackingCode) {
      toast.success("Order updated and parcel booked", {
        description: result.courierBooking.message,
      });
    } else {
      toast.success("Order updated");
    }
    router.refresh();
  };

  const courierAction = async (order: AdminOrder, action: "book" | "sync") => {
    setCourierBusy(`${order.id}:${action}`);
    const response = await fetch("/api/admin/couriers/steadfast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, orderId: order.id }),
    });
    const result = await response.json().catch(() => ({}));
    setCourierBusy(null);
    if (!response.ok) {
      toast.error(result.error ?? `Could not ${action} the parcel.`);
      return;
    }
    if (action === "book") {
      toast.success("Steadfast parcel booked", {
        description: `Tracking ${result.parcel?.tracking_code ?? "created"}.`,
      });
    } else {
      toast.success("Tracking synced", {
        description: result.courierStatus
          ? `Steadfast status: ${pretty(result.courierStatus)}.`
          : "The parcel was checked with Steadfast.",
      });
    }
    router.refresh();
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error(value);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer, phone, tracking…"
            className="pl-10"
            aria-label="Search orders"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="field h-11 w-[170px] py-0 text-[0.66rem]"
          aria-label="Filter orders by status"
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <span className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {filtered.length} orders
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
          <ShoppingBag className="mx-auto h-6 w-6 text-muted-foreground/40" />
          <p className="mt-3 font-display text-2xl">No orders match.</p>
          <p className="mx-auto mt-1 max-w-sm text-[0.7rem] leading-relaxed text-muted-foreground">
            Clear the search or choose a different status. Guest checkout writes orders to
            Supabase automatically.
          </p>
        </div>
      ) : (
        filtered.map((order) => {
          const open = expanded === order.id;
          const busy = courierBusy?.startsWith(order.id);
          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : order.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-expanded={open}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--muted)] text-foreground/60">
                    <ShoppingBag className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[0.72rem] font-semibold">{order.order_no}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[0.46rem] font-bold uppercase tracking-[0.08em]", tone[order.status] ?? "bg-[var(--muted)]")}>
                        {order.status}
                      </span>
                      {order.courier_status && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[0.44rem] font-bold uppercase tracking-[0.08em]", courierTone(order.courier_status))}>
                          Steadfast · {pretty(order.courier_status)}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.62rem] text-muted-foreground">
                      {order.customer} · {order.phone} · {order.district}
                      {order.tracking_code ? ` · ${order.tracking_code}` : ""}
                    </span>
                  </span>
                  <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
                </button>
                <div className="text-right">
                  <p className="text-[0.72rem] font-semibold tabular-nums">{formatBDT(order.total)}</p>
                  <p className="text-[0.5rem] uppercase tracking-[0.08em] text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="w-[160px]">
                  <Select
                    value={order.status}
                    onChange={(event) => changeStatus(order, event.target.value)}
                    disabled={savingId === order.id}
                    aria-label={`Status for ${order.order_no}`}
                    className="h-9 py-0 text-[0.6rem]"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {open && (
                <div className="border-t border-[var(--color-border)] bg-[var(--canvas-soft,#fbf7ef)] px-4 py-4">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div>
                      <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Items
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {order.items.map((item, index) => (
                          <li key={`${item.name}-${index}`} className="flex justify-between gap-3 text-[0.66rem]">
                            <span>
                              {item.qty} × {item.name}
                              <span className="ml-1 text-muted-foreground">
                                {item.size} / {item.color}
                              </span>
                            </span>
                            <span className="tabular-nums">{formatBDT(item.price * item.qty)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Payment
                      </p>
                      <p className="mt-2 text-[0.68rem]">
                        {order.payment} · {order.payment_status}
                      </p>
                    </div>

                    <div>
                      <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Customer
                      </p>
                      <p className="mt-2 text-[0.68rem] font-semibold">{order.customer}</p>
                      <p className="mt-1 text-[0.62rem] text-muted-foreground">{order.phone}</p>
                      {order.email && (
                        <p className="text-[0.62rem] text-muted-foreground">{order.email}</p>
                      )}
                      <p className="mt-2 text-[0.64rem] leading-relaxed text-muted-foreground">
                        {order.address}, {order.district}
                      </p>
                      {order.note && (
                        <p className="mt-2 rounded-lg bg-[var(--muted)] px-2.5 py-2 text-[0.6rem] text-muted-foreground">
                          Note: {order.note}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="flex items-center gap-1.5 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        <Truck className="h-3 w-3" /> Steadfast
                      </p>
                      {order.tracking_code ? (
                        <div className="mt-2 space-y-2">
                          <p className="font-mono text-[0.68rem] font-semibold">{order.tracking_code}</p>
                          <p className="text-[0.58rem] text-muted-foreground">
                            Consignment {order.courier_consignment_id ?? "—"} · {pretty(order.courier_status) || "Awaiting status"}
                          </p>
                          <p className="text-[0.54rem] text-muted-foreground">
                            Last sync {when(order.courier_last_synced_at)}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => courierAction(order, "sync")}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-midnight px-3 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-ivory disabled:opacity-50"
                            >
                              <RefreshCw className={cn("h-3 w-3", busy && "animate-spin")} />
                              Sync tracking
                            </button>
                            <button
                              type="button"
                              onClick={() => copy(order.tracking_code ?? "")}
                              className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground hover:border-indigo hover:text-indigo"
                              aria-label="Copy tracking code"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            {order.courier_tracking_link && (
                              <a
                                href={order.courier_tracking_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground hover:border-indigo hover:text-indigo"
                                aria-label="Open Steadfast tracking"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="text-[0.6rem] leading-relaxed text-muted-foreground">
                            No parcel booked yet. Booking sends the customer and COD details to
                            Steadfast using this order number.
                          </p>
                          <button
                            type="button"
                            disabled={busy || ["Cancelled", "Returned", "Refunded", "Failed Delivery"].includes(order.status)}
                            onClick={() => courierAction(order, "book")}
                            className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-indigo px-3 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-ivory disabled:opacity-50"
                          >
                            <Truck className="h-3 w-3" /> {busy ? "Booking…" : "Book with Steadfast"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
