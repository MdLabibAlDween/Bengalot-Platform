"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductArt } from "@/components/brand/product-art";
import { JamdaniField, Sparkle } from "@/components/brand/ornaments";
import {
  categories,
  categoryProducts,
  countForCategory,
  departmentProductCount,
} from "@/lib/data";
import { useLocale } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { Department } from "@/lib/types";
import { cn, formatBDT } from "@/lib/utils";

function MenuPrice({ amount }: { amount: number }) {
  const formatted = formatBDT(amount);
  return (
    <span className="tabular-nums">
      <span
        lang="bn"
        style={{ fontFamily: "var(--font-hind), var(--font-jakarta), sans-serif" }}
        aria-label="Bangladeshi Taka"
      >
        ৳
      </span>
      {formatted.replace("৳", "")}
    </span>
  );
}

export function MegaMenu({
  department,
  activeCategorySlug,
  onNavigate,
}: {
  department: Department;
  activeCategorySlug?: string | null;
  onNavigate: () => void;
}) {
  const { locale } = useLocale();
  const { catalog } = useSiteConfig();
  const cats = useMemo(() => {
    const source = catalog?.loaded ? catalog.categories : categories;
    return source.filter((category) => category.department === department.slug);
  }, [catalog?.categories, department.slug]);
  const groups = useMemo(() => {
    const mapped = department.groups
      .map((group) => ({
        ...group,
        items: group.categories
          .map((slug) => cats.find((c) => c.slug === slug))
          .filter((c): c is NonNullable<typeof c> => Boolean(c)),
      }))
      .filter((group) => group.items.length > 0);
    const used = new Set(mapped.flatMap((group) => group.items.map((item) => item.slug)));
    const extra = cats.filter((category) => !used.has(category.slug));
    if (extra.length > 0) {
      mapped.push({
        title: "More",
        categories: extra.map((category) => category.slug),
        items: extra,
      });
    }
    return mapped;
  }, [cats, department.groups]);
  const firstCategory =
    groups.flatMap((g) => g.items).find((c) => countForCategory(department.slug, c.slug) > 0) ??
    groups[0]?.items[0];
  const [preview, setPreview] = useState(
    () =>
      (activeCategorySlug &&
      groups.flatMap((group) => group.items).some((category) => category.slug === activeCategorySlug)
        ? activeCategorySlug
        : firstCategory?.slug) ?? ""
  );
  useEffect(() => {
    if (activeCategorySlug) setPreview(activeCategorySlug);
  }, [activeCategorySlug]);
  const previewCategory = cats.find((category) => category.slug === preview) ?? firstCategory;
  const previewProducts = previewCategory
    ? categoryProducts(department.slug, previewCategory.slug).slice(0, 3)
    : [];
  const total = departmentProductCount(department.slug);
  const hasBundles = (catalog?.bundles ?? []).some(
    (bundle) => bundle.department === department.slug
  );
  const deptName = locale === "bn" ? department.nameBn : department.name;

  return (
    <div className="relative border-t border-[var(--border)] bg-[var(--surface)] shadow-[0_40px_100px_-30px_rgba(10,5,30,0.55)]">
      <JamdaniField
        id={`mega-bg-${department.slug}`}
        className="opacity-60"
        color={department.accent}
        opacity={0.05}
        size={48}
      />
      <div className="container-wide relative grid max-h-[calc(100vh-140px)] gap-8 overflow-y-auto py-4 lg:h-[386px] lg:grid-cols-[250px_1fr_420px] xl:grid-cols-[260px_1fr_500px] xl:gap-8">
        {/* Department identity */}
        <div
          className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[20px] p-6 text-ivory"
          style={{
            background: `linear-gradient(150deg, ${department.accentDeep} 0%, ${department.accent} 100%)`,
          }}
        >
          <JamdaniField
            id={`mega-dept-${department.slug}`}
            color="var(--color-saffron)"
            opacity={0.16}
            size={54}
          />
          <div className="relative">
            <div className="mb-5 flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.26em] text-ivory/60">
              <span className="h-px w-6 bg-gold" />
              Department
            </div>
            <h3 className="font-display text-[2.6rem] leading-none">{deptName}</h3>
            <p className="mt-3 max-w-[210px] text-[0.78rem] leading-relaxed text-ivory/70">
              {department.tagline}
            </p>
          </div>
          <div className="relative mt-8">
            <p className="mb-4 text-[0.66rem] uppercase tracking-[0.18em] text-ivory/50">
              {total > 0 ? `${total} ${total === 1 ? "piece" : "pieces"}` : "The collection is being prepared"}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${department.slug}`}
                onClick={onNavigate}
                className="cta-primary group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em]"
              >
                Shop all {deptName}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
              </Link>
              {hasBundles && (
                <Link
                  href={`/${department.slug}/bundles`}
                  onClick={onNavigate}
                  className="inline-flex items-center gap-1.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-ivory/65 transition hover:text-gold"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Bundles
                </Link>
              )}
            </div>
          </div>
          <Sparkle className="absolute right-5 top-5 opacity-70" size={20} />
        </div>

        {/* Category groups */}
        <div
          className={cn(
            "grid content-start gap-x-8 gap-y-7",
            groups.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 xl:grid-cols-3"
          )}
        >
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-[0.56rem] font-bold uppercase tracking-[0.24em] text-foreground/65">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((cat) => {
                  const isCurrent = activeCategorySlug === cat.slug;
                  const isPreview = previewCategory?.slug === cat.slug;
                  return (
                    <li key={cat.slug}>
                      <Link
                        href={`/${department.slug}/${cat.slug}`}
                        onMouseEnter={() => setPreview(cat.slug)}
                        onFocus={() => setPreview(cat.slug)}
                        onClick={onNavigate}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(
                          "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 -mx-3 text-[0.83rem] transition-all duration-200",
                          isCurrent
                            ? "bg-[var(--muted)] font-semibold text-foreground"
                            : isPreview
                              ? "bg-[var(--muted)]/60 text-foreground"
                              : "text-foreground/65 hover:bg-[var(--muted)] hover:text-foreground"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "h-1 w-1 rounded-full transition-all",
                              isCurrent || isPreview ? "w-4" : "bg-transparent"
                            )}
                            style={{
                              backgroundColor:
                                isCurrent || isPreview ? department.accent : undefined,
                            }}
                          />
                          <span className={cn((isCurrent || isPreview) && "font-semibold")}>
                            {locale === "bn" ? cat.nameBn : cat.name}
                          </span>
                        </span>
                        <ArrowRight
                          className={cn(
                            "h-3 w-3 shrink-0 -translate-x-1 opacity-0 transition-all",
                            (isCurrent || isPreview) && "translate-x-0 opacity-60"
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div className="relative">
          <p className="mb-3 flex items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.24em] text-foreground/65">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade" />
            Live preview
          </p>
          <AnimatePresence mode="wait">
            {previewCategory && (
              <motion.div
                key={previewCategory.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)]"
              >
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-gold">
                        The collection
                      </p>
                      <h4 className="mt-1 font-display text-xl leading-tight">
                        {locale === "bn" ? previewCategory.nameBn : previewCategory.name}
                      </h4>
                      <p className="mt-1 line-clamp-1 text-[0.66rem] text-muted-foreground">
                        {previewCategory.tagline}
                      </p>
                    </div>
                    <Link
                      href={`/${department.slug}/${previewCategory.slug}`}
                      onClick={onNavigate}
                      aria-label={`Shop ${previewCategory.name}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-foreground transition hover:border-gold hover:bg-gold hover:text-midnight"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {previewProducts.length > 0 ? (
                    <div className="flex gap-2.5">
                      {previewProducts.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/product/${p.slug}`}
                          onClick={onNavigate}
                          aria-label={`${p.name} — ${formatBDT(p.price)}`}
                          className="group w-[calc((100%-1.25rem)/3)] shrink-0"
                        >
                          <div className="relative aspect-[4/4.6] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] transition group-hover:border-gold">
                            <ProductArt
                              id={`mega-prod-${p.slug}`}
                              art={p.art}
                              palette={p.palette}
                              showCaption={false}
                              showMonogram={false}
                            />
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-midnight/75 via-transparent to-transparent p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                              <span className="text-[0.48rem] font-bold uppercase tracking-[0.12em] text-ivory">
                                View piece
                              </span>
                            </div>
                          </div>
                          <p className="mt-1.5 truncate text-[0.64rem] font-medium leading-tight transition group-hover:text-gold">
                            {p.name}
                          </p>
                          <p className="mt-0.5 text-[0.56rem] text-muted-foreground">
                            <MenuPrice amount={p.price} />
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[var(--border)] p-3 text-center">
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Coming soon
                      </p>
                      <p className="mt-1 text-[0.65rem] text-muted-foreground/80">
                        This collection is being prepared.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
