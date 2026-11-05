"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type RailLayout = {
  width: number;
  step: number;
  overflowing: boolean;
};

export function CircleScroller({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<RailLayout | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const count = Children.count(children);

  const syncArrows = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const measure = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const styles = getComputedStyle(el);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const cell = first.getBoundingClientRect().width;
      const available = parent.clientWidth;
      if (!cell || !available) return;

      const columns = Math.max(1, Math.floor((available + gap) / (cell + gap)));
      const visible = Math.min(columns, count);
      const width = Math.round(visible * cell + Math.max(0, visible - 1) * gap);
      const step = Math.max(1, columns) * (cell + gap);

      setLayout((current) =>
        current &&
        current.width === width &&
        current.step === step &&
        current.overflowing === count > columns
          ? current
          : { width, step, overflowing: count > columns }
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    el.addEventListener("scroll", syncArrows, { passive: true });
    measure();
    const frame = requestAnimationFrame(measure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("scroll", syncArrows);
    };
  }, [count, syncArrows]);

  useEffect(() => {
    const frame = requestAnimationFrame(syncArrows);
    return () => cancelAnimationFrame(frame);
  }, [layout, syncArrows]);

  const scroll = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({
      left: direction * (layout?.step ?? el.clientWidth),
      behavior: "smooth",
    });
  };

  const widthStyle: CSSProperties | undefined = layout
    ? { width: `${layout.width}px` }
    : undefined;

  return (
    <div className={className}>
      {layout?.overflowing && (
        <div
          className="mx-auto mb-3 flex items-center justify-end gap-2"
          style={widthStyle}
        >
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            aria-label="Previous categories"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-foreground/70 transition hover:border-gold hover:text-gold-ink disabled:cursor-default disabled:opacity-25"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canRight}
            aria-label="Next categories"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-foreground/70 transition hover:border-gold hover:text-gold-ink disabled:cursor-default disabled:opacity-25"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        ref={ref}
        style={widthStyle}
        className={cn(
          "no-scrollbar mx-auto flex snap-x snap-proximity gap-4 overflow-x-auto scroll-smooth pb-3 md:gap-7"
        )}
      >
        {children}
      </div>
    </div>
  );
}
