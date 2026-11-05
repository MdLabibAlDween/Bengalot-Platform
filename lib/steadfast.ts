import "server-only";

import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getIntegrationSecrets,
  getIntegrationsConfig,
} from "@/lib/admin/settings";
import {
  changeOrderStatus,
  type OrderStatusValue,
} from "@/lib/admin/order-status";

const BASE_URL = "https://portal.packzy.com/api/v1";
const TIMEOUT_MS = 20_000;

export type SteadfastErrorKind =
  | "validation"
  | "duplicate"
  | "auth"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "unavailable"
  | "unexpected";

export class SteadfastError extends Error {
  kind: SteadfastErrorKind;
  httpStatus?: number;
  body?: unknown;
  retryable: boolean;

  constructor(
    kind: SteadfastErrorKind,
    message: string,
    options?: { httpStatus?: number; body?: unknown }
  ) {
    super(message);
    this.name = "SteadfastError";
    this.kind = kind;
    this.httpStatus = options?.httpStatus;
    this.body = options?.body;
    this.retryable = kind === "unavailable" || kind === "rate_limited";
  }
}

export type SteadfastCredentials = {
  apiKey: string;
  secretKey: string;
  webhookToken: string;
  enabled: boolean;
  autoBookOnConfirmed: boolean;
  webhookRequireSignature: boolean;
  defaultDeliveryType: 0 | 1;
};

export type SteadfastOrderRow = {
  id: string;
  order_no: string;
  status: string;
  customer: string;
  phone: string;
  email: string | null;
  district: string;
  address: string;
  note: string | null;
  total: number;
  payment: string;
  items: { name?: string; qty?: number; size?: string; color?: string }[] | null;
  courier?: string | null;
  courier_status?: string | null;
  courier_consignment_id?: number | string | null;
  courier_tracking_link?: string | null;
  courier_last_synced_at?: string | null;
  tracking_code?: string | null;
};

export type SteadfastParcel = {
  consignment_id: number;
  invoice: string;
  tracking_code: string;
  tracking_link?: string;
  status?: string;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_address?: string;
  cod_amount?: number;
  created_at?: string;
  updated_at?: string;
};

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) return `0${digits.slice(3)}`;
  if (digits.startsWith("0") && digits.length === 11) return digits;
  if (digits.startsWith("1") && digits.length === 10) return `0${digits}`;
  return digits;
}

function kindFor(status: number): SteadfastErrorKind {
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409 || status === 422) return "duplicate";
  if (status === 400) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "unavailable";
  return "unexpected";
}

function messageFrom(body: unknown, fallback: string) {
  if (typeof body !== "object" || body === null) return fallback;
  const record = body as { message?: unknown; errors?: unknown };
  if (record.errors && typeof record.errors === "object") {
    const first = Object.values(record.errors as Record<string, unknown>).flat()[0];
    if (typeof first === "string") {
      return typeof record.message === "string" ? `${record.message}: ${first}` : first;
    }
  }
  return typeof record.message === "string" ? record.message : fallback;
}

export async function getSteadfastCredentials(): Promise<
  { ok: true; credentials: SteadfastCredentials } | { ok: false; error: string }
> {
  const [config, secrets] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecrets(),
  ]);
  if (!config.steadfast.enabled) {
    return { ok: false, error: "Steadfast is disabled in Integrations." };
  }
  if (!secrets.steadfastApiKey || !secrets.steadfastSecretKey) {
    return {
      ok: false,
      error: "Add the Steadfast API key and secret key in Integrations first.",
    };
  }
  return {
    ok: true,
    credentials: {
      apiKey: secrets.steadfastApiKey,
      secretKey: secrets.steadfastSecretKey,
      webhookToken: secrets.steadfastWebhookSecret ?? "",
      enabled: true,
      autoBookOnConfirmed: Boolean(config.steadfast.autoBookOnConfirmed),
      webhookRequireSignature: Boolean(config.steadfast.webhookRequireSignature),
      defaultDeliveryType: config.steadfast.defaultDeliveryType === 1 ? 1 : 0,
    },
  };
}

