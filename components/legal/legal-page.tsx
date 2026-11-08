import type { ReactNode } from "react";
import Link from "next/link";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-cream">
      <div className="container-wide grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.34fr_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-display text-[2.5rem] leading-[0.96] tracking-[-0.045em] text-ink">
            {title}
          </h1>
          <p className="mt-4 text-[0.68rem] text-muted">Last updated {updated}</p>
          <div className="mt-6 rounded-xl border border-line bg-surface p-4">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-muted">
              A plain-language note
            </p>
            <p className="mt-1.5 text-[0.68rem] leading-relaxed text-ink-soft">
              We have written these pages to be read, not skimmed past. If
              anything is unclear, ask us at{" "}
              <a
                href="mailto:support@bengalot.com"
                className="font-semibold text-teal underline underline-offset-2"
              >
                support@bengalot.com
              </a>
              .
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-4 inline-flex text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-teal"
          >
            Contact the studio →
          </Link>
        </aside>

        <div className="rounded-[1.5rem] border border-line bg-surface p-6 sm:p-9">
          <div className="legal-copy max-w-[44rem]">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="font-display text-[1.5rem] leading-tight tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[0.85rem] leading-[1.85] text-ink-soft/85">
        {children}
      </div>
    </section>
  );
}
