import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Banknote, Layers, Truck } from "lucide-react";
import { DepartmentArt } from "@/components/brand/product-art";
import { JamdaniField, SealStamp, Sparkle } from "@/components/brand/ornaments";
import { BundleCard } from "@/components/bundle/bundle-card";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { DepartmentCategoryGrid } from "@/components/storefront/department-category-grid";
import { DepartmentCategoryProvider } from "@/components/storefront/department-category-context";
import { DepartmentCategoryStrip } from "@/components/storefront/department-category-strip";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getStoreBundles, getStoreCategories } from "@/lib/taxonomy-db";
import {
  departments,
  getDepartment,
  productsFor,
} from "@/lib/data";
import { SITE } from "@/lib/constants";
import { STORE_SETTINGS } from "@/lib/settings";
import { getDbProducts } from "@/lib/catalog-db";

export function generateStaticParams() {
  return departments.map((department) => ({ department: department.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string }>;
}): Promise<Metadata> {
  const { department: slug } = await params;
  const department = getDepartment(slug);
  if (!department) return { title: "Department not found" };
  return {
    title: `${department.name} — ${department.tagline}`,
    description: department.description,
    alternates: { canonical: `${SITE.url}/${department.slug}` },
    openGraph: {
      title: `${department.name} · Bengalot`,
      description: department.description,
      url: `${SITE.url}/${department.slug}`,
    },
  };
}

function deliveryLine() {
  const cod = STORE_SETTINGS.codEnabled ? " · Cash on Delivery" : "";
  return `Delivery ৳${STORE_SETTINGS.deliveryInside} inside Faridpur · ৳${STORE_SETTINGS.deliveryOutside} outside${cod}`;
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const { department: slug } = await params;
  const department = getDepartment(slug);
  if (!department) notFound();

  const allCategories = await getStoreCategories(department.slug);
  const dbProducts = await getDbProducts(department.slug);
  const allProducts = [
    ...dbProducts,
    ...productsFor(department.slug).filter(
      (product) => !dbProducts.some((item) => item.slug === product.slug)
    ),
  ];
  const total = allProducts.length;
  const empty = allCategories.filter(
    (category) => !allProducts.some((product) => product.category === category.slug)
  );
  const newest = (items: typeof allProducts) =>
    [...items].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const newIn = newest(
    allProducts.filter((product) => product.sets.includes("new") || product.badge === "New")
  ).slice(0, 4);
  const best = newest(allProducts.filter((product) => product.sets.includes("best"))).slice(
    0,
    4
  );
  const departmentBundles = await getStoreBundles(department.slug);

  return (
    <>
      {/* Themed department hero */}
      <section
        className="relative overflow-hidden text-ivory"
        style={{
          background: `linear-gradient(140deg, ${department.accentDeep} 0%, ${department.accent} 115%)`,
        }}
      >
        <JamdaniField
          id={`dept-hero-${department.slug}`}
          color="var(--color-saffron)"
          opacity={0.14}
          size={72}
        />
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-ivory/10 blur-[110px]" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-[360px] w-[360px] rounded-full bg-gold/10 blur-[100px]" />

        <div className="container-luxe relative grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          <div>
            <Breadcrumbs items={[{ label: department.name }]} light />
            <p className="eyebrow mt-7 flex items-center gap-3 text-indigo">
              <span className="h-px w-8 bg-gold" /> The {department.name} department
            </p>
            <h1 className="display-1 mt-4 text-ivory">{department.name}</h1>
            <p className="mt-4 max-w-md font-display text-2xl italic leading-snug text-gold/90">
              {department.tagline}
            </p>
            <p className="mt-5 max-w-lg text-[0.86rem] leading-relaxed text-ivory/75">
              {department.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#categories"
                className="group flex h-12 items-center gap-3 rounded-full bg-ivory px-6 text-xs font-bold uppercase tracking-[0.16em] text-midnight transition hover:bg-gold"
              >
                Shop the department
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ivory/10 pt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/65">
              <span className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-gold" /> {total}{" "}
                {total === 1 ? "piece" : "pieces"} · {allCategories.length}{" "}
                {allCategories.length === 1 ? "category" : "categories"}
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-gold" /> Delivery across Bangladesh
              </span>
              {STORE_SETTINGS.codEnabled && (
                <span className="flex items-center gap-2">
                  <Banknote className="h-3.5 w-3.5 text-gold" /> Cash on Delivery
                </span>
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="relative overflow-hidden rounded-[200px_200px_24px_24px] border border-gold/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
              <div className="aspect-[4/5]">
                <DepartmentArt
                  id={`dept-hero-art-${department.slug}`}
                  art={department.icon}
                  palette={department.heroPalette}
                  word={department.name.slice(0, 1)}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
                    {department.editorial}
                  </p>
                  <p className="mt-1 font-display text-2xl text-ivory">
                    {allCategories.length - empty.length} categories
                  </p>
                </div>
                <span className="rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ivory/80 backdrop-blur">
                  Saltha · Faridpur
                </span>
              </div>
            </div>
            <SealStamp
              size={104}
              className="stamp-spin absolute -left-5 bottom-20 opacity-70"
              text={`BENGALOT · ${department.name.toUpperCase()} · SALTHA · FARIDPUR · `}
            />
            <Sparkle className="absolute -right-2 top-10 opacity-70" size={18} />
          </div>
        </div>
      </section>

      {/* Category chips + filtered category grid */}
      <DepartmentCategoryProvider
        deptSlug={department.slug}
        categories={allCategories}
      >
        <section id="categories" className="scroll-mt-24 border-b border-[var(--border)] py-5">
          <div className="container-luxe">
            <DepartmentCategoryStrip
              department={department}
              categories={allCategories}
            />
          </div>
        </section>

      {newIn.length > 0 && (
        <section className="border-b border-[var(--border)] py-10 md:py-12">
          <div className="container-luxe">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-indigo">Just landed</p>
                <h2 className="mt-2 font-display text-[1.9rem] leading-none sm:text-[2.25rem]">
                  New in {department.name}
                </h2>
              </div>
              <Link
                href={`/${department.slug}#categories`}
                className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-gold"
              >
                View all {department.name} <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <ProductGrid>
              {newIn.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}

      {best.length > 0 && (
        <section className="border-b border-[var(--border)] py-10 md:py-12">
          <div className="container-luxe">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-indigo">More from the department</p>
                <h2 className="mt-2 font-display text-[1.9rem] leading-none sm:text-[2.25rem]">
                  Selected pieces in {department.name}
                </h2>
              </div>
              <Link
                href={`/${department.slug}#categories`}
                className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-gold"
              >
                View all {department.name} <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <ProductGrid>
              {best.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}

      {departmentBundles.length > 0 && (
        <section className="border-b border-[var(--border)] py-10 md:py-12">
          <div className="container-luxe">
            <div className="mb-5">
              <p className="eyebrow text-indigo">Complete outfits</p>
              <h2 className="mt-2 font-display text-[1.9rem] leading-none sm:text-[2.25rem]">
                Bundles, styled for you.
              </h2>
              <p className="mt-2 max-w-lg text-[0.74rem] leading-relaxed text-muted-foreground">
                Choose a size and color for every piece and save on the set.
              </p>
            </div>
            <ProductGrid>
              {departmentBundles.map((bundle) => (
                <BundleCard key={bundle.slug} bundle={bundle} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}

      <DepartmentCategoryGrid
        department={department}
        categories={allCategories}
        products={allProducts}
      />

      </DepartmentCategoryProvider>

      {empty.length > 0 && (
        <section className="container-luxe border-b border-[var(--border)] py-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="mr-1 text-[0.56rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Coming soon
            </p>
            {empty.map((category) => (
              <Link
                key={category.slug}
                href={`/${department.slug}/${category.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--line-strong)] px-3 py-1.5 text-[0.66rem] text-muted-foreground transition hover:border-gold hover:text-foreground"
              >
                {category.name}
                <span className="text-[0.5rem] uppercase tracking-[0.12em] text-gold/80">
                  Soon
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Real delivery strip only */}
      <section className="bg-[var(--surface-2)] py-6">
        <div className="container-luxe flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-gold" />
            {deliveryLine()}
          </p>
          <Link
            href="/shipping-policy"
            className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-foreground/65 transition hover:text-gold"
          >
            Delivery details <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </>
  );
}
