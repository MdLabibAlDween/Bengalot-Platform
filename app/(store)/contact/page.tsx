import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { MaskedLine } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Bengalot studio about an order, a product or a custom request.",
};

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden bg-cream py-12 sm:py-16">
      <div
        className="pointer-events-none absolute -right-32 top-0 size-[30rem] rounded-full bg-butter/20 blur-[60px]"
        aria-hidden="true"
      />
      <div className="container-wide relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Talk to us</p>
          <h1 className="display-xl mt-4 max-w-[10ch] text-ink">
            <MaskedLine>A real</MaskedLine>
            <MaskedLine delay={0.08}>
              <span className="display-italic text-teal">conversation.</span>
            </MaskedLine>
          </h1>
          <p className="mt-5 max-w-[27rem] text-[0.94rem] leading-[1.8] text-ink-soft">
            The same small team that designs the tools answers the messages.
            Ask about an order, an access link, a school bundle or a product
            that does not exist yet.
          </p>

          <div className="mt-7 space-y-3">
            <a
              href="https://wa.me/8801341739202"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-teal"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal text-cream">
                <MessageCircle className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[0.7rem] font-bold text-ink">
                  WhatsApp · 01341739202
                </span>
                <span className="mt-0.5 block text-[0.64rem] text-muted">
                  Fastest for order and access support.
                </span>
              </span>
            </a>
            <a
              href="mailto:support@bengalot.com"
              className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-teal"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lavender text-ink">
                <Mail className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[0.7rem] font-bold text-ink">
                  support@bengalot.com
                </span>
                <span className="mt-0.5 block text-[0.64rem] text-muted">
                  For longer notes, invoices and school orders.
                </span>
              </span>
            </a>
            <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-butter text-ink">
                <MapPin className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[0.7rem] font-bold text-ink">
                  Saltha, Faridpur, Bangladesh
                </span>
                <span className="mt-0.5 block text-[0.64rem] text-muted">
                  Online-only studio. No walk-in shop yet.
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-teal-soft/40 px-4 py-3 text-[0.64rem] text-teal">
              <Clock className="size-3.5" aria-hidden="true" />
              Sunday–Thursday · 10:00–18:00 (Asia/Dhaka)
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-line bg-surface p-6 shadow-[0_24px_50px_-42px_rgba(21,34,50,0.4)] sm:p-8">
          <p className="font-display text-[1.6rem] tracking-[-0.03em] text-ink">
            Send a note.
          </p>
          <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">
            We usually reply within one working day. Include your order number
            if you have one.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
