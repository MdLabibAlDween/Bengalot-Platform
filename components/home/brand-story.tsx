import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";

function StudyNote() {
  return (
    <div className="relative aspect-[4/4.6] w-full max-w-[20rem] rotate-[3deg]">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-[5deg] rounded-[1.2rem] border border-cream/10 bg-lavender" />
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.2rem] border border-ink/10 bg-[#ffffff] p-6 shadow-[0_35px_70px_-30px_rgba(0,0,0,0.6)]">
        <div>
          <div className="flex items-start justify-between">
            <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-teal">
              The weekly page · No. 12
            </span>
            <span className="font-display text-lg italic text-ink/30">W.</span>
          </div>
          <p className="mt-5 font-display text-[2.15rem] leading-[0.95] tracking-[-0.04em] text-ink">
            One thing
            <br />
            <span className="italic text-coral">at a time.</span>
          </p>
          <div className="mt-5 space-y-2">
            {["Finish the chapter", "20 minutes of recall", "Close the laptop", "Walk outside"].map(
              (item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-2 border-b border-line/80 pb-2"
                >
                  <span
                    className={`grid size-3.5 place-items-center rounded-[0.3rem] border ${index === 0 ? "border-teal bg-teal" : "border-line-strong"}`}
                  >
                    {index === 0 ? <span className="size-1 rounded-full bg-cream" /> : null}
                  </span>
                  <span
                    className={`text-[0.62rem] font-medium ${index === 0 ? "text-ink/35 line-through" : "text-ink/65"}`}
                  >
                    {item}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[0.5rem] font-extrabold uppercase tracking-[0.15em] text-muted">
            Bengalot · made to use
          </span>
          <Sparkles className="size-3 text-coral" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export function BrandStory() {
  return (
    <section
      id="story"
      className="relative overflow-hidden bg-teal-deep py-20 text-cream sm:py-24 lg:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(247,241,228,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(247,241,228,.55) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-[30rem] rounded-full border border-cream/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-36 -left-20 size-[28rem] rounded-full bg-coral/15 blur-[80px]"
        aria-hidden="true"
      />

      <div className="container-wide relative grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow eyebrow-no-dot !text-butter/80">
              <span className="size-1.5 rounded-full bg-butter" />
              The Bengalot point of view
            </p>
          </Reveal>

          <h2 className="display-xl mt-7 text-cream">
            <MaskedLine>Make learning</MaskedLine>
            <MaskedLine delay={0.07}>
              <span className="display-italic text-butter">more intentional.</span>
            </MaskedLine>
            <MaskedLine delay={0.14}>Make productivity</MaskedLine>
            <MaskedLine delay={0.21}>
              <span className="display-italic text-[#f0a58f]">
                more meaningful.
              </span>
            </MaskedLine>
          </h2>

          <div className="mt-9 grid max-w-2xl gap-5 border-t border-cream/15 pt-7 sm:grid-cols-2">
            <Reveal delay={0.1}>
              <p className="text-[0.88rem] leading-[1.8] text-cream/65">
                We make tools for the serious, quiet part of learning: the
                second attempt, the honest hour, the week you actually finish.
                Nothing promises to do the work for you.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-[0.88rem] leading-[1.8] text-cream/65">
                Every deck, planner and template begins with a simple question:
                will this make the next session easier to start? If not, it does
                not belong on the shelf.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 border-b border-cream/25 pb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-cream transition-colors hover:border-butter hover:text-butter"
              >
                Read our story
                <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <p className="text-[0.66rem] font-medium text-cream/40">
                From Saltha, Faridpur — with a lot of care.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="relative mx-auto w-full max-w-[24rem] lg:mx-0 lg:ml-auto">
          <div className="relative pb-12 pl-4">
            <div className="absolute -left-2 -top-8 size-20 rounded-full border border-cream/20" />
            <div
              className="absolute -right-4 top-16 aspect-square w-36 rounded-full border border-cream/15"
              aria-hidden="true"
            />
            <div className="absolute -left-20 bottom-[19%] z-20 hidden w-[9.5rem] rotate-[-7deg] rounded-xl bg-coral px-4 py-3.5 text-cream shadow-2xl lg:block">
              <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.15em] text-cream/60">
                A reminder
              </p>
              <p className="mt-1 font-display text-[1.15rem] italic leading-[1.1]">
                A little better, every day.
              </p>
            </div>

            <StudyNote />

            <div className="absolute -bottom-1 right-0 z-20 flex rotate-[4deg] items-center gap-3 rounded-full border border-cream/20 bg-navy/70 px-4 py-3 backdrop-blur-md">
              <span className="grid size-9 place-items-center rounded-full bg-butter font-display text-lg text-navy">
                B
              </span>
              <span>
                <span className="block text-[0.48rem] font-extrabold uppercase tracking-[0.15em] text-cream/50">
                  Since
                </span>
                <span className="font-display text-[0.95rem] leading-none text-cream">
                  2026 · Faridpur
                </span>
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="container-wide relative mt-16 border-t border-cream/10 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[0.57rem] font-bold uppercase tracking-[0.18em] text-cream/35">
            Bring a lot to learning · bring a little more to the day
          </p>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-butter" />
            <span className="text-[0.57rem] font-bold uppercase tracking-[0.18em] text-cream/35">
              Screen-free tools exist
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

