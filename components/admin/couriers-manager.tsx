"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatBDT } from "@/lib/utils";

type Health = {
  enabled: boolean;
  autoBookOnConfirmed: boolean;
  webhookRequireSignature: boolean;
  apiKeySet: boolean;
  secretKeySet: boolean;
  webhookTokenSet: boolean;
  configured: boolean;
};

type Shipment = {
  id: string;
  order_id: string;
  order_no: string;
  consignment_id: number | string | null;
  tracking_code: string | null;
  tracking_link: string | null;
  courier_status: string | null;
  cod_amount: number;
  delivery_charge: number | null;
  booked_at: string;
  last_synced_at: string | null;
  last_webhook_at: string | null;
  courier?: string;
  customer: string;
  order_status: string;
  total: number;
  phone: string;
};

type CourierEvent = {
  id: string;
  order_no: string;
  notification_type: string;
  courier_status: string | null;
  message: string | null;
  idempotency_key: string | null;
  signature_status: string | null;
  source: string;
  created_at: string;
};

function pretty(value: string | null | undefined) {
  return (value ?? "unknown").replace(/_/g, " ");
}

function when(value: string | null | undefined) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(status: string | null) {
  if (!status) return "bg-[var(--muted)] text-muted-foreground";
  if (status === "delivered") return "bg-jade/10 text-jade";
  if (status.includes("cancel") || status.includes("return")) return "bg-saffron/15 text-gold-ink";
  if (status.includes("approval")) return "bg-indigo/10 text-indigo";
  return "bg-teal/10 text-teal";
}