async function steadfastRequest<T>(
  path: string,
  options?: { method?: "GET" | "POST"; body?: unknown; auth?: boolean }
): Promise<T> {
  const credentials = await getSteadfastCredentials();
  if (!credentials.ok) throw new SteadfastError("auth", credentials.error);

  const method = options?.method ?? "GET";
  const auth = options?.auth !== false;
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(auth
          ? {
              "Api-Key": credentials.credentials.apiKey,
              "Secret-Key": credentials.credentials.secretKey,
            }
          : {}),
        ...(options?.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? `Steadfast did not respond within ${TIMEOUT_MS / 1000} seconds.`
        : error instanceof Error
          ? `Could not reach Steadfast: ${error.message}`
          : "Could not reach Steadfast.";
    throw new SteadfastError("unavailable", message);
  }

  const text = await response.text().catch(() => "");
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Keep the raw text for safe diagnostics.
  }

  if (!response.ok) {
    throw new SteadfastError(
      kindFor(response.status),
      messageFrom(body, `Steadfast responded ${response.status}.`),
      { httpStatus: response.status, body }
    );
  }

  if (typeof body === "object" && body !== null) {
    const inner = (body as { status?: unknown }).status;
    if (typeof inner === "number" && inner >= 400) {
      throw new SteadfastError(
        kindFor(inner),
        messageFrom(body, `Steadfast returned status ${inner}.`),
        { httpStatus: response.status, body }
      );
    }
  }
  return body as T;
}

export async function steadfastPing() {
  await steadfastRequest("/ping", { auth: false });
  return { ok: true as const };
}

export async function steadfastBalance() {
  const body = await steadfastRequest<{ current_balance?: unknown }>("/get_balance");
  const balance = Number(body.current_balance);
  if (!Number.isFinite(balance)) {
    throw new SteadfastError("unexpected", "Steadfast did not return a usable balance.");
  }
  return balance;
}

