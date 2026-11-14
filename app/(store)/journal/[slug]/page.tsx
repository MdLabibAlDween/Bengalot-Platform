import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/reveal";
import { getPageContent } from "@/lib/page-content.server";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { journal } = await getPageContent();
  const article = journal.articles.find((item) => item.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      title: `${article.title} · Bengalot`,
      description: article.excerpt,
      type: "article",
    },
  };
}

const themeStyles = {
  teal: "bg-teal text-cream",
  coral: "bg-coral text-cream",
  lavender: "bg-lavender text-ink",
};

export default async function JournalArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const { journal } = await getPageContent();
  const article = journal.articles.find((item) => item.slug === slug);
  if (!article) notFound();

  const related = journal.articles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2);

  return (
    <article className="bg-cream">
      <div className="container-wide py-8 sm:py-10">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.11em] text-muted transition-colors hover:text-teal"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Field notes
        </Link>
        <div className="mx-auto mt-8 max-w-[48rem] text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.11em]">
            <span className="rounded-full bg-teal-soft/50 px-3 py-1.5 text-teal">
              {article.category}
            </span>
            <span className="text-muted">{article.readTime}</span>
            <span className="size-1 rounded-full bg-line-strong" />
            <span className="text-muted">{article.date}</span>
          </div>
          <h1 className="mt-5 font-display text-[clamp(2.3rem,5vw,4.4rem)] leading-[0.96] tracking-[-0.05em] text-ink">
            {article.title}
          </h1>
          <p className="mx-auto mt-5 max-w-[34rem] text-[0.95rem] leading-[1.75] text-ink-soft">
            {article.excerpt}
          </p>
        </div>
      </div>

      <div className="container-wide">
        <div
          className={`relative flex min-h-[18rem] items-end overflow-hidden rounded-[1.8rem] p-7 sm:min-h-[22rem] sm:p-10 ${themeStyles[article.theme]}`}
        >
          <div
            className="pointer-events-none absolute inset-0 dot-paper opacity-20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full border border-current/15"
            aria-hidden="true"
          />
          <p className="relative max-w-[34rem] font-display text-[clamp(1.8rem,3.4vw,3rem)] leading-[1.04] tracking-[-0.04em]">
            {article.pullQuote}
          </p>
          <span className="absolute right-8 top-6 font-display text-7xl italic opacity-15">
            B.
          </span>
        </div>
      </div>

      <div className="container-wide grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.32fr_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.2rem] border border-line bg-surface p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-muted">
              In this note
            </p>
            <p className="mt-2 font-display text-[1.2rem] leading-tight tracking-[-0.02em] text-ink">
              {article.category}
            </p>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-[0.66rem] text-muted">
              <p>{article.readTime}</p>
              <p>Published {article.date}</p>
              <p>By the Bengalot studio</p>
            </div>
          </div>
        </aside>

        <div className="max-w-[42rem]">
          {article.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 24)} delay={index * 0.04}>
              <p className="mb-5 text-[0.98rem] leading-[1.9] text-ink-soft first:text-[1.08rem] first:leading-[1.8]">
                {paragraph}
              </p>
            </Reveal>
          ))}

          <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-[0.68rem] italic text-muted">
              Written slowly in Saltha, Faridpur.
            </p>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-[0.64rem] font-extrabold uppercase tracking-[0.11em] text-teal"
            >
              Explore the tools
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container-wide border-t border-line py-12">
        <p className="eyebrow">Keep reading</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/journal/${item.slug}`}
              className="group rounded-[1.3rem] border border-line bg-surface p-5 transition-colors hover:border-line-strong"
            >
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
                {item.category} · {item.readTime}
              </p>
              <p className="mt-2 font-display text-[1.4rem] leading-[1.1] tracking-[-0.03em] text-ink">
                {item.title}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.09em] text-teal">
                Read
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
