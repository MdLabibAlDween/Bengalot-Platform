import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BundleCard } from "@/components/bundle/bundle-card";
import { ProductComingSoon } from "@/components/storefront/product-coming-soon";
import { ProductGrid } from "@/components/storefront/product-grid";
import { SectionHeading } from "@/components/storefront/section-heading";
import { getStoreBundles } from "@/lib/taxonomy-db";
import { departments } from "@/lib/data";
import { SECTION_COPY } from "@/lib/homepage";

export async function FeaturedBundles() {
  const bundles = (await getStoreBundles()).slice(0, 3);
  const copy = SECTION_COPY.bundles;

  if (bundles.length === 0) {
    return (
      <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
        <div className="container-luxe">
          <SectionHeading
            contentKey="bundles"
            eyebrow={copy.eyebrow}
            title={copy.title}
            accent={copy.accent}
            description={copy.description}
            linkHref="/shop"
            linkLabel="Browse departments"
          />
          <ProductComingSoon
            className="mt-7"
            title="Complete outfits are being prepared."
            description="Bundles will appear here once the first real pieces are published. Every department is still open to explore in the meantime."
            actionHref="/shop"
            actionLabel="Explore the departments"
          />
        </div>
      </section>
    );
  }

  const bundleDepartments = departments.filter((department) =>
    bundles.some((bundle) => bundle.department === department.slug)
  );

  return (
    <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <SectionHeading
        contentKey="bundles"
          eyebrow={copy.eyebrow}
          title={copy.title}
          accent={copy.accent}
          description={copy.description}
          linkHref="/shop"
          linkLabel="Shop all"
        />

        <ProductGrid className="mt-8">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.slug} bundle={bundle} />
          ))}
        </ProductGrid>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-x-5 gap-y-2 border-t border-[var(--color-border)] pt-5">
          {bundleDepartments.map((department) => (
            <Link
              key={department.slug}
              href={`/${department.slug}/bundles`}
              className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.11em] text-[var(--color-muted-foreground)] transition hover:text-[var(--color-gold-ink)]"
            >
              {department.name} outfits
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:rotate-45" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
