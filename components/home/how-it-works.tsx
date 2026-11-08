import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Layers,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { StepsConnector } from "@/components/home/steps-connector";

const steps = [
  {
    number: "01",
    title: "Discover",
    copy: "Start with the way you work. Browse by the kind of tool you need — not by a wall of noise.",
    icon: Compass,
    accent: "bg-teal text-cream",
  },
  {
    number: "02",
    title: "Choose",
    copy: "Open every product properly. See what is inside, how it works and exactly what arrives.",
    icon: Layers,
    accent: "bg-butter text-ink",
  },
  {
    number: "03",
    title: "Purchase",
    copy: "Cash on delivery for physical tools. Digital resources open in your library after payment.",
    icon: ShoppingBag,
    accent: "bg-coral text-cream",
  },
  {
    number: "04",
    title: "Learn",
    copy: "Keep the useful thing close. Build a small ritual, then let the work accumulate quietly.",
    icon: BookOpen,
    accent: "bg-navy text-cream",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-paper py-20 sm:py-24">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-full w-[24rem] dot-paper opacity-40"
        aria-hidden="true"
      />
      <div className="container-wide relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">How Bengalot works</p>
            </Reveal>
            <h2 className="display-xl mt-4 max-w-[17ch] text-ink">
              <MaskedLine>From wanting to begin,</MaskedLine>
              <MaskedLine delay={0.08}>
                <span className="display-italic text-coral">
                  to actually beginning.
                </span>
              </MaskedLine>
            </h2>
          </div>
          <Reveal delay={0.15} className="lg:pb-2">
            <p className="max-w-[24rem] text-[0.9rem] leading-[1.75] text-ink-soft">
              A short, honest path from the first look to the first focused
              session. No account needed to browse. No complicated checkouts.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[0.65rem] font-semibold text-teal">
              <span className="grid size-4 place-items-center rounded-full bg-teal/10">
                <Check className="size-2.5" />
              </span>
              Thoughtfully low-friction, on purpose
            </div>
          </Reveal>
        </div>

        <div className="relative mt-14 grid gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <StepsConnector />
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1}>
              <div className="group relative">
                <div className="flex items-center justify-between">
                  <span
                    className={`relative z-10 grid size-[4.2rem] place-items-center rounded-full border-[6px] border-paper ${step.accent} shadow-sm transition-transform duration-300 group-hover:-translate-y-1`}
                  >
                    <step.icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="font-display text-[2.3rem] italic leading-none text-ink/15">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[1.7rem] tracking-[-0.03em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[17rem] text-[0.8rem] leading-[1.7] text-ink-soft/75">
                  {step.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.18}>
          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
            <p className="text-[0.7rem] font-medium text-muted">
              Not sure what to choose first? The Student Starter Bundle is the
              gentlest way in.
            </p>
            <Link
              href="/product/student-starter-bundle"
              className="group inline-flex items-center gap-2 text-[0.67rem] font-extrabold uppercase tracking-[0.13em] text-teal"
            >
              Start there
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
