import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
} from "lucide-react";
import { JamdaniField, SealStamp } from "@/components/brand/ornaments";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { ContactForm } from "@/components/storefront/contact-form";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { STORE_SETTINGS } from "@/lib/settings";
import { getSiteContent } from "@/lib/site-content";
import { EmailLink, EmailText } from "@/components/site/email-display";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

export const metadata: Metadata = {
  title: "Contact — Let's talk",
  description:
    "Contact Bengalot on WhatsApp at 01341739202 or email our support team. Online only, delivering across Bangladesh.",
  alternates: { canonical: `${SITE.url}/contact` },
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

export default async function ContactPage() {
  const content = await getSiteContent();
  const contact = content.contact;
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)]">
        <JamdaniField id="contact-hero" color="var(--color-teal)" opacity={0.1} size={58} />
        <div className="container-luxe relative py-8 md:py-12">
          <Breadcrumbs items={[{ label: "Contact" }]} />
          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow flex items-center gap-3 text-indigo">
                <span className="h-px w-8 bg-saffron" /> {contact.hero.eyebrow}
              </p>
              <h1 className="display-2 mt-3">
                {accentTitle(contact.hero.title, contact.hero.accent)}
              </h1>
              <p className="mt-4 max-w-xl text-[0.86rem] leading-relaxed text-muted-foreground">
                {contact.hero.description}
              </p>
            </div>
            <div className="hidden items-center gap-4 lg:flex">
              <SealStamp
                size={92}
                className="stamp-spin opacity-60"
                text="BENGALOT · REAL PEOPLE · SALTHA · FARIDPUR · "
                color="var(--color-teal)"
              />
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <p className="flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5 text-gold" /> Reply time
                </p>
                <p className="mt-1 font-display text-lg">
                  {contact.replyTime || STORE_SETTINGS.replyTime.replace(/^Average reply:\s*/i, "")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-luxe py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div className="space-y-3">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-gold"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-jade)]/10 text-[var(--color-jade)] ">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Fastest · WhatsApp
                </p>
                <p className="mt-1 font-display text-xl">{SITE.whatsapp}</p>
                <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                  Order help, fit advice and photos of pieces.
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:rotate-45 group-hover:text-gold" />
            </a>

            <EmailLink
              email={SITE.email}
              className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-gold"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Email support
                </p>
                <p className="mt-1 font-display text-xl">
                  <EmailText email={SITE.email} fallback="Email support" />
                </p>
                <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                  For exchanges, invoices and anything detailed.
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:rotate-45 group-hover:text-gold" />
            </EmailLink>

            <div className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-royal/10 text-royal ">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  The atelier
                </p>
                <p className="mt-1 font-display text-xl">Saltha, Faridpur</p>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-muted-foreground">
                  Bangladesh · Online only, always open
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 text-gold" /> Support hours
              </p>
              <div className="mt-3 space-y-2 text-[0.7rem]">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Saturday – Thursday</span>
                  <span className="font-medium">9:00 – 21:00</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Friday</span>
                  <span className="font-medium">14:00 – 21:00</span>
                </div>
              </div>
              <p className="mt-3 border-t border-[var(--border)] pt-3 text-[0.6rem] leading-relaxed text-muted-foreground">
                Timezone: Asia/Dhaka (GMT+6). WhatsApp messages outside hours are answered
                first thing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/faq"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[0.64rem] font-medium transition hover:border-gold"
              >
                <HelpCircle className="h-3.5 w-3.5 text-gold" /> FAQ
              </Link>
              <Link
                href="/track"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[0.64rem] font-medium transition hover:border-gold"
              >
                <Truck className="h-3.5 w-3.5 text-gold" /> Track order
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-midnight p-5 text-ivory">
              <JamdaniField id="contact-promise" color="var(--color-saffron)" opacity={0.12} size={32} />
              <div className="relative">
                <MessageCircle className="h-4 w-4 text-gold" />
                <p className="mt-2 font-display text-lg">Real humans only.</p>
                <p className="mt-1 text-[0.66rem] leading-relaxed text-ivory/45">
                  We do not use chatbots for support. If you message us, a person from the
                  atelier will write back.
                </p>
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
            <p className="mt-4 text-center text-[0.58rem] leading-relaxed text-muted-foreground">
              By sending a message you agree to our{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-gold">
                privacy policy
              </Link>
              . Your details are never shared or sold.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
