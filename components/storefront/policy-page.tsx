import Link from "next/link";
import { ArrowUpRight, Clock3, Mail, Sparkles } from "lucide-react";
import { JamdaniField } from "@/components/brand/ornaments";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { EmailText } from "@/components/site/email-display";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { STORE_SETTINGS } from "@/lib/settings";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

export function PolicyPage({
  eyebrow = "The fine print",
  title,
  shortTitle,
  description,
  updated = STORE_SETTINGS.policyUpdated,
  needsReview = true,
  sections,
}: {
  eyebrow?: string;
  title: string;
  shortTitle?: string;
  description: string;
  updated?: string;
  needsReview?: boolean;
  sections: { id: string; title: string; content: React.ReactNode }[];
}) {
  return (
    <>
      <section
        className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)]"
        data-policy-needs-review={needsReview ? "true" : "false"}
      >
        <JamdaniField id={`policy-${title.replace(/\s/g, "-")}`} color="var(--color-saffron)" opacity={0.1} size={58} />
        <div className="container-luxe relative py-8 md:py-10">
          <Breadcrumbs items={[{ label: shortTitle ?? title }]} />
          <div className="mt-7 max-w-3xl">
            <p className="eyebrow flex items-center gap-3 text-indigo">
              <span className="h-px w-8 bg-gold" /> {eyebrow}
            </p>
            <h1 className="display-2 mt-3">{title}</h1>
            <p className="mt-4 max-w-2xl text-[0.86rem] leading-relaxed text-muted-foreground">
              {description}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <Clock3 className="h-3 w-3 text-gold" /> Last updated {updated}
            </p>
          </div>
        </div>
      </section>

      <div className="container-luxe py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[230px_1fr] lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                On this page
              </p>
              <nav className="mt-3 space-y-0.5">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-baseline gap-2.5 rounded-lg px-2.5 py-2 text-[0.7rem] text-muted-foreground transition hover:bg-[var(--muted)] hover:text-foreground"
                  >
                    <span className="font-display text-[0.65rem] text-gold-ink/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <Sparkles className="h-4 w-4 text-gold" />
                <p className="mt-2 font-display text-lg">Still unsure?</p>
                <p className="mt-1 text-[0.64rem] leading-relaxed text-muted-foreground">
                  A real person is happy to explain anything in plain language.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[var(--color-jade)] "
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp us
                </a>
              </div>
            </div>
          </aside>

          <div className="max-w-3xl">
            <div className="space-y-10">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-sm text-gold-ink">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-[2rem] leading-tight">{section.title}</h2>
                  </div>
                  <div className="prose-luxe mt-3 pl-8">{section.content}</div>
                </section>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-lg">Questions about this policy?</p>
                  <p className="mt-1 text-[0.68rem] text-muted-foreground">
                    Write to <EmailText email={SITE.email} fallback="our support team" /> and we will get back to you.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href="/contact"
                  className="cta-primary flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold uppercase tracking-[0.1em]"
                >
                  Contact <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
