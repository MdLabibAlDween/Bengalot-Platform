import type { Order, OrderStatus } from "./types";

export type OrderRow = {
  order_no: string;
  created_at: string;
  updated_at?: string | null;
  status: string;
  items: unknown;
  subtotal: number;
  discount: number;
  bundle_savings: number;
  gift_card_code: string | null;
  gift_card_amount: number;
  delivery: number;
  total: number;
  payment: string;
  payment_status: string;
  district: string;
  address: string;
  customer: string;
  phone: string;
  note: string | null;
  courier?: string | null;
  courier_status?: string | null;
  courier_consignment_id?: number | string | null;
  courier_tracking_link?: string | null;
  tracking_code?: string | null;
};

function statusNote(status: string) {
  switch (status) {
    case "Confirmed":
      return "Your order has been confirmed.";
    case "Processing":
      return "Your pieces are being prepared.";
    case "Handed to Courier":
      return "Your parcel has been handed to the courier.";
    case "In Transit":
      return "Your parcel is on the way.";
    case "Delivered":
      return "Your order has been delivered.";
    case "Returning":
      return "The courier is returning this parcel to us.";
    case "Cancelled":
      return "This order was cancelled.";
    case "Returned":
      return "This order was returned.";
    case "Failed Delivery":
      return "The delivery attempt was unsuccessful.";
    case "Refunded":
      return "This order was refunded.";
    default:
      return "Order received. We will confirm it shortly.";
  }
}

export function mapOrderRow(row: OrderRow): Order {
  const status = row.status as OrderStatus;
  const events: Order["events"] = [
    {
      status: "Order Placed",
      date: row.created_at,
      note: "Order received. We will confirm it shortly.",
    },
  ];
  if (row.status !== "Pending") {
    events.push({
      status,
      date: row.updated_at ?? row.created_at,
      note: statusNote(row.status),
    });
  }
  return {
    orderNo: row.order_no,
    date: row.created_at,
    status,
    items: Array.isArray(row.items) ? (row.items as Order["items"]) : [],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    bundleSavings: Number(row.bundle_savings),
    giftCardCode: row.gift_card_code ?? undefined,
    giftCardAmount: Number(row.gift_card_amount),
    delivery: Number(row.delivery),
    total: Number(row.total),
    payment: row.payment as Order["payment"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    district: row.district,
    address: row.address,
    customer: row.customer,
    phone: row.phone,
    note: row.note ?? undefined,
    courier: row.courier ?? undefined,
    courierStatus: row.courier_status ?? undefined,
    courierConsignmentId:
      row.courier_consignment_id === null || row.courier_consignment_id === undefined
        ? undefined
        : Number(row.courier_consignment_id),
    trackingCode: row.tracking_code ?? undefined,
    trackingLink:
      row.courier_tracking_link ??
      (row.tracking_code ? `https://steadfast.com.bd/t/${row.tracking_code}` : undefined),
    events,
  };
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}
