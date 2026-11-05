"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  length = 6,
  onComplete,
}: {
  length?: number;
  onComplete?: (code: string) => void;
}) {
  const [values, setValues] = useState(Array(length).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setAt = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    setValues(next);
    if (next.every(Boolean)) onComplete?.(next.join(""));
  };

  return (
    <div className="flex items-center gap-2">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={value}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(index, digit);
            if (digit && index < length - 1) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !values[index] && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            e.preventDefault();
            const next = Array(length).fill("");
            pasted.split("").forEach((digit, i) => {
              next[i] = digit;
            });
            setValues(next);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          className={cn(
            "h-12 w-full rounded-xl border border-[var(--input)] bg-[var(--surface)] text-center font-display text-xl outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
          )}
        />
      ))}
    </div>
  );
}