export function CouriersManager({
  health,
  webhookUrl,
  shipments,
  events,
}: {
  health: Health;
  webhookUrl: string;
  shipments: Shipment[];
  events: CourierEvent[];
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const active = shipments.filter(
    (row) => !["delivered", "cancelled"].includes(row.courier_status ?? "")
  );
  const delivered = shipments.filter((row) => row.courier_status === "delivered").length;
  const returning = shipments.filter((row) =>
    (row.courier_status ?? "").includes("return")
  ).length;
  const failed = shipments.filter((row) =>
    ["unknown", "exceptional"].includes(row.courier_status ?? "")
  ).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook endpoint copied");
    } catch {
      toast.error(webhookUrl);
    }
  };

  const syncOne = async (shipment: Shipment) => {
    setSyncing(shipment.id);
    const response = await fetch("/api/admin/couriers/steadfast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", orderId: shipment.order_id }),
    });
    const result = await response.json().catch(() => ({}));
    setSyncing(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not sync the parcel.");
      return;
    }
    toast.success("Tracking synced", {
      description: result.courierStatus
        ? `Steadfast status: ${pretty(result.courierStatus)}.`
        : undefined,
    });
    router.refresh();
  };

  const syncAll = async () => {
    setSyncingAll(true);
    const response = await fetch("/api/admin/couriers/steadfast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_all" }),
    });
    const result = await response.json().catch(() => ({}));
    setSyncingAll(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not sync the courier queue.");
      return;
    }
    toast.success("Courier queue synced", {
      description: `${result.succeeded ?? 0} updated, ${result.failed ?? 0} failed${
        result.total === 0 ? " · nothing active" : ""
      }.`,
    });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "API credentials",
            value: health.apiKeySet && health.secretKeySet ? "Ready" : "Needs setup",
            helper: "API key + secret key",
            ok: health.apiKeySet && health.secretKeySet,
            icon: Truck,
          },
          {
            label: "Webhook token",
            value: health.webhookTokenSet ? "Ready" : "Not set",
            helper: health.webhookRequireSignature ? "Signature required" : "Bearer verified",
            ok: health.webhookTokenSet,
            icon: Webhook,
          },
          {
            label: "Auto-book",
            value: health.autoBookOnConfirmed ? "On Confirmed" : "Manual",
            helper: "Creates a parcel when confirmed",
            ok: health.autoBookOnConfirmed,
            icon: PackageCheck,
          },
          {
            label: "Active parcels",
            value: String(active.length),
            helper: `${delivered} delivered · ${returning} returning · ${failed} exceptions`,
            ok: true,
            icon: ShieldCheck,
          },
        ].map(({ label, value, helper, ok, icon: Icon }) => (
          <div
            key={label}
            className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 font-display text-[1.45rem] leading-none">{value}</p>
                <p className="mt-2 text-[0.56rem] text-muted-foreground">{helper}</p>
              </div>
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full",
                  ok ? "bg-jade/10 text-jade" : "bg-saffron/15 text-gold-ink"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {!health.configured && (
        <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-saffron/35 bg-saffron/[0.06] px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-gold-ink" />
          <p className="min-w-0 flex-1 text-[0.68rem] leading-relaxed">
            Steadfast is not fully configured. Add the API key and secret key in{" "}
            <Link href="/admin/integrations" className="font-semibold text-indigo underline">
              Integrations
            </Link>
            . Booking stays disabled until both are present.
          </p>
        </div>
      )}

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-indigo">
              Webhook
            </p>
            <h2 className="mt-1 font-display text-xl">Endpoint for Steadfast</h2>
            <p className="mt-1 max-w-2xl text-[0.64rem] leading-relaxed text-muted-foreground">
              Paste this exact HTTPS URL into Steadfast → Webhook. Then set an Auth token in
              Steadfast and save the same value under Integrations → Steadfast webhook auth
              token. Steadfast sends it as <code>Authorization: Bearer …</code> and signs the
              raw body as <code>X-Signature</code>.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copy}>
              <Copy className="h-3.5 w-3.5" /> Copy URL
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/integrations">
                <ExternalLink className="h-3.5 w-3.5" /> Integrations
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="max-w-full break-all rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-2 text-[0.64rem]">
            {webhookUrl}
          </code>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]",
              health.webhookTokenSet ? "bg-jade/10 text-jade" : "bg-saffron/15 text-gold-ink"
            )}
          >
            {health.webhookTokenSet ? "Bearer verification on" : "Token missing"}
          </span>
          <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {health.webhookRequireSignature ? "X-Signature required" : "X-Signature checked when present"}
          </span>
        </div>
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Shipments
            </p>
            <h2 className="mt-1 font-display text-xl">Parcels & tracking</h2>
          </div>
          <Button type="button" size="sm" onClick={syncAll} disabled={syncingAll || !health.configured}>
            <RefreshCw className={cn("h-3.5 w-3.5", syncingAll && "animate-spin")} />
            {syncingAll ? "Syncing…" : "Sync active parcels"}
          </Button>
        </div>
        {shipments.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Truck className="mx-auto h-7 w-7 text-muted-foreground/35" />
            <p className="mt-3 font-display text-xl">No parcels booked yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-[0.66rem] leading-relaxed text-muted-foreground">
              Open an order in Order desk and choose “Book with Steadfast”, or enable
              auto-booking on Confirmed in Integrations.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/admin/orders">Open order desk</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Order", "Customer", "Tracking", "Steadfast status", "Last sync", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold">{shipment.order_no}</p>
                      <p className="text-[0.52rem] text-muted-foreground">
                        {formatBDT(shipment.total)} · order {shipment.order_status}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{shipment.customer}</p>
                      <p className="text-[0.52rem] text-muted-foreground">{shipment.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      {shipment.tracking_code ? (
                        <>
                          <p className="font-mono text-[0.62rem]">{shipment.tracking_code}</p>
                          <p className="text-[0.5rem] text-muted-foreground">
                            Consignment {shipment.consignment_id ?? "—"}
                          </p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]", statusTone(shipment.courier_status))}>
                        {pretty(shipment.courier_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[0.54rem] text-muted-foreground">
                      <p>{when(shipment.last_synced_at ?? shipment.booked_at)}</p>
                      {shipment.last_webhook_at && (
                        <p>Webhook {when(shipment.last_webhook_at)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => syncOne(shipment)}
                        disabled={syncing === shipment.id}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:border-indigo hover:text-indigo disabled:opacity-50"
                      >
                        <RefreshCw className={cn("h-3 w-3", syncing === shipment.id && "animate-spin")} />
                        {syncing === shipment.id ? "Syncing…" : "Sync"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Webhook log
            </p>
            <h2 className="mt-1 font-display text-xl">Recent events</h2>
          </div>
          <span className="text-[0.52rem] text-muted-foreground">{events.length} stored</span>
        </div>
        {events.length === 0 ? (
          <div className="px-5 py-12 text-center text-[0.66rem] text-muted-foreground">
            No Steadfast webhook events have arrived yet.
          </div>
        ) : (
          <div className="max-h-[420px] divide-y divide-[var(--color-border)] overflow-y-auto">
            {events.map((event) => (
              <div key={event.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo/10 text-indigo">
                  <Webhook className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[0.66rem] font-semibold">
                    {event.order_no}
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[0.42rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {event.notification_type}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[0.42rem] font-bold uppercase tracking-[0.08em]", statusTone(event.courier_status))}>
                      {pretty(event.courier_status)}
                    </span>
                  </p>
                  <p className="mt-1 text-[0.6rem] text-muted-foreground">
                    {event.message ?? "No message provided."}
                  </p>
                  <p className="mt-1 text-[0.5rem] uppercase tracking-[0.06em] text-muted-foreground/70">
                    {when(event.created_at)} · {event.source} · signature {event.signature_status ?? "absent"}
                    {event.idempotency_key ? ` · ${event.idempotency_key.slice(-12)}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
