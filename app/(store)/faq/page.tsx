import type { Metadata } from "next";
import { MessageCircle, Package, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { MaskedLine } from "@/components/motion/reveal";
import { Accordion } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about digital access, delivery, payment and returning a Bengalot study tool.",
};

const faqs = [
  {
    title: "How do digital products arrive?",
    body: "After payment is confirmed, your resource is added to your account library. Notion templates open through a duplicate link, and printable resources appear as PDF downloads. You will also receive a receipt by email.",
  },
  {
    title: "Can I buy without an account?",
    body: "You can place a physical order as a guest. Digital orders need an account so we have a safe place to deliver access. Creating one takes less than a minute and keeps every resource in one library.",
  },
  {
    title: "What payment methods do you accept?",
    body: "Cash on delivery is available for physical items across Bangladesh. bKash is available for all orders; for bKash we send manual instructions after you place the order. There is no card gateway running yet.",
  },
  {
    title: "How much is delivery?",
    body: "Delivery is ৳70 inside Faridpur district and ৳130 elsewhere in Bangladesh. Orders above ৳2,000 ship free. Digital orders have no delivery fee.",
  },
  {
    title: "How long does a physical order take?",
    body: "Most parcels are packed within one working day and arrive in 2–4 working days. If something is delayed, message us on WhatsApp with your order number and we will check it with the courier.",
  },
  {
    title: "Can I return a study card deck?",
    body: "If a physical item arrives damaged or is not what you ordered, tell us within 48 hours of delivery. Unused items in their original packaging can be exchanged. Digital resources are non-refundable once access has been opened.",
  },
  {
    title: "What if a Notion link stops working?",
    body: "Send us your order number and the resource name. We check every access link and will repair or reset it for you. Our support window is Sunday to Thursday, 10am–6pm.",
  },
  {
    title: "Are the prices in BDT?",
    body: "Yes. Every price on Bengalot is in Bangladeshi Taka, including the taka symbol. Delivery is shown separately at checkout before you place the order.",
  },
  {
    title: "Do you ship outside Bangladesh?",
    body: "Not yet. Our printed tools and delivery pricing are designed for Bangladesh. Digital tools can be used from anywhere, but the checkout address step is currently set up for local delivery only.",
  },
  {
    title: "Can I get a custom bundle or school order?",
    body: "Yes, for larger orders we can put together a bundle for a class, school or study group. Message support@bengalot.com or WhatsApp 01341739202 with what you need and roughly how many people.",
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-cream py-12 sm:py-16">
        <div
          className="pointer-events-none absolute -left-24 bottom-0 size-[22rem] rounded-full bg-lavender/40 blur-[60px]"
          aria-hidden="true"
        />
        <div className="container-wide relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow">Questions, answered</p>
            <h1 className="display-xl mt-4 max-w-[12ch] text-ink">
              <MaskedLine immediate>The useful</MaskedLine>
              <MaskedLine delay={0.08} immediate>
                <span className="display-italic text-coral">small print.</span>
              </MaskedLine>
            </h1>
            <p className="mt-5 max-w-[27rem] text-[0.94rem] leading-[1.8] text-ink-soft">
              Everything we get asked before a first order. If your question is
              not here, a human is one message away.
            </p>

            <div className="mt-7 space-y-3">
              {[
                {
                  icon: Package,
                  title: "Delivery across Bangladesh",
                  copy: "৳70 in Faridpur · ৳130 elsewhere · free over ৳2,000.",
                },
                {
                  icon: ShieldCheck,
                  title: "Digital access guarantee",
                  copy: "Every link is checked and reset if it ever breaks.",
                },
                {
                  icon: Sparkles,
                  title: "Real support",
                  copy: "The same small studio answers your questions.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-soft/50 text-teal">
                    <item.icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.68rem] font-bold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[0.62rem] leading-relaxed text-muted">
                      {item.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-line bg-cream p-5 shadow-[0_24px_50px_-42px_rgba(21,34,50,0.4)] sm:p-6">
            {faqs.map((faq, index) => (
              <Accordion key={faq.title} title={faq.title} defaultOpen={index === 0}>
                {faq.body}
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
