import { ArrowDown, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

import { HeroArt } from "@/components/home/hero-art";
import { SplitHeadline } from "@/components/motion/split-headline";
import { buttonLinkClass } from "@/components/ui/button";

const learners = [
  { initials: "NR", color: "#ca4b33", text: "#ffffff" },
  { initials: "TH", color: "#0d6f6d", text: "#ffffff" },
  { initials: "AK", color: "#d8d0e7", text: "#152232" },
  { initials: "MJ", color: "#f3c95f", text: "#152232" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div
        className="pointer-events-none absolute -left-52 top-20 size-[32rem] rounded-full bg-[radial-gradient(circle,rgba(216,208,231,0.55),transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-20 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(232,97,71,0.1),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line to-transparent"
        aria-hidden="true"
      />
      <div className="container-wide relative">
        <div className="grid items-center gap-10 pb-10 pt-10 sm:pt-14 lg:min-h-[calc(100svh-7.4rem)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:pb-16 lg:pt-8">
          <div className="relative z-20 max-w-[41rem]">
            <div className="rise-in flex flex-wrap items-center gap-3" style={{ animationDelay: "60ms" }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-2 text-[0.6rem] font-extrabold uppercase tracking-[0.15em] text-ink-soft backdrop-blur-sm">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-teal" />
                </span>
                Study tools for the long game
              </span>
              <span className="hidden text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-muted sm:inline">
                Made in Bangladesh
              </span>
            </div>

            <SplitHeadline
              className="mt-7 sm:mt-8"
              lines={[
                { text: "Bring a lot" },
                { text: "to learning.", accent: "italic" },
              ]}
              delay={0.25}
            />

            <p
              className="rise-in mt-6 max-w-[31rem] text-[0.98rem] leading-[1.75] text-ink-soft sm:mt-7 sm:text-[1.06rem]"
              style={{ animationDelay: "520ms" }}
            >
              Notion templates, printed study cards, printable planners and
              quiet focus tools — for students who want to do the work without
              carrying the clutter.
            </p>

            <div
              className="rise-in mt-8 flex flex-col gap-2.5 sm:flex-row sm:items-center"
              style={{ animationDelay: "640ms" }}
            >
              <Link href="/shop" className={buttonLinkClass({ size: "lg" }, "group")}>
                Explore products
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/about"
                className={buttonLinkClass({ variant: "outline", size: "lg" }, "group")}
              >
                Discover Bengalot
                <ArrowDown
                  className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div
              className="rise-in mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-5"
              style={{ animationDelay: "760ms" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {learners.map((learner) => (
                    <span
                      key={learner.initials}
                      className="grid size-8 place-items-center rounded-full border-2 border-cream text-[0.52rem] font-extrabold shadow-sm"
                      style={{ backgroundColor: learner.color, color: learner.text }}
                    >
                      {learner.initials}
                    </span>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-coral" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} className="size-3 fill-current" />
                    ))}
                  </div>
                  <p className="mt-0.5 text-[0.67rem] font-semibold text-ink-soft">
                    4.9 from 2,400+ learners
                  </p>
                </div>
              </div>
              <p className="max-w-[14rem] text-[0.66rem] leading-relaxed text-muted">
                Digital access after payment. Cash on delivery for physical
                tools.
              </p>
            </div>
          </div>

          <div className="relative -mx-4 sm:mx-0 lg:-mr-8">
            <HeroArt />
          </div>
        </div>
      </div>

      <div className="container-wide hidden items-center justify-between border-t border-line py-4 lg:flex">
        <span className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-muted">
          Designed for the way you actually study
        </span>
        <div className="flex items-center gap-6 text-[0.56rem] font-bold uppercase tracking-[0.16em] text-muted">
          <span>Notion templates</span>
          <span className="size-1 rounded-full bg-coral" />
          <span>Study cards</span>
          <span className="size-1 rounded-full bg-teal" />
          <span>Planners</span>
          <span className="size-1 rounded-full bg-butter" />
          <span>Focus tools</span>
        </div>
        <a
          href="#categories"
          className="group flex items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.16em] text-ink"
        >
          Scroll to explore
          <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
