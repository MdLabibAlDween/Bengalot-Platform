import { Check, Circle, Package, Truck } from "lucide-react";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

const steps = [
  { key: "Order Placed", label: "Order placed", note: "We have your order." },
  { key: "Confirmed", label: "Confirmed", note: "Checked by the atelier." },
  { key: "Processing", label: "Preparing", note: "Packed with care." },
  { key: "Handed to Courier", label: "With courier", note: "Collected by Steadfast." },
  { key: "In Transit", label: "On the way", note: "Heading to your district." },
  { key: "Delivered", label: "Delivered", note: "At your door." },
];

function eventFor(order: Order, key: string) {
  return order.events.find((event) => event.status === key);
}

export function OrderTimeline({
  order,
  className,
}: {
  order: Order;
  className?: string;
}) {
  const terminal = ["Cancelled", "Returned", "Failed Delivery", "Refunded", "Returning"].includes(
    order.status
  );
  const reachedIndex = terminal
    ? -1
    : steps.reduce((max, step, index) => {
        if (eventFor(order, step.key) || order.status === step.key) return index;
        return max;
      }, 0);

  if (terminal) {
    const meta = ORDER_STATUS_META[order.status];
    return (
      <div className={cn("rounded-2xl border border-rosewood/25 bg-rosewood/[0.04] p-5", className)}>
        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full", meta?.dot ?? "bg-rosewood")} />
          <p className="font-display text-xl">{order.status}</p>
        </div>
        <p className="mt-2 text-[0.76rem] leading-relaxed text-muted-foreground">
          This order is marked as {order.status.toLowerCase()}. If you need help, our team is
          on WhatsApp.
        </p>
        <div className="mt-4 space-y-3 border-t border-rosewood/20 pt-4">
          {order.events.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <Circle className="mt-1 h-2 w-2 fill-current text-rosewood" />
              <div>
                <p className="text-[0.7rem] font-semibold">{event.status}</p>
                <p className="text-[0.62rem] text-muted-foreground">{event.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-jade/10 text-jade">
            <Truck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Live order status
            </p>
            <p className="text-[0.82rem] font-semibold">{order.status}</p>
          </div>
        </div>
        {order.trackingCode && (
          <div className="text-right">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {order.courier ?? "Courier"} tracking
            </p>
            <p className="font-mono text-[0.72rem] font-semibold">{order.trackingCode}</p>
          </div>
        )}
      </div>

      <ol className="relative">
        {steps.map((step, index) => {
          const event = eventFor(order, step.key);
          const done = index <= reachedIndex;
          const current = index === reachedIndex;
          return (
            <li key={step.key} className="relative flex gap-4 pb-5 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px",
                    done && index < reachedIndex ? "bg-jade/50" : "bg-[var(--border)]"
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                  done
                    ? "border-jade bg-jade text-white"
                    : "border-[var(--border)] bg-[var(--surface)] text-muted-foreground",
                  current && "ring-4 ring-jade/15"
                )}
              >
                {done ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : index === 3 || index === 4 ? (
                  <Truck className="h-3 w-3" />
                ) : index === 5 ? (
                  <Package className="h-3 w-3" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      "text-[0.78rem] font-semibold",
                      done ? "text-foreground" : "text-muted-foreground/60"
                    )}
                  >
                    {step.label}
                  </p>
                  {event && (
                    <span className="text-[0.58rem] tabular-nums text-muted-foreground">
                      {new Date(event.date).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-[0.65rem]",
                    done ? "text-muted-foreground" : "text-muted-foreground/40"
                  )}
                >
                  {event?.note ?? step.note}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
