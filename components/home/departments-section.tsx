"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ArtIconGlyph } from "@/components/brand/product-art";
import { SectionHeading } from "@/components/storefront/section-heading";
import { departments, departmentProductCount } from "@/lib/data";
import { SECTION_COPY } from "@/lib/homepage";
import { useLocale } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";

export function DepartmentsSection() {
  const { locale } = useLocale();
  const { media } = useSiteConfig();
  const copy = SECTION_COPY.departments;

  return (
    <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <SectionHeading
        contentKey="departments"
          eyebrow={copy.eyebrow}
          title={copy.title}
          accent={copy.accent}
          description={copy.description}
          linkHref={copy.linkHref}
          linkLabel={copy.linkLabel}
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {departments.map((department) => {
            const count = departmentProductCount(department.slug);
            const image =
              media[`department.${department.slug}`] || media[`department-${department.slug}`];
            return (
              <Link
                key={department.slug}
                href={`/${department.slug}`}
                className="group flex min-h-[248px] flex-col rounded-[22px] border border-white/80 bg-[var(--color-surface)]/90 p-3.5 shadow-[0_20px_48px_-34px_rgba(36,26,80,0.38)] transition duration-500 hover:-translate-y-1 hover:border-[var(--color-border)] hover:shadow-[0_28px_58px_-34px_rgba(36,26,80,0.44)] sm:min-h-[268px] sm:p-4"
              >
                <div
                  className="relative flex h-24 items-center justify-center overflow-hidden rounded-[16px] sm:h-28"
                  style={{
                    background: `linear-gradient(145deg, ${department.accent}14 0%, ${department.accent}06 60%, var(--color-surface) 100%)`,
                  }}
                >
                  <span
                    className="pointer-events-none absolute -right-5 -top-7 h-24 w-24 rounded-full border"
                    style={{ borderColor: `${department.accent}24` }}
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full border"
                    style={{ borderColor: `${department.accent}18` }}
                    aria-hidden="true"
                  />
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={department.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-multiply transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <span
                      className="relative flex h-[58%] w-[58%] items-center justify-center"
                      style={{ color: department.accentDeep }}
                    >
                      <ArtIconGlyph
                        art={department.icon}
                        className="h-full w-full transition duration-500 group-hover:scale-[1.04]"
                        strokeWidth={1.7}
                      />
                    </span>
                  )}
                  <span
                    className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full border bg-white/75 text-[var(--color-ink)] backdrop-blur transition duration-300 group-hover:rotate-45 group-hover:bg-[var(--color-ink)] group-hover:text-ivory"
                    style={{ borderColor: `${department.accent}22` }}
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-1 pb-0.5 pt-3.5">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.12em]"
                    style={{ color: department.accentDeep }}
                  >
                    {count > 0
                      ? `${count} ${count === 1 ? "piece" : "pieces"}`
                      : "Coming soon"}
                  </p>
                  <h3 className="mt-1 font-display text-[1.45rem] leading-none text-[var(--color-ink)] sm:text-[1.6rem]">
                    {locale === "bn" ? department.nameBn : department.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
                    {department.tagline}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] transition group-hover:text-[var(--color-gold-ink)]">
                    Explore
                    <span className="h-px w-5 bg-current transition-all group-hover:w-8" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
