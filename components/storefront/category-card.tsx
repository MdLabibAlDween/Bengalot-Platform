import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ArtIconGlyph } from "@/components/brand/product-art";
import { JamdaniField } from "@/components/brand/ornaments";
import { countForCategory } from "@/lib/data";
import type { Category, Department } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryCard({
  category,
  department,
  className,
}: {
  category: Category;
  department: Department;
  className?: string;
}) {
  const count = countForCategory(department.slug, category.slug);
  return (
    <Link
      href={`/${department.slug}/${category.slug}`}
      className={cn(
        "group relative flex w-[168px] shrink-0 snap-start flex-col overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_24px_50px_-30px_rgba(30,20,70,0.4)] sm:w-[190px]",
        className
      )}
    >
      <div
        className="relative flex h-[112px] items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${department.accentDeep} 0%, ${department.accent} 100%)`,
        }}
      >
        <JamdaniField
          id={`catcard-${department.slug}-${category.slug}`}
          color="var(--color-saffron)"
          opacity={0.15}
          size={30}
        />
        <ArtIconGlyph
          art={category.icon}
          className="relative h-[58%] w-[58%] text-ivory/85 transition-transform duration-500 group-hover:scale-110"
          strokeWidth={2.3}
        />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-midnight/25 px-2 py-0.5 text-[0.46rem] font-bold uppercase tracking-[0.12em] text-ivory/60 backdrop-blur">
          {count > 0 ? `${count}` : "Soon"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="font-display text-[1.05rem] leading-tight transition-colors group-hover:text-gold-ink">
          {category.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-[0.62rem] text-muted-foreground">
          {category.tagline}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {count > 0 ? "Shop collection" : "Coming soon"}
          </span>
          <span className="grid h-6 w-6 place-items-center rounded-full border border-[var(--border)] transition group-hover:border-indigo group-hover:bg-indigo group-hover:text-ivory">
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
