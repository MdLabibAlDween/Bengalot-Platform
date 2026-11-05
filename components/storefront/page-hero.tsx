import type { ReactNode } from "react";
import { ArtIconGlyph } from "@/components/brand/product-art";
import { JamdaniField } from "@/components/brand/ornaments";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import type { ArtIcon } from "@/lib/types";

export function PageHero({
  eyebrow,
  title,
  description,
  accent = "var(--color-indigo)",
  breadcrumbs,
  art,
  imageUrl,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  accent?: string;
  breadcrumbs: { label: string; href?: string }[];
  art?: ArtIcon;
  imageUrl?: string;
  children?: ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden border-b border-[var(--border)]"
      style={{
        background: `linear-gradient(120deg, var(--background) 0%, color-mix(in srgb, ${accent} 7%, transparent) 55%, var(--surface-2) 100%)`,
      }}
    >
      <JamdaniField id="page-hero-pattern" color={accent} opacity={0.08} size={58} />
      <div
        className="pointer-events-none absolute -right-24 -top-20 h-[280px] w-[280px] rounded-full blur-[90px]"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}
        aria-hidden="true"
      />
      <div className="container-luxe relative py-7 md:py-10">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-4 grid items-center gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            {eyebrow && (
              <p
                className="eyebrow flex items-center gap-3 text-indigo"
              >
                <span className="h-px w-7 bg-saffron" />
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 line-clamp-2 max-w-3xl font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.02]">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-[0.86rem] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
            {children && <div className="mt-5">{children}</div>}
          </div>

          {(art || imageUrl) && (
            <div
              className="relative hidden h-[150px] w-[130px] shrink-0 items-center justify-center overflow-hidden rounded-t-[999px] border border-[var(--border)] sm:flex lg:h-[180px] lg:w-[155px]"
              style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${accent} 12%, transparent) 0%, color-mix(in srgb, ${accent} 4%, transparent) 100%)`,
              }}
              aria-hidden="true"
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              ) : art ? (
                <ArtIconGlyph art={art} className="h-[46%] w-[46%]" strokeWidth={1.6} />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
