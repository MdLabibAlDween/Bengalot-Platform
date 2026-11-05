import { CategoryCircle } from "@/components/storefront/category-circle";
import { SectionHeading } from "@/components/storefront/section-heading";
import { getStoreCategories } from "@/lib/taxonomy-db";
import { countForCategory, getDepartment } from "@/lib/data";
import { getFeaturedCategories, SECTION_COPY } from "@/lib/homepage";
import { STORE_SETTINGS } from "@/lib/settings";

export async function CategoryCircles() {
  const copy = SECTION_COPY.categories;
  const storeCategories = await getStoreCategories();
  const items = getFeaturedCategories()
    .map((featured) => {
      const category = storeCategories.find(
        (item) => item.department === featured.department && item.slug === featured.slug
      );
      const department = getDepartment(featured.department);
      if (!category || !department) return null;
      const count = countForCategory(category.department, category.slug);
      if (count === 0 && !STORE_SETTINGS.showComingSoonCategories) return null;
      return { category, department, icon: featured.icon };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) return null;

  return (
    <section className="bg-[var(--color-ivory)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <SectionHeading
        contentKey="categories"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          linkHref={copy.linkHref}
          linkLabel={copy.linkLabel}
        />

        <div className="mt-8 grid grid-cols-4 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-8">
          {items.map(({ category, department, icon }) => (
            <div key={`${department.slug}-${category.slug}`} className="flex justify-center">
              <CategoryCircle
                category={category}
                department={department}
                icon={icon}
                tone="light"
                fluid
                idPrefix="home-circle"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
