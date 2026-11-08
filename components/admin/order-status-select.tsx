"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { orderStatusMeta } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = [
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(next: OrderStatus) {
    setLoading(true);
    setError("");
    const previous = current;
    setCurrent(next);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: next }),
      });
      const data = (await response.json()) as { message?: string; ok?: boolean };
      if (!response.ok) throw new Error(data.message ?? "Could not update order");
      router.refresh();
    } catch (updateError) {
      setCurrent(previous);
      setError(
        updateError instanceof Error ? updateError.message : "Could not update order",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={current}
        onChange={(event) => handleChange(event.target.value as OrderStatus)}
        disabled={loading}
        aria-label="Update order status"
        className={`h-8 rounded-full border-0 px-2.5 text-[0.58rem] font-bold uppercase tracking-[0.06em] outline-none ring-1 ring-inset ring-black/5 transition-opacity disabled:opacity-60 ${orderStatusMeta[current].className}`}
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {orderStatusMeta[item].label}
          </option>
        ))}
      </select>
      {loading ? (
        <Loader2 className="size-3 animate-spin text-muted" aria-label="Updating" />
      ) : null}
      {error ? (
        <span className="text-[0.56rem] font-medium text-coral">{error}</span>
      ) : null}
    </div>
  );
}
