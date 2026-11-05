import { MessageCircleQuestion } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { FREE_DELIVERY_ENABLED, FREE_DELIVERY_THRESHOLD, formatBDT } from "@/lib/utils";
import { STORE_SETTINGS } from "@/lib/settings";
import { getStoreProfile } from "@/lib/admin/settings";
import type { Product } from "@/lib/types";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { TakaText } from "@/components/site/taka-text";

export async function QASection({ product }: { product: Product }) {
  const profile = await getStoreProfile();
  const deliveryAnswer = FREE_DELIVERY_ENABLED
    ? `We deliver to all 64 districts. It is ${formatBDT(profile.deliveryInside)} inside Faridpur and ${formatBDT(profile.deliveryOutside)} elsewhere, and complimentary over ${formatBDT(FREE_DELIVERY_THRESHOLD)}. Cash on delivery is available everywhere.`
    : `We deliver to all 64 districts. It is ${formatBDT(profile.deliveryInside)} inside Faridpur and ${formatBDT(profile.deliveryOutside)} elsewhere. Cash on delivery is available everywhere.`;

  const questions = [
    {
      q: "Is the color true to the illustrations?",
      a: "Our placeholder artwork uses the closest color match from the atelier's swatch book. Because every screen differs slightly, we are always happy to send a real photo or video of the piece on WhatsApp before you order.",
    },
    {
      q: "How do I care for this piece?",
      a: `${product.care} If you are ever unsure, message us and we will send the full care card that comes with the order.`,
    },
    {
      q: "Can I exchange it if the fit is not right?",
      a:
        STORE_SETTINGS.exchangeWindowEnabled && STORE_SETTINGS.exchangeWindowDays > 0
          ? `Yes — unused pieces with tags intact can be exchanged within ${STORE_SETTINGS.exchangeWindowDays} days of delivery. We arrange a pickup through Steadfast.`
          : "Contact us on WhatsApp and we will check the options for your item under the current return policy.",
    },
    {
      q: "Do you deliver to my district?",
      a: deliveryAnswer,
    },
  ];

  return (
    <section className="border-t border-[var(--border)] bg-[var(--surface-2)] py-16 md:py-20">
      <div className="container-luxe grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow flex items-center gap-3 text-indigo">
            <span className="h-px w-8 bg-gold" /> Questions & answers
          </p>
          <h2 className="display-3 mt-3">
            Before you <span className="italic text-gold-ink">decide.</span>
          </h2>
          <p className="mt-3 max-w-sm text-[0.8rem] leading-relaxed text-muted-foreground">
            Still unsure about something? A real person is on the other end of WhatsApp.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-jade)]/25 bg-[var(--color-jade)]/[0.06] px-5 py-3 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-[var(--color-jade)] transition hover:bg-[var(--color-jade)] hover:text-white "
          >
            <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp · {SITE.whatsapp}
          </a>
          {STORE_SETTINGS.replyTime && (
            <p className="mt-4 flex items-center gap-2 text-[0.75rem] text-muted-foreground">
              <MessageCircleQuestion className="h-3.5 w-3.5 text-gold" />{" "}
              {STORE_SETTINGS.replyTime}
            </p>
          )}
        </div>

        <Accordion type="single" collapsible className="self-start">
          {questions.map((item, index) => (
            <AccordionItem key={item.q} value={`q-${index}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>
              <TakaText text={item.a} />
            </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
