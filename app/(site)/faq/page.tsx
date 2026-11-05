import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MessageCircleQuestion } from "lucide-react";
import { JamdaniField } from "@/components/brand/ornaments";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/data";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { safeJsonLd } from "@/lib/utils";
import { STORE_SETTINGS } from "@/lib/settings";
import { getSiteContent } from "@/lib/site-content";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

export const metadata: Metadata = {
  title: "FAQ — Questions, answered",
  description:
    "Answers about Bengalot delivery, cash on delivery, exchanges, sizing, and handloom care.",
  alternates: { canonical: `${SITE.url}/faq` },
};

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

export default async function FAQPage() {
  const content = await getSiteContent();
  const items = content.faq.items.length ? content.faq.items : faqs;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)]">
        <JamdaniField id="faq-hero" color="var(--color-teal)" opacity={0.1} size={58} />
        <div className="container-luxe relative py-8 md:py-12">
          <Breadcrumbs items={[{ label: "FAQ" }]} />
          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow flex items-center gap-3 text-indigo">
                <span className="h-px w-8 bg-saffron" /> {content.faq.hero.eyebrow}
              </p>
              <h1 className="display-2 mt-3">
                {accentTitle(content.faq.hero.title, content.faq.hero.accent)}
              </h1>
              <p className="mt-4 max-w-xl text-[0.86rem] leading-relaxed text-muted-foreground">
                {content.faq.hero.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-2 rounded-full bg-[var(--color-jade)] px-5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--color-jade)]"
              >
                <WhatsAppIcon className="h-4 w-4" /> Ask us · {SITE.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container-luxe py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-16">
          <div>
            <p className="mb-4 text-[0.56rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Orders, delivery & care
            </p>
            <Accordion type="single" collapsible defaultValue="faq-0" className="border-t border-[var(--border)]">
              {items.map((faq, index) => (
                <AccordionItem key={`${faq.q}-${index}`} value={`faq-${index}`}>
                  <AccordionTrigger className="text-[0.92rem]">
                    <span className="flex items-start gap-3">
                      <span className="font-display text-sm text-gold/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <MessageCircleQuestion className="h-5 w-5 text-gold" />
              <p className="mt-3 font-display text-xl">Not answered here?</p>
              <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted-foreground">
                Send us a message. Fit advice, order changes, fabric questions — no bots.
              </p>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/contact"
                  className="flex items-center justify-between rounded-lg bg-midnight px-3.5 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-ivory"
                >
                  Contact us <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[var(--color-jade)] "
                >
                  WhatsApp <WhatsAppIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Useful links
              </p>
              <div className="mt-3 space-y-2.5">
                {[
                  { href: "/track", label: "Track your order" },
                  { href: "/shipping-policy", label: "Shipping policy" },
                  { href: "/return-policy", label: "Returns & exchanges" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between text-[0.7rem] text-muted-foreground transition hover:text-foreground"
                  >
                    {link.label} <ArrowUpRight className="h-3 w-3 opacity-50" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(145deg,var(--color-teal),var(--color-teal-luminous))] p-5 text-ivory">
              <JamdaniField id="faq-support" color="var(--color-saffron)" opacity={0.15} size={30} />
              <div className="relative">
                <p className="font-display text-lg">Real human support.</p>
                {STORE_SETTINGS.replyTime && (
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-ivory/75">
                    {STORE_SETTINGS.replyTime}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