export async function createSteadfastParcel(
  order: SteadfastOrderRow,
  deliveryType?: 0 | 1
) {
  const credentials = await getSteadfastCredentials();
  if (!credentials.ok) throw new SteadfastError("auth", credentials.error);

  const phone = normalizePhone(order.phone);
  if (!/^01[3-9]\d{8}$/.test(phone)) {
    throw new SteadfastError("validation", "The customer phone is not a valid Bangladeshi mobile number.");
  }
  if (!/^[A-Za-z0-9_-]+$/.test(order.order_no)) {
    throw new SteadfastError("validation", "The order number contains characters Steadfast does not accept.");
  }
  if (!order.customer.trim()) {
    throw new SteadfastError("validation", "The customer name is required.");
  }
  if (!order.address.trim()) {
    throw new SteadfastError("validation", "The delivery address is required.");
  }
  if ([...order.customer].length > 100) {
    throw new SteadfastError("validation", "The customer name is longer than Steadfast accepts (100 characters).");
  }
  if ([...order.address].length > 490) {
    throw new SteadfastError("validation", "The delivery address is longer than Steadfast accepts (490 characters).");
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const totalLot = Math.max(1, items.reduce((sum, item) => sum + Math.max(1, Number(item.qty ?? 1)), 0));
  const description = items
    .map((item) => `${item.name ?? "Item"}${item.size ? ` (${item.size})` : ""} x${item.qty ?? 1}`)
    .join(", ")
    .slice(0, 255);
  const codAmount =
    order.payment === "Cash on Delivery" ? Math.max(0, Math.round(Number(order.total))) : 0;

  const body = await steadfastRequest<{ consignment?: SteadfastParcel }>("/create_order", {
    method: "POST",
    body: {
      invoice: order.order_no,
      recipient_name: order.customer.trim(),
      recipient_phone: phone,
      recipient_address: order.address.trim(),
      cod_amount: codAmount,
      ...(order.email ? { recipient_email: order.email.trim() } : {}),
      ...(order.note ? { note: order.note.slice(0, 480) } : {}),
      ...(description ? { item_description: description } : {}),
      total_lot: totalLot,
      delivery_type: deliveryType ?? credentials.credentials.defaultDeliveryType,
    },
  });
  if (!body.consignment?.consignment_id) {
    throw new SteadfastError("unexpected", "Steadfast did not return a consignment id.");
  }
  return body.consignment;
}

export async function getSteadfastStatusByConsignment(consignmentId: number | string) {
  const body = await steadfastRequest<{ delivery_status?: unknown }>(
    `/status_by_cid/${encodeURIComponent(String(consignmentId))}`
  );
  return String(body.delivery_status ?? "");
}

export async function getSteadfastStatusByInvoice(invoice: string) {
  const body = await steadfastRequest<{ delivery_status?: unknown }>(
    `/status_by_invoice/${encodeURIComponent(invoice)}`
  );
  return String(body.delivery_status ?? "");
}

export async function getSteadfastReturnStatus(consignmentId: number | string) {
  const body = await steadfastRequest<{ delivery_status?: unknown }>(
    `/status_with_return_status_by_cid/${encodeURIComponent(String(consignmentId))}`
  );
  return String(body.delivery_status ?? "");
}

export async function getSteadfastTracking(invoice: string) {
  const body = await steadfastRequest<{ tracking?: unknown }>(
    `/trackings_by_invoice/${encodeURIComponent(invoice)}`
  );
  return Array.isArray(body.tracking) ? body.tracking : [];
}

function trackingLinkFor(trackingCode: string | null | undefined) {
  return trackingCode ? `https://steadfast.com.bd/t/${trackingCode}` : null;
}

export function orderStatusForSteadfast(courierStatus: string): {
  status: OrderStatusValue | null;
  skipRewards: boolean;
} {
  switch (courierStatus) {
    case "delivered":
      return { status: "Delivered", skipRewards: false };
    case "partial_delivered":
      return { status: "Delivered", skipRewards: true };
    case "cancelled":
    case "cancelled_return_processing":
    case "cancelled_return_rider_assigned":
    case "partial_delivered_return_processing":
    case "partial_delivered_return_rider_assigned":
      return { status: "Returning", skipRewards: false };
    case "cancelled_return_received":
    case "partial_delivered_return_received":
      return { status: "Returned", skipRewards: false };
    case "delivered_approval_pending":
    case "partial_delivered_approval_pending":
      return { status: "In Transit", skipRewards: false };
    default:
      return { status: null, skipRewards: false };
  }
}

export async function applySteadfastStatus(
  admin: SupabaseClient,
  input: {
    order: SteadfastOrderRow;
    consignmentId?: number | string | null;
    trackingCode?: string | null;
    trackingLink?: string | null;
    courierStatus: string;
    message?: string;
    source: "webhook" | "sync" | "booking";
    deliveryCharge?: number | null;
    raw?: unknown;
  }
) {
  const now = new Date().toISOString();
  const consignmentId =
    input.consignmentId ?? input.order.courier_consignment_id ?? null;
  const trackingCode = input.trackingCode ?? input.order.tracking_code ?? null;
  const trackingLink =
    input.trackingLink ?? trackingLinkFor(trackingCode) ?? input.order.courier_tracking_link ?? null;

  const { data: existingShipment } = await admin
    .from("courier_shipments")
    .select("id")
    .eq("provider", "steadfast")
    .eq("order_id", input.order.id)
    .maybeSingle();

  const shipmentPayload = {
    order_id: input.order.id,
    order_no: input.order.order_no,
    provider: "steadfast",
    consignment_id: consignmentId ? Number(consignmentId) : null,
    tracking_code: trackingCode,
    tracking_link: trackingLink,
    courier_status: input.courierStatus,
    cod_amount:
      input.order.payment === "Cash on Delivery" ? Math.round(Number(input.order.total)) : 0,
    delivery_charge:
      input.deliveryCharge === undefined || input.deliveryCharge === null
        ? null
        : Math.round(Number(input.deliveryCharge)),
    last_synced_at: now,
    ...(input.source === "webhook" ? { last_webhook_at: now } : {}),
    ...(input.raw ? { raw: input.raw } : {}),
  };

  if (existingShipment?.id) {
    await admin.from("courier_shipments").update(shipmentPayload).eq("id", existingShipment.id);
  } else {
    await admin.from("courier_shipments").insert({
      ...shipmentPayload,
      booked_at: now,
    });
  }

  await admin
    .from("orders")
    .update({
      courier: "Steadfast",
      courier_status: input.courierStatus,
      courier_consignment_id: consignmentId ? Number(consignmentId) : null,
      tracking_code: trackingCode,
      courier_tracking_link: trackingLink,
      courier_last_synced_at: now,
    })
    .eq("id", input.order.id);

  const mapped = orderStatusForSteadfast(input.courierStatus);
  let changed = false;
  if (mapped.status && mapped.status !== input.order.status) {
    const blockedDowngrade =
      ["Delivered", "Returned", "Refunded", "Cancelled"].includes(input.order.status) &&
      mapped.status !== "Returned";
    if (!blockedDowngrade) {
      const result = await changeOrderStatus(admin, {
        orderId: input.order.id,
        status: mapped.status,
        source: input.source === "webhook" ? "steadfast_webhook" : "steadfast_sync",
        note: `Steadfast: ${input.message || input.courierStatus.replace(/_/g, " ")}`,
        skipRewards: mapped.skipRewards,
      });
      if (!result.ok) {
        throw new SteadfastError("unexpected", result.error);
      }
      changed = result.changed;
    }
  }

  return {
    ok: true as const,
    courierStatus: input.courierStatus,
    orderStatus: mapped.status,
    changed,
    consignmentId,
    trackingCode,
    trackingLink,
  };
}

export async function bookSteadfastOrder(
  admin: SupabaseClient,
  order: SteadfastOrderRow
) {
  const { data: existing } = await admin
    .from("courier_shipments")
    .select("id,consignment_id,tracking_code,tracking_link,courier_status")
    .eq("provider", "steadfast")
    .eq("order_id", order.id)
    .maybeSingle();
  if (existing) {
    return {
      ok: false as const,
      alreadyBooked: true,
      error: "This order already has a Steadfast parcel.",
      shipment: existing,
    };
  }

  const parcel = await createSteadfastParcel(order);
  const result = await applySteadfastStatus(admin, {
    order,
    consignmentId: parcel.consignment_id,
    trackingCode: parcel.tracking_code,
    trackingLink:
      parcel.tracking_link ?? trackingLinkFor(parcel.tracking_code),
    courierStatus: parcel.status ?? "in_review",
    message: `Parcel booked. Tracking ${parcel.tracking_code}.`,
    source: "booking",
    raw: parcel,
  });

  if (["Pending", "Confirmed", "Processing"].includes(order.status)) {
    const statusResult = await changeOrderStatus(admin, {
      orderId: order.id,
      status: "Handed to Courier",
      source: "steadfast_sync",
      note: `Steadfast parcel booked. Tracking ${parcel.tracking_code}.`,
    });
    if (!statusResult.ok) {
      return { ok: false as const, error: statusResult.error, parcel };
    }
  }

  return { ok: true as const, parcel, shipment: result };
}

export async function syncSteadfastOrder(
  admin: SupabaseClient,
  orderId: string
) {
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false as const, error: "Order not found." };
  const row = order as SteadfastOrderRow;

  let courierStatus = "";
  let consignmentId = row.courier_consignment_id ?? null;
  if (consignmentId) {
    courierStatus = await getSteadfastStatusByConsignment(consignmentId);
  } else {
    courierStatus = await getSteadfastStatusByInvoice(row.order_no);
  }
  if (!courierStatus) {
    return { ok: false as const, error: "Steadfast returned no delivery status." };
  }

  // A cancelled parcel is coming back, not back yet. Ask for the return leg
  // when available so we only restock on *_return_received.
  if (courierStatus.startsWith("cancelled") || courierStatus.startsWith("partial_delivered")) {
    if (consignmentId) {
      try {
        const returnStatus = await getSteadfastReturnStatus(consignmentId);
        if (returnStatus.includes("return_")) courierStatus = returnStatus;
      } catch {
        // The standard status is still useful and safe; keep it.
      }
    }
  }

  const result = await applySteadfastStatus(admin, {
    order: row,
    consignmentId,
    courierStatus,
    message: `Status checked with Steadfast: ${courierStatus.replace(/_/g, " ")}.`,
    source: "sync",
  });
  return { ...result, ok: true as const };
}

