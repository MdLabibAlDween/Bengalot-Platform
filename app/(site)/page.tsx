import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { DepartmentsSection } from "@/components/home/departments-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FeaturedBundles } from "@/components/home/featured-bundles";
import { CategoryCircles } from "@/components/home/category-circles";
import { LookbookSection } from "@/components/home/lookbook-section";
import { GiftCardSection } from "@/components/home/gift-card-section";
import { ReelsSection } from "@/components/home/reels-section";
import { OfferBanner } from "@/components/home/offer-banner";
import { WhyBengalot } from "@/components/home/why-bengalot";
import { HouseOfFashion } from "@/components/home/house-of-fashion";
import { ReviewsCarousel } from "@/components/home/reviews-carousel";
import { SocialStrip } from "@/components/home/social-strip";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import {
  getHomeSections,
  isDemoProductVisible,
  type OfferCampaign,
} from "@/lib/homepage";
import { getActiveOffer } from "@/lib/offers-db";
import { getFeatureFlags, getGiftCardSettings, getHomepageControl, getMediaMap } from "@/lib/admin/settings";
import { getSiteContent } from "@/lib/site-content";
import { safeJsonLd } from "@/lib/utils";
import { getStoreCatalogue } from "@/lib/catalog-db";
import type { HeroSlide, SectionCopy } from "@/lib/homepage";
import type { Coupon, Product, Reel } from "@/lib/types";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Bengalot — Premium Fashion from Bengal",
  description:
    "Heirloom-inspired fashion from Bangladesh. Jamdani sarees, panjabis, kurtis, leather footwear, jute bags and accessories. Cash on delivery across Bangladesh.",
  alternates: { canonical: SITE.url },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      email: SITE.email,
      description: SITE.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Saltha",
        addressRegion: "Faridpur",
        addressCountry: "BD",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: `+${SITE.whatsappIntl}`,
        contactType: "customer support",
        areaServed: "BD",
        availableLanguage: ["English", "Bengali"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      publisher: { "@id": `${SITE.url}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

function Section({
  section,
  campaign,
  offerCoupon,
  reels,
  giftCardMode,
  giftCardImage,
  heroSlides,
  giftCardCopy,
  featured,
}: {
  section: { key: string; label: string; enabled: boolean; sort: number };
  campaign?: OfferCampaign;
  offerCoupon?: Coupon;
  reels?: Reel[];
  giftCardMode?: "physical" | "virtual";
  giftCardImage?: string;
  heroSlides?: HeroSlide[];
  giftCardCopy?: SectionCopy;
  featured?: Product[];
}) {
  switch (section.key) {
    case "hero":
      return <Hero slides={heroSlides} catalogue={featured} />;
    case "trust":
      return <TrustStrip />;
    case "departments":
      return <DepartmentsSection />;
    case "products":
      return <FeaturedProducts items={featured} />;
    case "bundles":
      return <FeaturedBundles />;
    case "categories":
      return <CategoryCircles />;
    case "collections":
      return <LookbookSection />;
    case "offer":
      return <OfferBanner campaign={campaign} coupon={offerCoupon} />;
    case "giftcards":
      return (
        <GiftCardSection
          mode={giftCardMode}
          copy={giftCardCopy}
          imageUrl={giftCardImage}
        />
      );
    case "why":
      return <WhyBengalot />;
    case "story":
      return <HouseOfFashion />;
    case "reviews":
      return <ReviewsCarousel />;
    case "reels":
      return <ReelsSection items={reels} />;
    case "social":
      return <SocialStrip />;
    case "newsletter":
      return <NewsletterSection />;
    case "recentlyViewed":
      return <RecentlyViewed />;
    default:
      return null;
  }
}

export default async function HomePage() {
  const [features, control, giftSettings, content, catalogue, activeOffer, media] = await Promise.all([
    getFeatureFlags(),
    getHomepageControl(),
    getGiftCardSettings(),
    getSiteContent(),
    getStoreCatalogue(),
    getActiveOffer(),
    getMediaMap(),
  ]);
  const base = getHomeSections().filter((section) => section.key !== "announcement");
  const candidate =
    control.sections.length > 0
      ? control.sections
          .filter((section) => section.enabled && base.some((item) => item.key === section.key))
          .sort((a, b) => a.sort - b.sort)
      : base.filter((section) => section.enabled);
  const featureAllowed = (key: string) => {
    if (key === "giftcards") return features.giftCards;
    if (key === "reels") return features.reels;
    if (key === "collections") return features.lookbook;
    if (key === "offer") return features.offers;
    if (key === "reviews") return features.reviews;
    if (key === "newsletter") return features.newsletter;
    return true;
  };
  const sections = candidate.filter((section) => featureAllowed(section.key));
  const campaign = activeOffer.campaign;
  const offerCoupon = activeOffer.coupon;
  const heroSlides = content.home.heroSlides.filter((slide) =>
    isDemoProductVisible(slide.isDemo)
  );

  return (
    <div className="home-light">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {sections.map((section) => (
        <Section
          key={section.key}
          section={section}
          campaign={campaign}
          offerCoupon={offerCoupon}
          reels={control.reels as Reel[]}
          giftCardMode={giftSettings.mode}
          giftCardImage={media["gift-card-art"]}
          giftCardCopy={content.home.sections.giftcards}
          heroSlides={heroSlides}
          featured={catalogue}
        />
      ))}
    </div>
  );
}
