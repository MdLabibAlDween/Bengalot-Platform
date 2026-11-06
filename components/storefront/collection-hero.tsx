import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/storefront/page-hero";
import type { Product } from "@/lib/types";

export function CollectionHero({
  eyebrow,
  title,
  accent,
  description,
  palette,
  products,
  note,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  palette: [string, string];
  products: Product[];
  stats: { value: string; label: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  note?: string;
}) {
  const main = products[0];
  const label = `${title} ${accent}`.replace(/\.$/, "").replace(/\s+/g, " ").trim();

  return (
    <PageHero
      eyebrow={eyebrow}
      title={
        <>
          {title}{" "}
          <span className="italic text-gold-ink">{accent}</span>
        </>
      }
      description={description}
      accent={palette[1]}
      breadcrumbs={[{ label: "Collections", href: "/collections" }, { label }]}
      art={main?.art}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="#collection"
          className="cta-primary group flex h-11 items-center gap-2.5 rounded-full px-5 text-[0.62rem] font-bold uppercase tracking-[0.12em]"
        >
          Shop the collection
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/shop"
          className="cta-secondary flex h-11 items-center rounded-full px-5 text-[0.62rem] font-bold uppercase tracking-[0.12em]"
        >
          All departments
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {products.length > 0
            ? `${products.length} ${products.length === 1 ? "piece" : "pieces"}`
            : "Pieces coming soon"}
        </span>
      </div>
    </PageHero>
  );
}
