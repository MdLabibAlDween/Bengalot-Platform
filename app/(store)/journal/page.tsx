import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { JournalArtMotif } from "@/components/journal/journal-art-motif";
import { getPageContent } from "@/lib/page-content.server";

export const metadata: Metadata = {
  title: "The journal",
  description:
    "Field notes on focus, study rituals, paper tools and building a calmer kind of work.",
};

const themeStyles = {
  teal: "bg-teal text-cream",
  coral: "bg-coral text-cream",
  lavender: "bg-lavender text-ink",
};

export default async function JournalPage() {
  const { journal } = await getPageContent();
  const [featured, ...rest] = journal.articles;
  if (!featured) return null;
  const headingLines = journal.heading.split("\n").filter(Boolean);

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-12 sm:py-16">
        <div
          className="pointer-events-none absolute -right-28 top-0 size-[26rem] rounded-full bg-[radial-gradient(circle,rgba(243,201,95,0.25),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="container-wide relative">
          <p className="eyebrow">{journal.eyebrow}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h1 className="display-xl max-w-[12ch] text-ink">
              {headingLines.map((line, index) => (
                <MaskedLine key={`${line}-${index}`} immediate delay={index * 0.04}>
                  {line}
                </MaskedLine>
              ))}
              <MaskedLine delay={0.08} immediate>
                <span className="display-italic text-coral">{journal.accent}</span>
              </MaskedLine>
            </h1>
            <p className="max-w-[26rem] text-[0.92rem] leading-[1.75] text-ink-soft lg:pb-2">
              {journal.intro}
            </p>
          </div>

          <Reveal delay={0.1} className="mt-10">
            <Link
              href={`/journal/${featured.slug}`}
              className="group grid overflow-hidden rounded-[1.6rem] border border-line bg-surface transition-shadow duration-300 hover:shadow-[0_30px_60px_-40px_rgba(21,34,50,0.4)] lg:grid-cols-[0.85fr_1.15fr]"
            >
              <div
                className={`relative flex min-h-[16rem] flex-col justify-between overflow-hidden p-6 sm:p-8 ${themeStyles[featured.theme]}`}
              >
                <div
                  className="pointer-events-none absolute inset-0 dot-paper opacity-20"
                  aria-hidden="true"
                />
                <JournalArtMotif theme={featured.theme} index="01" />
                <div className="relative flex items-center justify-between">
                  <span className="rounded-full border border-current/25 bg-black/5 px-3 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.12em]">
                    {featured.category}
                  </span>
                  <span className="font-display text-5xl italic opacity-20">01</span>
                </div>
                <p className="relative max-w-[16rem] font-display text-[2rem] leading-[1.02] tracking-[-0.04em]">
                  {featured.pullQuote}
                </p>
              </div>
              <div className="flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
                    {featured.readTime} · {featured.date}
                  </p>
                  <h2 className="mt-3 font-display text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.04] tracking-[-0.04em] text-ink">
                    {featured.title}
                  </h2>
                  <p className="mt-3 max-w-[33rem] text-[0.84rem] leading-[1.7] text-muted">
                    {featured.excerpt}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-[0.64rem] font-extrabold uppercase tracking-[0.11em] text-teal">
                  Read the note
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {rest.map((article, index) => (
              <Reveal key={article.slug} delay={index * 0.08}>
                <Link
                  href={`/journal/${article.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-line bg-surface transition-shadow duration-300 hover:shadow-[0_24px_50px_-36px_rgba(21,34,50,0.35)]"
                >
                  <div
                    className={`relative flex aspect-[16/7] items-end p-5 ${themeStyles[article.theme]}`}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 dot-paper opacity-20"
                      aria-hidden="true"
                    />
                    <JournalArtMotif theme={article.theme} index={`0${index + 2}`} />
                    <span className="relative z-10 rounded-full border border-current/25 bg-black/5 px-2.5 py-1 text-[0.52rem] font-bold uppercase tracking-[0.1em]">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-muted">
                        {article.readTime} · {article.date}
                      </p>
                      <h2 className="mt-2 font-display text-[1.55rem] leading-[1.1] tracking-[-0.03em] text-ink">
                        {article.title}
                      </h2>
                      <p className="mt-2 text-[0.78rem] leading-[1.65] text-muted">
                        {article.excerpt}
                      </p>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.1em] text-teal">
                      Read the note
                      <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