export async function syncAllSteadfastOrders(admin: SupabaseClient, limit = 25) {
  const { data } = await admin
    .from("orders")
    .select("id,status,courier")
    .eq("courier", "Steadfast")
    .not("status", "in", '("Delivered","Returned","Cancelled","Refunded","Failed Delivery")')
    .order("courier_last_synced_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  const rows = data ?? [];
  const results: { orderId: string; ok: boolean; error?: string }[] = [];
  for (const row of rows) {
    try {
      const result = await syncSteadfastOrder(admin, row.id);
      results.push({ orderId: row.id, ok: result.ok, error: result.ok ? undefined : result.error });
    } catch (error) {
      results.push({
        orderId: row.id,
        ok: false,
        error: error instanceof Error ? error.message : "Sync failed.",
      });
    }
  }
  return {
    total: rows.length,
    succeeded: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    results,
  };
}

export function verifySteadfastWebhook(
  rawBody: string,
  headers: Headers,
  token: string,
  requireSignature: boolean
) {
  if (!token) {
    return { ok: false as const, reason: "Webhook auth token is not configured." };
  }
  const auth = headers.get("authorization") ?? "";
  const received = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!received || received.length !== token.length) {
    return { ok: false as const, reason: "Invalid webhook authorization." };
  }
  if (!crypto.timingSafeEqual(Buffer.from(received), Buffer.from(token))) {
    return { ok: false as const, reason: "Invalid webhook authorization." };
  }

  const signature = headers.get("x-signature");
  if (!signature && requireSignature) {
    return { ok: false as const, reason: "Missing X-Signature header." };
  }
  let signatureStatus: "valid" | "invalid" | "absent" = "absent";
  if (signature) {
    const expected = crypto
      .createHmac("sha256", token)
      .update(rawBody, "utf8")
      .digest("hex");
    const normalized = signature.trim().toLowerCase();
    signatureStatus =
      normalized.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(normalized), Buffer.from(expected))
        ? "valid"
        : "invalid";
    if (signatureStatus === "invalid") {
      return { ok: false as const, reason: "Invalid X-Signature." };
    }
  }

  return { ok: true as const, signatureStatus };
}

