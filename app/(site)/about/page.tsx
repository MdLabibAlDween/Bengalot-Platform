import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  HeartHandshake,
  Leaf,
  MapPin,
  Scissors,
  Truck,
} from "lucide-react";
import { PageHero } from "@/components/storefront/page-hero";
import { SITE } from "@/lib/constants";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Our story — Born in Bengal",
  description:
    "Bengalot is a new online-only fashion brand from Saltha, Faridpur, starting with a small collection and growing piece by piece.",
  alternates: { canonical: `${SITE.url}/about` },
};

const values = [
  {
    icon: BadgeCheck,
    title: "Quality first",
    text: "We would rather make fewer pieces and check them properly than rush a larger collection.",
  },
  {
    icon: Leaf,
    title: "Honest materials",
    text: "We choose natural fibres and finishes we can explain clearly, and we are still learning as we grow.",
  },
  {
    icon: HeartHandshake,
    title: "Fair prices",
    text: "Small runs, direct selling and no unnecessary middle layers. The price should make sense.",
  },
  {
    icon: Truck,
    title: "Real support",
    text: "A real person answers WhatsApp and email. If something is unclear, ask us before ordering.",
  },
];

const steps = [
  {
    number: "01",
    icon: Scissors,
    title: "Choose your pieces",
    text: "Browse the departments and pick the color, size and quantity you want.",
  },
  {
    number: "02",
    icon: BadgeCheck,
    title: "Confirm your order",
    text: "Add your delivery details and choose cash on delivery at checkout.",
  },
  {
    number: "03",
    icon: Truck,
    title: "Packed and sent",
    text: "We pack your order and hand it to the courier for delivery.",
  },
  {
    number: "04",
    icon: MapPin,
    title: "Pay on delivery",
    text: "Pay the courier when your parcel arrives. Delivery is available across Bangladesh.",
  },
];

function accentTitle(title: string, accent: string) {
  if (!accent || !title.includes(accent)) return title;
  const [before, after] = title.split(accent);
  return (
    <>
      {before}
      <span className="italic text-gold-ink">{accent}</span>
      {after}
    </>
  );
}

export default async function AboutPage() {
  const content = await getSiteContent();
  const about = content.about;
  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={
          <>
            {accentTitle(about.hero.title, about.hero.accent)}
          </>
        }
        description={about.hero.description}
        accent="var(--color-magenta)"
        breadcrumbs={[{ label: "Our story" }]}
        art="saree"
        imageUrl={content.about.hero.imageUrl}
      />

      <section className="container-luxe py-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow text-indigo">{about.intro.eyebrow}</p>
            <h2 className="display-2 mt-3 max-w-md">
              {accentTitle(about.intro.title, "carefully.")}
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-[0.9rem] leading-relaxed text-muted-foreground">
            {about.intro.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {about.intro.quote && (
              <p className="border-l border-gold/40 pl-5 font-display text-xl italic text-foreground/85">
                “{about.intro.quote}”
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface-2)] py-12 md:py-20">
        <div className="container-luxe">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-indigo">{about.valuesHeading.eyebrow}</p>
              <h2 className="display-2 mt-3">{about.valuesHeading.title}</h2>
            </div>
            <p className="max-w-sm text-[0.8rem] leading-relaxed text-muted-foreground">
              {about.valuesHeading.description}
            </p>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const edited = about.values[index];
              return (
              <div
                key={value.title}
                className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/25 bg-gold/[0.06] text-gold">
                  <value.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-display text-xl">{edited?.title ?? value.title}</h3>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-muted-foreground">
                  {edited?.text ?? value.text}
                </p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-luxe py-12 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-indigo">{about.stepsHeading.eyebrow}</p>
            <h2 className="display-2 mt-3">{about.stepsHeading.title}</h2>
          </div>
          <Link
            href="/faq"
            className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-foreground/65 transition hover:text-gold"
          >
            Read the FAQ <ArrowUpRight className="ml-1 inline h-3 w-3" />
          </Link>
        </div>
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const edited = about.steps[index];
            return (
            <div
              key={step.number}
              className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--muted)] text-gold">
                  <step.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>
                <span className="text-xs font-bold tabular-nums text-muted-foreground/60">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl">{edited?.title ?? step.title}</h3>
              <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted-foreground">
                {edited?.text ?? step.text}
              </p>
            </div>
            );
          })}
        </div>
      </section>

      <section className="container-luxe pb-12 md:pb-20">
        <div className="relative overflow-hidden rounded-[26px] border border-gold/20 bg-[linear-gradient(120deg,var(--color-indigo-tint)_0%,var(--color-magenta-tint)_55%,var(--color-gold-tint)_100%)] p-7 md:p-12">
          <div className="relative max-w-2xl">
            <p className="eyebrow text-indigo">{about.cta.eyebrow}</p>
            <h2 className="display-2 mt-3 text-foreground">
              {accentTitle(about.cta.text, "kept.")}
            </h2>
            <p className="mt-4 max-w-lg text-[0.84rem] leading-relaxed text-muted-foreground">
              {about.cta.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/collections"
                className="cta-primary flex h-11 items-center gap-2.5 rounded-full px-5 text-[0.62rem] font-bold uppercase tracking-[0.12em]"
              >
                {about.cta.button} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/contact"
                className="cta-secondary flex h-11 items-center gap-2 rounded-full px-5 text-[0.62rem] font-bold uppercase tracking-[0.12em]"
              >
                Contact us <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
