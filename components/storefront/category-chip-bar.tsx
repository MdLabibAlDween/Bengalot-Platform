"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { ArtIconGlyph } from "@/components/brand/product-art";
import { JamdaniField } from "@/components/brand/ornaments";
import { countForCategory } from "@/lib/data";
import { useLocale } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { Category, Department } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChipMode = "scroll" | "links";

const CHIP_TONES: [string, string][] = [
  ["var(--color-indigo)", "var(--color-indigo-luminous)"],
  ["var(--color-magenta)", "var(--color-magenta-luminous)"],
  ["var(--color-gold-ink)", "var(--color-gold-ink)"],
  ["var(--color-teal)", "var(--color-teal-luminous)"],
  ["var(--color-terracotta)", "var(--color-terracotta-luminous)"],
  ["var(--color-jade)", "var(--color-jade-luminous)"],
];

export function CategoryChipBar({
  department,
  categories,
  activeSlug,
  mode = "links",
  showAll = false,
  onSelect,
  className,
}: {
  department: Department;
  categories: Category[];
  activeSlug?: string | null;
  mode?: ChipMode;
  showAll?: boolean;
  onSelect?: (slug: string) => void;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const { media } = useSiteConfig();
  const [stickyVisible, setStickyVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const hasCentered = useRef(false);

  const activeCategory =
    categories.find((category) => category.slug === activeSlug) ?? null;

  const centerChip = useCallback(
    (
      container: HTMLDivElement | null,
      behavior?: ScrollBehavior
    ) => {
      if (!container || !activeSlug) return;
      const chip = container.querySelector<HTMLElement>(
        `[data-chip="${activeSlug}"]`
      );
      if (!chip) return;
      const containerRect = container.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();
      const target =
        container.scrollLeft +
        (chipRect.left - containerRect.left) -
        container.clientWidth / 2 +
        chipRect.width / 2;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      container.scrollTo({
        left: Math.max(0, target),
        behavior: reduce ? "auto" : behavior ?? "smooth",
      });
    },
    [activeSlug]
  );

  useEffect(() => {
    if (!activeSlug) return;
    // Jump straight to the active chip on first paint so it is never clipped;
    // only animate when the selection changes afterwards.
    const initial = !hasCentered.current;
    hasCentered.current = true;
    centerChip(listRef.current, initial ? "auto" : "smooth");
    if (stickyVisible) centerChip(stickyRef.current, "auto");
  }, [activeSlug, centerChip, stickyVisible]);

  useEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return;
      const headerHeight = window.innerWidth >= 1024 ? 76 : 64;
      setStickyVisible(barRef.current.getBoundingClientRect().bottom <= headerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const moveFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    const container = event.currentTarget.parentElement;
    const items = Array.from(
      container?.querySelectorAll<HTMLElement>("[data-chip]") ?? []
    );
    const index = items.indexOf(event.currentTarget);
    if (index < 0) return;
    event.preventDefault();
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    items[(index + direction + items.length) % items.length]?.focus();
  };

  const renderChip = (category: Category, compact = false) => {
    const count = countForCategory(department.slug, category.slug);
    const empty = count === 0;
    const isActive = activeSlug === category.slug;
    const name = locale === "bn" ? category.nameBn : category.name;
    const interactive = mode === "links" || Boolean(onSelect);
    const toneIndex = Math.max(
      0,
      categories.findIndex((item) => item.slug === category.slug)
    );
    const [tone, toneDeep] = CHIP_TONES[toneIndex % CHIP_TONES.length];
    const image =
      media[`category.${department.slug}.${category.slug}.main`] ||
      media[`category.${category.slug}.main`] ||
      category.imageUrl ||
      media["category-default"];

    const body = (
      <>
        <span className="relative">
          <span
            className={cn(
              "relative grid place-items-center overflow-hidden rounded-full border border-[var(--border)] transition-all duration-250 ease-out",
              compact ? "h-11 w-11" : "h-16 w-16 sm:h-[104px] sm:w-[104px]",
              isActive ? "scale-[1.08]" : "group-hover:-translate-y-[3px]",
              empty && "opacity-55"
            )}
            style={{
              background: `radial-gradient(120% 120% at 30% 20%, ${tone} 0%, ${toneDeep} 88%)`,
              boxShadow: isActive
                ? `0 0 0 3px ${department.accent}, 0 0 0 6px rgba(233,169,58,0.55)`
                : undefined,
              borderColor: isActive ? department.accent : undefined,
            }}
          >
            <JamdaniField
              id={`chip-${department.slug}-${category.slug}-${compact ? "s" : "f"}`}
              color="var(--color-saffron)"
              opacity={0.18}
              size={compact ? 16 : 26}
            />
            <ArtIconGlyph
              art={category.icon}
              className="relative h-[46%] w-[46%] text-ivory/90 transition-transform duration-500 group-hover:scale-110"
              strokeWidth={2.4}
            />
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={name}
                loading="lazy"
                className="absolute inset-0 h-full w-full rounded-full object-cover"
              />
            )}
            <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-ivory/10" />
          </span>
          {!compact && count > 0 && (
            <span className="sr-only">
              {count} {count === 1 ? "piece" : "pieces"}
            </span>
          )}
        </span>
        <span
          className={cn(
            "mt-2 text-center leading-tight transition-colors",
            compact ? "line-clamp-1 text-[0.55rem]" : "line-clamp-2 text-[0.72rem] sm:text-[0.76rem]",
            isActive ? "font-bold text-foreground" : "font-semibold text-foreground/75"
          )}
        >
          {name}
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-0.5 flex items-center gap-1 text-[0.5rem] uppercase tracking-[0.1em]",
              empty ? "text-muted-foreground/60" : "text-muted-foreground"
            )}
          >
            {empty ? "Soon" : count === 1 ? "1 piece" : `${count} pieces`}
            {isActive && <span className="h-1 w-1 rounded-full bg-gold" />}
          </span>
        )}
        {compact && isActive && <span className="mt-1 h-1 w-1 rounded-full bg-gold" />}
      </>
    );

    const common = {
      "data-chip": category.slug,
      "aria-current": isActive ? ("true" as const) : undefined,
      onKeyDown: moveFocus,
      title: empty ? `${name} · Soon` : `${name} · ${count} pieces`,
      className: cn(
        "group flex shrink-0 snap-center flex-col items-center rounded-lg text-center outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        compact ? "w-[64px]" : "w-[88px] sm:w-[132px]"
      ),
    };

    if (!interactive) {
      return (
        <div key={category.slug} aria-disabled="true" {...common}>
          {body}
        </div>
      );
    }

    if (mode === "links") {
      return (
        <Link
          key={category.slug}
          href={`/${department.slug}/${category.slug}`}
          {...common}
        >
          {body}
        </Link>
      );
    }

    return (
      <button
        key={category.slug}
        type="button"
        onClick={() => onSelect?.(category.slug)}
        {...common}
      >
        {body}
      </button>
    );
  };

  const departmentName = locale === "bn" ? department.nameBn : department.name;

  return (
    <nav
      aria-label={`${departmentName} categories`}
      className={cn("relative", className)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Browse {departmentName}
        </p>
        {mode === "scroll" && activeCategory && (
          <Link
            href={`/${department.slug}/${activeCategory.slug}`}
            className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-foreground/65 transition hover:text-gold-ink"
          >
            {t("common.viewAll")}{" "}
            {locale === "bn" ? activeCategory.nameBn : activeCategory.name}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div
        ref={(node) => {
          barRef.current = node;
          listRef.current = node;
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-4 pt-4 md:gap-3 md:px-5"
      >
        {showAll && (
          <Link
            href={`/${department.slug}`}
            aria-current={!activeSlug ? "true" : undefined}
            className="group flex w-[88px] shrink-0 snap-center flex-col items-center text-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:w-[132px]"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-foreground transition duration-250 group-hover:-translate-y-[3px] group-hover:border-gold sm:h-[104px] sm:w-[104px]">
              <Layers className="h-[38%] w-[38%] text-gold" />
            </span>
            <span className="mt-2 line-clamp-2 text-[0.72rem] font-semibold leading-tight sm:text-[0.76rem]">
              All {departmentName}
            </span>
            <span className="mt-0.5 text-[0.5rem] uppercase tracking-[0.1em] text-muted-foreground">
              Department
            </span>
          </Link>
        )}
        {categories.map((category) => renderChip(category))}
      </div>

      {stickyVisible && (
        <div className="fixed inset-x-0 top-[64px] z-40 border-y border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl lg:top-[76px]">
          <div
            ref={stickyRef}
            className="container-wide no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-4"
          >
            {categories.map((category) => renderChip(category, true))}
          </div>
        </div>
      )}
    </nav>
  );
}
