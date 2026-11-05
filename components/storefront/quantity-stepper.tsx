"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = "default",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "default";
  className?: string;
}) {
  const btn =
    "grid place-items-center text-foreground transition hover:text-gold disabled:pointer-events-none disabled:opacity-30";
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]",
        size === "sm" ? "h-8" : "h-11",
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={cn(btn, size === "sm" ? "h-8 w-8" : "h-11 w-11")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "w-7 text-center font-semibold tabular-nums",
          size === "sm" ? "text-xs" : "text-sm"
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={cn(btn, size === "sm" ? "h-8 w-8" : "h-11 w-11")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
