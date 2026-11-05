import Link from "next/link";
import { ArrowRight, Gift, ShieldCheck, Sparkles } from "lucide-react";
import { GiftCardArt } from "@/components/gift-cards/gift-card-art";
import { JamdaniField } from "@/components/brand/ornaments";
import type { SectionCopy } from "@/lib/homepage";

const points = [
  { icon: Gift, text: "Choose any value from ৳500 to ৳50,000." },
  { icon: Sparkles, text: "Sent by WhatsApp or email with your note." },
  { icon: ShieldCheck, text: "One year to use it across the whole house." },
];

function giftTitle(title: string, accent: string) {
  if (!accent || !title.includes(accent)) {
    return (
      <>
        {title} <span className="italic text-saffron">{accent}</span>
      </>
    );
  }
  const [before, after] = title.split(accent);
  return (
    <>
      {before}
      <span className="italic text-saffron">{accent}</span>
      {after}
    </>
  );
}

export function GiftCardSection({
  mode = "physical",
  copy,
  imageUrl,
}: {
  mode?: "physical" | "virtual";
  copy?: SectionCopy;
  imageUrl?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-ink)] py-12 text-ivory md:py-20 lg:py-24">
      <JamdaniField
        id="home-gift-card-pattern"
        color="var(--color-saffron)"
        opacity={0.08}
        size={62}
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-magenta/20 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-indigo/40 blur-[100px]"
        aria-hidden="true"
      />

      <div className="container-luxe relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-saffron">
            <span className="h-px w-7 bg-saffron" />
            {copy?.eyebrow ?? "The gift of choice"}
          </p>
          <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(2.3rem,4.5vw,4.2rem)] leading-[0.98] text-balance">
            {giftTitle(copy?.title ?? "Let them choose", copy?.accent ?? "beautifully.")}
          </h2>
          <p className="mt-4 max-w-lg text-[0.9rem] leading-relaxed text-ivory/65">
            {copy?.description ??
              "Some pieces are too personal to guess. A Bengalot gift card gives them the whole house — with a year to find the one that feels like theirs."}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-saffron/25 bg-saffron/10 px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-saffron">
            {mode === "physical" ? "Physical card · Cash on Delivery" : "Virtual code · pay online"}
          </span>

          <ul className="mt-6 space-y-2.5">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[0.8rem] text-ivory/75">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ivory/15 bg-ivory/5 text-saffron">
                  <Icon className="h-3 w-3" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/gift-cards"
              className="cta-primary group inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-xs font-bold uppercase tracking-[0.1em]"
            >
              Buy a gift card
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/gift-cards#balance"
              className="inline-flex h-12 items-center justify-center rounded-full border border-ivory/25 px-6 text-xs font-bold uppercase tracking-[0.1em] text-ivory transition hover:border-saffron hover:text-saffron"
            >
              Check balance
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[430px] pb-8 pr-4 sm:pr-8">
          <div className="absolute -left-3 top-8 w-[88%] -rotate-6 opacity-95 sm:-left-6">
            <GiftCardArt amount={2000} recipient="A little something" tone="teal" compact />
          </div>
          <div className="relative ml-auto mt-14 w-[92%] rotate-3 sm:w-[88%]">
            {imageUrl ? (
              <div className="relative overflow-hidden rounded-[18px] border border-ivory/15 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Bengalot gift card"
                  className="aspect-[1.6] w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-ink/55 px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-ivory backdrop-blur">
                  Bengalot gift card
                </span>
              </div>
            ) : (
              <GiftCardArt amount={5000} recipient="Someone thoughtful" tone="indigo" />
            )}
          </div>
          <span className="absolute -bottom-1 right-2 grid h-16 w-16 place-items-center rounded-full border border-saffron/30 bg-ink/80 text-saffron backdrop-blur sm:right-0">
            <Gift className="h-6 w-6" />
          </span>
        </div>
      </div>
    </section>
  );
}