export type SteadfastWebhookPayload = {
  notification_type?: string;
  consignment_id?: number | string;
  invoice?: string;
  status?: string;
  cod_amount?: number | string;
  delivery_charge?: number | string;
  tracking_message?: string;
  updated_at?: string;
};

export function parseSteadfastWebhook(body: unknown): SteadfastWebhookPayload | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  const notificationType =
    typeof record.notification_type === "string"
      ? record.notification_type
      : "delivery_status";
  const invoice = typeof record.invoice === "string" ? record.invoice : "";
  const consignmentId =
    typeof record.consignment_id === "number" || typeof record.consignment_id === "string"
      ? record.consignment_id
      : "";
  if (!invoice || !consignmentId) return null;
  return {
    notification_type: notificationType,
    consignment_id: consignmentId,
    invoice,
    status: typeof record.status === "string" ? record.status : undefined,
    cod_amount:
      typeof record.cod_amount === "number" || typeof record.cod_amount === "string"
        ? record.cod_amount
        : undefined,
    delivery_charge:
      typeof record.delivery_charge === "number" ||
      typeof record.delivery_charge === "string"
        ? record.delivery_charge
        : undefined,
    tracking_message:
      typeof record.tracking_message === "string" ? record.tracking_message : undefined,
    updated_at: typeof record.updated_at === "string" ? record.updated_at : undefined,
  };
}

