import type { Metadata } from "next";
import { MessageCircle, Package, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { MaskedLine } from "@/components/motion/reveal";
import { Accordion } from "@/components/ui/accordion";
import { getPageContent } from "@/lib/page-content.server";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about digital access, delivery, payment and returning a Bengalot study tool.",
};



const cardIcons = [Package, ShieldCheck, Sparkles];

export default async function FaqPage() {
  const { faq } = await getPageContent();

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-12 sm:py-16">
        <div
          className="pointer-events-none absolute -left-24 bottom-0 size-[22rem] rounded-full bg-lavender/40 blur-[60px]"
          aria-hidden="true"
        />
        <div className="container-wide relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow">{faq.eyebrow}</p>
            <h1 className="display-xl mt-4 max-w-[12ch] text-ink">
              <MaskedLine immediate>{faq.heading}</MaskedLine>
              <MaskedLine delay={0.08} immediate>
                <span className="display-italic text-coral">{faq.accent}</span>
              </MaskedLine>
            </h1>
            <p className="mt-5 max-w-[27rem] text-[0.94rem] leading-[1.8] text-ink-soft">
              {faq.intro}
            </p>

            <div className="mt-7 space-y-3">
              {faq.cards.map((item, index) => {
                const Icon = cardIcons[index] ?? Sparkles;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-soft/50 text-teal">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[0.68rem] font-bold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-[0.62rem] leading-relaxed text-muted">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-line bg-cream p-5 shadow-[0_24px_50px_-42px_rgba(21,34,50,0.4)] sm:p-6">
            {faq.items.map((item, index) => (
              <Accordion key={item.title} title={item.title} defaultOpen={index === 0}>
                {item.body}
              </Accordion>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-12">
        <div className="container-wide flex flex-col items-start justify-between gap-5 rounded-[1.4rem] bg-teal p-6 text-cream sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="grid size-10 place-items-center rounded-full bg-cream/10 text-butter">
              <MessageCircle className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-[1.35rem] leading-tight">
                Still wondering about something?
              </p>
              <p className="mt-0.5 text-[0.68rem] text-cream/90">
                Send us a message. Usually one working day, often sooner.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/contact" className="btn btn-butter btn-sm">
              Contact us
            </Link>
            <a
              href="https://wa.me/8801341739202"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm !border-cream/25 !text-cream hover:!border-butter hover:!text-butter"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
