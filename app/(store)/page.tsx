import { BrandStory } from "@/components/home/brand-story";
import { CategoryBento } from "@/components/home/category-bento";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FlashcardFeature } from "@/components/home/flashcard-feature";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { JournalTeaser } from "@/components/home/journal-teaser";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { PromotionSection } from "@/components/home/promotions";
import { Testimonials } from "@/components/home/testimonials";
import { getCatalog } from "@/lib/data/catalog";

export default async function HomePage() {
  const catalog = await getCatalog();
  const vocabularyCards =
    catalog.products.find((product) => product.slug === "english-vocabulary-cards") ??
    catalog.products.find((product) => product.category_slug === "study-cards") ??
    catalog.products[0];

  return (
    <>
      <Hero />
      <MarqueeStrip />
      <CategoryBento
        categories={catalog.categories}
        products={catalog.products}
      />
      <FeaturedProducts products={catalog.products} />
      <BrandStory />
      {vocabularyCards ? (
        <FlashcardFeature product={vocabularyCards} />
      ) : null}
      <HowItWorks />
      <PromotionSection
        promotions={catalog.promotions}
        products={catalog.products}
      />
      <Testimonials reviews={catalog.reviews} products={catalog.products} />
      <JournalTeaser />
    </>
  );
}