export async function handleSteadfastWebhook(input: {
  admin: SupabaseClient;
  payload: SteadfastWebhookPayload;
  idempotencyKey: string;
  signatureStatus: string;
  rawBody: unknown;
}) {
  const { admin, payload } = input;
  const { data: duplicate } = await admin
    .from("courier_events")
    .select("id")
    .eq("provider", "steadfast")
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();
  if (duplicate) return { ok: true as const, duplicate: true, orderStatus: null };

  const orderNo = payload.invoice ?? "";
  if (!orderNo) return { ok: true as const, duplicate: false, orderStatus: null };

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (!order) {
    await admin.from("courier_events").insert({
      order_no: orderNo,
      provider: "steadfast",
      notification_type: payload.notification_type ?? "delivery_status",
      courier_status: payload.status ?? null,
      message: payload.tracking_message ?? "Order not found for this Steadfast invoice.",
      payload: input.rawBody as Record<string, unknown>,
      idempotency_key: input.idempotencyKey,
      signature_status: input.signatureStatus,
      source: "webhook",
    });
    return { ok: true as const, duplicate: false, orderStatus: null, unknownOrder: true };
  }

  const row = order as SteadfastOrderRow;
  let courierStatus = payload.status ?? "";
  if (
    courierStatus.startsWith("cancelled") ||
    courierStatus.startsWith("partial_delivered")
  ) {
    if (payload.consignment_id) {
      try {
        const returnStatus = await getSteadfastReturnStatus(payload.consignment_id);
        if (returnStatus.includes("return_")) courierStatus = returnStatus;
      } catch {
        // Keep the webhook status if the return lookup is temporarily unavailable.
      }
    }
  }

  let result:
    | Awaited<ReturnType<typeof applySteadfastStatus>>
    | null = null;
  if (courierStatus) {
    result = await applySteadfastStatus(admin, {
      order: row,
      consignmentId: payload.consignment_id,
      courierStatus,
      message: payload.tracking_message,
      source: "webhook",
      deliveryCharge:
        payload.delivery_charge === undefined ? null : Number(payload.delivery_charge),
      raw: input.rawBody,
    });
  }

  const { data: shipment } = await admin
    .from("courier_shipments")
    .select("id")
    .eq("provider", "steadfast")
    .eq("order_id", row.id)
    .maybeSingle();

  await admin.from("courier_events").insert({
    shipment_id: shipment?.id ?? null,
    order_id: row.id,
    order_no: row.order_no,
    provider: "steadfast",
    notification_type: payload.notification_type ?? "delivery_status",
    courier_status: courierStatus || null,
    message: payload.tracking_message ?? null,
    payload: input.rawBody as Record<string, unknown>,
    idempotency_key: input.idempotencyKey,
    signature_status: input.signatureStatus,
    source: "webhook",
  });

  return {
    ok: true as const,
    duplicate: false,
    orderStatus: result?.orderStatus ?? null,
    courierStatus: courierStatus || null,
  };
}

export async function getSteadfastHealth() {
  const [config, secrets] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecrets(),
  ]);
  return {
    enabled: config.steadfast.enabled,
    autoBookOnConfirmed: Boolean(config.steadfast.autoBookOnConfirmed),
    webhookRequireSignature: Boolean(config.steadfast.webhookRequireSignature),
    apiKeySet: Boolean(secrets.steadfastApiKey),
    secretKeySet: Boolean(secrets.steadfastSecretKey),
    webhookTokenSet: Boolean(secrets.steadfastWebhookSecret),
    configured: Boolean(
      config.steadfast.enabled &&
        secrets.steadfastApiKey &&
        secrets.steadfastSecretKey
    ),
  };
}

export async function getSteadfastWebhookSettings() {
  const [config, secrets] = await Promise.all([
    getIntegrationsConfig(),
    getIntegrationSecrets(),
  ]);
  return {
    enabled: config.steadfast.enabled,
    token: secrets.steadfastWebhookSecret ?? "",
    requireSignature: Boolean(config.steadfast.webhookRequireSignature),
  };
}
