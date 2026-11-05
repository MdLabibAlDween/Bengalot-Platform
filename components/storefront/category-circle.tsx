"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ArtIconGlyph } from "@/components/brand/product-art";
import { JamdaniField } from "@/components/brand/ornaments";
import { CircleScroller } from "@/components/storefront/circle-scroller";
import { countForCategory } from "@/lib/data";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { ArtIcon, Category, Department } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryCircle({
  category,
  department,
  active = false,
  idPrefix = "circle",
  icon,
  tone = "dark",
  fluid = false,
}: {
  category: Category;
  department: Department;
  active?: boolean;
  idPrefix?: string;
  icon?: ArtIcon;
  tone?: "dark" | "light";
  fluid?: boolean;
}) {
  const count = countForCategory(department.slug, category.slug);
  const light = tone === "light";
  const { media } = useSiteConfig();
  const image =
    category.imageUrl ||
    media[`category.${department.slug}.${category.slug}.main`] ||
    media[`category.${category.slug}.main`] ||
    media["category-default"];

  return (
    <Link
      href={`/${department.slug}/${category.slug}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex shrink-0 snap-start flex-col items-center text-center",
        fluid ? "w-full" : "w-[104px] sm:w-[112px]"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-full border p-[1px] shadow-[0_16px_36px_-26px_rgba(20,10,50,0.45)] transition-all duration-300 group-hover:-translate-y-1.5",
          fluid ? "aspect-square h-auto w-full max-w-[132px]" : "h-[104px] w-[104px] sm:h-[112px] sm:w-[112px]",
          active
            ? "border-gold shadow-[0_0_0_3px_rgba(233,169,58,0.15)]"
            : light
              ? "border-[var(--color-border)]"
              : "border-white/30"
        )}
      >
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full"
          style={{
            background: light
              ? `radial-gradient(120% 120% at 30% 20%, ${department.accent}16 0%, var(--color-surface) 88%)`
              : `radial-gradient(120% 120% at 30% 20%, ${department.accent} 0%, ${department.accentDeep} 85%)`,
          }}
        >
          <JamdaniField
            id={`${idPrefix}-${department.slug}-${category.slug}`}
            color={light ? department.accent : "var(--color-saffron)"}
            opacity={light ? 0.09 : 0.18}
            size={26}
          />
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={category.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full rounded-full object-cover"
            />
          ) : (
            <span
              className="relative h-[46%] w-[46%] transition-transform duration-500 group-hover:scale-110"
              style={{ color: light ? department.accentDeep : "var(--color-ivory)" }}
            >
              <ArtIconGlyph
                art={icon ?? category.icon}
                className="h-full w-full"
                strokeWidth={2.4}
              />
            </span>
          )}
          <span
            className={cn(
              "absolute inset-0 rounded-full ring-1 ring-inset",
              light ? "ring-[var(--color-ink)]/[0.03]" : "ring-ivory/10"
            )}
          />
        </div>
      </div>
      <span
        className={cn(
          "mt-2.5 text-xs font-semibold leading-tight transition",
          light ? "text-[var(--color-ink)] group-hover:text-indigo" : "text-foreground group-hover:text-gold",
          active && "text-indigo"
        )}
      >
        {category.name}
      </span>
      <span
        className={cn(
          "mt-0.5 flex items-center gap-1 text-xs uppercase tracking-[0.08em]",
          light ? "text-[var(--color-muted-foreground)]" : "text-muted-foreground"
        )}
      >
        {count > 0 ? `${count} ${count === 1 ? "piece" : "pieces"}` : "Coming soon"}
        {!active && count > 0 && (
          <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
        )}
        {active && <span className="h-1 w-1 rounded-full bg-gold" />}
      </span>
    </Link>
  );
}

export function CategoryCircleRail({
  categories,
  department,
  activeSlug,
  idPrefix = "circle",
  className,
}: {
  categories: Category[];
  department: Department;
  activeSlug?: string;
  idPrefix?: string;
  className?: string;
}) {
  return (
    <CircleScroller className={className}>
      {categories.map((category) => (
        <CategoryCircle
          key={category.slug}
          category={category}
          department={department}
          active={category.slug === activeSlug}
          idPrefix={idPrefix}
        />
      ))}
    </CircleScroller>
  );
}
