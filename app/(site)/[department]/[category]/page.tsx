import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArtIconGlyph } from "@/components/brand/product-art";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { CategoryCatalog } from "@/components/storefront/category-catalog";
import { CategoryChipBar } from "@/components/storefront/category-chip-bar";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";
import {
  categories,
  categoryProducts,
  getDepartment,
  productsFor,
} from "@/lib/data";
import { getStoreCategories, getStoreCategory } from "@/lib/taxonomy-db";
import { SITE } from "@/lib/constants";
import { getDbProducts } from "@/lib/catalog-db";

export function generateStaticParams() {
  return categories.map((category) => ({
    department: category.department,
    category: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string; category: string }>;
}): Promise<Metadata> {
  const { department: deptSlug, category: catSlug } = await params;
  const department = getDepartment(deptSlug);
  const category = await getStoreCategory(deptSlug, catSlug);
  if (!department || !category) return { title: "Category not found" };
  return {
    title: `${category.name} for ${department.name} — ${category.tagline}`,
    description: `Shop ${category.name.toLowerCase()} at Bengalot. ${category.tagline}`,
    alternates: {
      canonical: `${SITE.url}/${department.slug}/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} · ${department.name} · Bengalot`,
      description: category.tagline,
      url: `${SITE.url}/${department.slug}/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ department: string; category: string }>;
}) {
  const { department: deptSlug, category: catSlug } = await params;
  const department = getDepartment(deptSlug);
  const category = await getStoreCategory(deptSlug, catSlug);
  if (!department || !category) notFound();

  const dbProducts = await getDbProducts(department.slug, category.slug);
  const items = [
    ...dbProducts,
    ...categoryProducts(department.slug, category.slug).filter(
      (product) => !dbProducts.some((item) => item.slug === product.slug)
    ),
  ];
  const siblings = await getStoreCategories(department.slug);
  const moreFromDepartment = [...productsFor(department.slug), ...(await getDbProducts(department.slug))]
    .filter((product) => product.category !== category.slug)
    .filter((product, index, array) => array.findIndex((item) => item.slug === product.slug) === index)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);

  return (
    <>
      <section
        className="relative overflow-hidden border-b border-[var(--border)]"
        style={{
          background: `linear-gradient(120deg, var(--background) 0%, ${department.accent}0F 55%, var(--surface-2) 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-24 top-0 h-[260px] w-[260px] rounded-full blur-[90px]"
          style={{ backgroundColor: `${department.accent}14` }}
          aria-hidden="true"
        />
        <div className="container-luxe relative py-5 md:py-7">
          <Breadcrumbs
            items={[
              { label: department.name, href: `/${department.slug}` },
              { label: category.name },
            ]}
            accentColor={department.accent}
          />

          <div className="mt-4 grid items-center gap-6 sm:grid-cols-[1fr_135px] lg:grid-cols-[1fr_160px]">
            <div>
              <Link
                href={`/${department.slug}`}
                className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.16em] transition hover:text-gold"
                style={{ color: department.accent }}
              >
                <ArrowLeft className="h-3 w-3" />
                All {department.name}
              </Link>
              <h1 className="mt-2 font-display text-[clamp(2.3rem,4.8vw,4rem)] leading-[0.98]">
                {category.name}
              </h1>
              <p className="mt-2 max-w-xl text-[0.8rem] leading-relaxed text-muted-foreground sm:text-[0.84rem]">
                {category.tagline}
              </p>
              <p className="mt-3 text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {items.length} {items.length === 1 ? "piece" : "pieces"}
              </p>
            </div>
            <div className="relative mx-auto hidden w-[130px] sm:block lg:w-[150px]">
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] border border-[var(--border)]"
                style={{
                  background: `linear-gradient(160deg, ${department.accent}22 0%, ${department.accent}06 100%)`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArtIconGlyph
                    art={category.icon}
                    className="h-[50%] w-[50%]"
                    strokeWidth={1.4}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <CategoryChipBar
              department={department}
              categories={siblings}
              activeSlug={category.slug}
              mode="links"
              showAll
            />
          </div>
        </div>
      </section>

      {items.length > 0 ? (
        <section className="container-luxe py-10 md:py-14">
          <CategoryCatalog products={items} />
        </section>
      ) : (
        <section className="container-luxe py-12 md:py-16">
          <div className="rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-10 text-center">
            <p className="eyebrow text-indigo">Coming soon</p>
            <h2 className="mt-3 font-display text-2xl">
              {category.name} is being prepared.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[0.78rem] leading-relaxed text-muted-foreground">
              Explore the rest of {department.name} in the meantime.
            </p>
            <Link
              href={`/${department.slug}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ivory transition hover:bg-gold hover:text-midnight"
            >
              All {department.name} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {moreFromDepartment.length > 0 && (
        <section className="border-t border-[var(--border)] py-12 md:py-16">
          <div className="container-luxe">
            <SectionHeading
              eyebrow={`More from ${department.name}`}
              title={
                <>
                  Keep <span className="italic text-gold">exploring.</span>
                </>
              }
              description={`Other pieces from ${department.name}.`}
              linkHref={`/${department.slug}`}
              linkLabel={`Shop all ${department.name}`}
            />
            <ProductGrid className="mt-7">
              {moreFromDepartment.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}
    </>
  );
}
