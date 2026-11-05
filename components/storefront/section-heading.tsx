"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSiteConfig } from "@/lib/site-config-provider";
import { cn } from "@/lib/utils";

function titleWithAccent(title: React.ReactNode, accent: string | undefined, light: boolean) {
  if (!accent || typeof title !== "string") return title;
  const index = title.indexOf(accent);
  if (index < 0) return title;
  return (
    <>
      {title.slice(0, index)}
      <span className={cn("italic", light ? "text-saffron" : "text-gold-ink")}>{accent}</span>
      {title.slice(index + accent.length)}
    </>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  linkHref,
  linkLabel,
  align = "left",
  light = false,
  className,
  contentKey,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  accent?: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
  contentKey?: string;
}) {
  const { content } = useSiteConfig();
  const homeSections = (content?.home as { sections?: Record<string, { eyebrow?: string; title?: string; accent?: string; description?: string; linkLabel?: string; linkHref?: string }> } | undefined)?.sections;
  const override = contentKey ? homeSections?.[contentKey] : undefined;
  const finalEyebrow = override?.eyebrow ?? eyebrow;
  const finalTitle = override?.title ?? title;
  const finalAccent = override?.accent ?? accent;
  const finalDescription = override?.description ?? description;
  const finalLinkHref = override?.linkHref ?? linkHref;
  const finalLinkLabel = override?.linkLabel ?? linkLabel;

  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {finalEyebrow && (
          <div
            className={cn(
              "mb-3 flex items-center gap-3",
              align === "center" && "justify-center"
            )}
          >
            <span className="h-px w-7 bg-saffron" />
            <p
              className={cn(
                "eyebrow",
                light ? "text-saffron" : "text-indigo"
              )}
            >
              {eyebrow}
            </p>
          </div>
        )}
        <h2
          className={cn(
            "display-2 text-balance text-[clamp(2rem,4vw,3.6rem)]",
            light ? "text-ivory" : "text-foreground"
          )}
        >
          {titleWithAccent(finalTitle, finalAccent, light)}
        </h2>
        {finalDescription && (
          <p
            className={cn(
              "mt-3 max-w-xl text-sm leading-relaxed",
              light ? "text-ivory/70" : "text-muted-foreground",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {finalLinkHref && finalLinkLabel && (
        <Link
          href={finalLinkHref}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors",
            light ? "text-ivory hover:text-gold" : "text-foreground hover:text-[var(--color-gold-ink)] "
          )}
        >
          <span className="link-underline">{finalLinkLabel}</span>
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 group-hover:rotate-45",
              light
                ? "border-ivory/25 group-hover:border-saffron group-hover:bg-saffron group-hover:text-ink"
                : "border-[var(--color-border)] group-hover:border-indigo group-hover:bg-indigo group-hover:text-ivory"
            )}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}
    </div>
  );
}
