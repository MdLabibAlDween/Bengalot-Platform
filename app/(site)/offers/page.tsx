import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, TicketPercent } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { PageHero } from "@/components/storefront/page-hero";
import { CouponCard } from "@/components/storefront/coupon-card";
import { OfferCountdown } from "@/components/storefront/offer-countdown";
import { allOnSale } from "@/lib/data";
import { getDbProducts } from "@/lib/catalog-db";
import { couponAppliesToProduct } from "@/lib/coupons";
import { getActiveOffer, getLiveCoupons } from "@/lib/offers-db";
import { deliveryNotice } from "@/lib/settings";
import { SITE } from "@/lib/constants";
import { formatBDT } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Offers & campaigns",
  description:
    "Current Bengalot offers and private codes. See live coupons, minimum order values and delivery details.",
  alternates: { canonical: `${SITE.url}/offers` },
};

export default async function OffersPage() {
  const [activeOffer, liveCoupons, dbProducts] = await Promise.all([
    getActiveOffer(),
    getLiveCoupons(),
    getDbProducts(),
  ]);
  const campaign = activeOffer.campaign;
  const featuredCoupon = activeOffer.coupon ?? liveCoupons[0];
  const offerProducts = (dbProducts.length ? dbProducts : allOnSale)
    .filter(
      (product) =>
        !featuredCoupon || couponAppliesToProduct(featuredCoupon, product.slug)
    )
    .slice(0, 8);
  const couponValue = featuredCoupon
    ? featuredCoupon.type === "percent"
      ? `${featuredCoupon.value}% off`
      : featuredCoupon.type === "shipping"
        ? "Free delivery"
        : `${formatBDT(featuredCoupon.value)} off`
    : "";

  return (
    <>
      <PageHero
        eyebrow="Current offers"
        title={
          <>
            Offers <span className="italic text-gold-ink">&amp; codes.</span>
          </>
        }
        description="Use one code per order. Every amount, minimum spend and end date below comes from the live coupon record."
        accent="var(--color-magenta)"
        breadcrumbs={[{ label: "Offers" }]}
        art="perfume"
      >
        <div className="flex flex-wrap items-center gap-3">
          {featuredCoupon && (
            <span className="flex items-center gap-3 rounded-xl border border-dashed border-gold/50 bg-gold/[0.06] px-4 py-3">
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {couponValue}
              </span>
              <span className="font-mono text-base font-bold tracking-[0.08em] text-indigo">
                {featuredCoupon.code}
              </span>
            </span>
          )}
          <Link
            href="/collections/sale"
            className="cta-primary group flex h-11 items-center gap-2.5 rounded-full px-5 text-xs font-bold uppercase tracking-[0.12em]"
          >
            Shop the sale
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> {liveCoupons.length} live offers
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <TicketPercent className="h-3.5 w-3.5 text-gold" /> Applied at checkout
          </span>
        </div>

        {campaign?.endAt && (
          <div className="mt-5 max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {campaign.title} ends in
            </p>
            <OfferCountdown endsAt={campaign.endAt} />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {deliveryNotice()}
            </p>
          </div>
        )}
      </PageHero>

      <section className="container-luxe py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-3 text-indigo">
              <span className="h-px w-8 bg-saffron" /> The offers
            </p>
            <h2 className="display-3 mt-3">Live coupons.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Use one code per order. Codes cannot be combined, and some exclusions apply.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {liveCoupons.length} live offers
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {liveCoupons.map((coupon) => (
            <CouponCard key={coupon.code} coupon={coupon} />
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface-2)] py-14 md:py-20">
        <div className="container-luxe">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-indigo">On the shelf now</p>
              <h2 className="display-3 mt-3">Selected offers.</h2>
            </div>
            <Link
              href="/collections/sale"
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] transition hover:text-gold-ink"
            >
              View the full sale
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {offerProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          {offerProducts.length === 0 && (
            <p className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-muted-foreground">
              No products are attached to this code yet. The catalogue scope can be changed
              in Admin → Offers &amp; coupons.
            </p>
          )}
        </div>
      </section>

      <section className="container-luxe py-14">
        <div className="grid gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:grid-cols-3 md:p-8">
          {[
            {
              no: "01",
              title: "Add to bag",
              text: "Shop the pieces included in the current offer.",
            },
            {
              no: "02",
              title: "Enter the code",
              text: featuredCoupon
                ? `Apply ${featuredCoupon.code} in your bag or at checkout before paying.`
                : "Apply the coupon code at checkout.",
            },
            {
              no: "03",
              title: "We do the rest",
              text: "Checked, packed and delivered across Bangladesh.",
            },
          ].map((step) => (
            <div key={step.no} className="border-[var(--border)] md:border-l md:pl-6 md:first:border-l-0 md:first:pl-0">
              <span className="font-display text-sm text-gold-ink">{step.no}</span>
              <h3 className="mt-2 font-display text-xl">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Offers valid while stocks last. One code per order, cannot be combined with other
          promotions. For full terms, see our{" "}
          <Link href="/return-policy" className="underline underline-offset-2 hover:text-gold-ink">
            return policy
          </Link>
          .
        </p>
      </section>
    </>
  );
}
