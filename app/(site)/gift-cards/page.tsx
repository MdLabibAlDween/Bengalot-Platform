import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Gift, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { PageHero } from "@/components/storefront/page-hero";
import { GiftCardStudio } from "@/components/gift-cards/gift-card-studio";
import { GiftCardBalance } from "@/components/gift-cards/gift-card-balance";
import { getFeatureFlags, getGiftCardSettings, getPageVisibility } from "@/lib/admin/settings";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Gift cards",
  description:
    "Give a Bengalot gift card by WhatsApp or email. Choose an amount, add a note and let them choose their own pieces.",
  alternates: { canonical: `${SITE.url}/gift-cards` },
};

export const dynamic = "force-dynamic";

const steps = [
  {
    icon: Gift,
    title: "Choose the value",
    text: "Pick a denomination or enter a custom amount between ৳500 and ৳50,000.",
  },
  {
    icon: Mail,
    title: "Request it their way",
    text: "Send us the recipient details. We confirm payment and delivery by WhatsApp or email.",
  },
  {
    icon: Sparkles,
    title: "They choose",
    text: "Once issued, the code is redeemed at checkout across the whole collection.",
  },
];

export default async function GiftCardsPage() {
  const [features, settings, pages] = await Promise.all([
    getFeatureFlags(),
    getGiftCardSettings(),
    getPageVisibility(),
  ]);
  if (!features.giftCards || !settings.enabled || pages["/gift-cards"] === false) notFound();

  return (
    <>
      <PageHero
        eyebrow="The gift of choice"
        title={
          <>
            Give the <span className="italic text-gold-ink">whole house.</span>
          </>
        }
        description="A Bengalot gift card lets them choose the piece that feels like theirs — request one, pay securely with our team, and receive the code by WhatsApp or email."
        accent="var(--color-magenta)"
        breadcrumbs={[{ label: "Gift cards" }]}
        art="jewelry"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="#buy"
            className="cta-primary group flex h-11 items-center gap-2.5 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
          >
            Request a gift card
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#balance"
            className="cta-secondary flex h-11 items-center rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
          >
            Check balance
          </Link>
          <span className="flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted-foreground)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-jade)]" />
            Issued after payment · one year validity
          </span>
        </div>
      </PageHero>

      <section id="buy" className="scroll-mt-28 py-12 md:py-16 lg:py-20">
        <div className="container-luxe">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow text-indigo">Create a gift card</p>
            <h2 className="display-2 mt-3">
              A little more <span className="italic text-gold-ink">personal.</span>
            </h2>
            <p className="mt-3 text-[0.84rem] leading-relaxed text-muted-foreground">
              Choose the amount, add their name and write a note. The card is created
              instantly and can be sent by WhatsApp or email.
            </p>
          </div>
          <GiftCardStudio settings={settings} />
        </div>
      </section>

      <GiftCardBalance />

      <section className="container-luxe py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-indigo-tint)] text-indigo">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-display text-sm text-gold-ink">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl">{step.title}</h3>
                <p className="mt-1.5 text-[0.76rem] leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-sand)] p-6 md:grid-cols-[0.8fr_1.2fr] md:p-8">
          <div>
            <p className="eyebrow text-indigo">The small print</p>
            <h2 className="font-display text-[2rem] leading-none">Good to know.</h2>
          </div>
          <ul className="grid gap-2.5 text-[0.76rem] leading-relaxed text-muted-foreground sm:grid-cols-2">
            {[
              "Valid for one year from the date it is created.",
              "Redeemable at checkout against any order.",
              "Cannot be exchanged for cash or refunded.",
              "One code can be used across more than one order until the balance runs out.",
              "Treat the code like cash — anyone with it can use it.",
              "Need help? Message us on WhatsApp before ordering.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-saffron" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
