import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { JournalArtMotif } from "@/components/journal/journal-art-motif";
import { journalArticles } from "@/lib/journal";

const themeStyles = {
  teal: "bg-teal text-cream",
  coral: "bg-coral text-cream",
  lavender: "bg-lavender text-ink",
};

export function JournalTeaser() {
  return (
    <section className="relative overflow-hidden bg-[#f1eff7] py-20 sm:py-24">
      <div className="container-wide">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="eyebrow">Field notes</p>
            <h2 className="display-lg mt-3 max-w-[15ch] text-ink">
              Ideas for a quieter kind of{" "}
              <span className="display-italic text-teal">work.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/journal"
              className="group inline-flex items-center gap-2 border-b border-ink/20 pb-1 text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink transition-colors hover:border-teal hover:text-teal"
            >
              Read the journal
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-3.5 md:grid-cols-3">
          {journalArticles.map((article, index) => (
            <Reveal key={article.slug} delay={index * 0.07}>
              <Link
                href={`/journal/${article.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-line bg-cream transition-shadow duration-300 hover:shadow-[0_26px_50px_-36px_rgba(21,34,50,0.35)]"
              >
                <div
                  className={`relative flex aspect-[16/9] items-end overflow-hidden p-5 ${themeStyles[article.theme]}`}
                >
                  <div
                    className="pointer-events-none absolute inset-0 dot-paper opacity-20"
                    aria-hidden="true"
                  />
                  <JournalArtMotif theme={article.theme} index={`0${index + 1}`} />
                  <span className="art-caption relative z-10 rounded-full border border-current/20 bg-black/5 px-2.5 py-1 text-[0.55rem] opacity-80">
                    {article.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted">
                      {article.readTime} · {article.date}
                    </p>
                    <h3 className="mt-2 font-display text-[1.35rem] leading-[1.15] tracking-[-0.03em] text-ink">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-[0.76rem] leading-[1.6] text-muted">
                      {article.excerpt}
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.11em] text-teal">
                    Read the note
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
