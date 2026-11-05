"use client";

import { useEffect, useState } from "react";

export function OfferCountdown({
  endsAt,
  compact = false,
}: {
  endsAt?: string;
  compact?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const target = endsAt ? new Date(endsAt).getTime() : null;

  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time >= target) setExpired(true);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!target || expired || (Number.isFinite(target) && Date.now() >= target)) {
    return null;
  }

  const diff = Math.max(0, target - (now ?? target));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  const units = [
    { label: "Days", value: now === null ? "--" : pad(days) },
    { label: "Hours", value: now === null ? "--" : pad(hours) },
    { label: "Min", value: now === null ? "--" : pad(minutes) },
    { label: "Sec", value: now === null ? "--" : pad(seconds) },
  ];

  return (
    <div className={compact ? "grid grid-cols-4 gap-1.5" : "grid grid-cols-4 gap-2 sm:gap-3"}>
      {units.map((unit) => (
        <div
          key={unit.label}
          className={
            compact
              ? "rounded-lg border border-[var(--border)] bg-[var(--surface-2)] py-2 text-center"
              : "rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-3 text-center sm:py-4"
          }
        >
          <p
            className={
              compact
                ? "font-display text-lg tabular-nums leading-none"
                : "font-display text-[1.9rem] tabular-nums leading-none sm:text-[2.2rem]"
            }
          >
            {unit.value}
          </p>
          <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.1em] text-indigo">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  );
}
