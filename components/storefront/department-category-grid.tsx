"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { useDepartmentCategory } from "@/components/storefront/department-category-context";
import type { Category, Department, Product } from "@/lib/types";

export function DepartmentCategoryGrid({
  department,
  categories,
  products,
}: {
  department: Department;
  categories: Category[];
  products: Product[];
}) {
  const { setActiveCategory } = useDepartmentCategory();
  const populated = categories.filter((category) =>
    products.some((product) => product.category === category.slug)
  );
  const sectionKey = populated.map((category) => category.slug).join("|");

  useEffect(() => {
    const sections = populated
      .map((category) => document.getElementById(category.slug))
      .filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0) return;

    const onScroll = () => {
      if (window.scrollY < 170) {
        setActiveCategory(null);
        return;
      }
      const offset = 170;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offset) current = section.id;
      }
      setActiveCategory(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey, setActiveCategory]);

  if (populated.length === 0) return null;

  return (
    <div>
      {populated.map((category) => {
        const items = products
          .filter((product) => product.category === category.slug)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
          .slice(0, 4);

        return (
          <section
            key={category.slug}
            id={category.slug}
            data-category-section
            className="scroll-mt-32 border-b border-[var(--border)] py-9 md:py-12"
          >
            <div className="container-luxe">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {category.tagline}
                  </p>
                  <h2 className="mt-1.5 font-display text-[1.9rem] leading-none sm:text-[2.25rem]">
                    {category.name}
                  </h2>
                  <p className="mt-1.5 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    {items.length} {items.length === 1 ? "piece" : "pieces"}
                  </p>
                </div>
                <Link
                  href={`/${department.slug}/${category.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition hover:border-indigo hover:bg-indigo hover:text-ivory"
                >
                  View all {category.name}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <ProductGrid>
                {items.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </ProductGrid>
            </div>
          </section>
        );
      })}
    </div>
  );
}
