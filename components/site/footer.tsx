"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Music2,
  Truck,
  Youtube,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { JamdaniField, AlponaDivider, SealStamp } from "@/components/brand/ornaments";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { departments } from "@/lib/data";
import { deliveryNotice, STORE_SETTINGS } from "@/lib/settings";
import { useLocale } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import { WhatsAppIcon } from "./whatsapp-icon";

export function Footer() {
  const { t } = useLocale();
  const { features, content } = useSiteConfig();
  const footerContent = (content?.footer as { tagline?: string; note?: string } | undefined) ?? {};

  const helpLinks = [
    { href: "/track", label: "Track your order" },
    { href: "/shipping-policy", label: "Shipping & delivery" },
    { href: "/return-policy", label: "Returns & exchanges" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact us" },
  ];

  const companyLinks = [
    { href: "/about", label: "Our story" },
    { href: "/lookbook", label: "Lookbook" },
    ...(features.giftCards ? [{ href: "/gift-cards", label: "Gift cards" }] : []),
    { href: "/offers", label: "Offers & campaigns" },
  ];

  const policyLinks = [
    { href: "/privacy-policy", label: "Privacy policy" },
    { href: "/terms", label: "Terms & conditions" },
    { href: "/return-policy", label: "Return policy" },
    { href: "/shipping-policy", label: "Shipping policy" },
  ];

  const socials = [
    { href: STORE_SETTINGS.socials.facebook, icon: Facebook, label: "Facebook" },
    { href: STORE_SETTINGS.socials.instagram, icon: Instagram, label: "Instagram" },
    { href: STORE_SETTINGS.socials.youtube, icon: Youtube, label: "YouTube" },
    { href: STORE_SETTINGS.socials.tiktok, icon: Music2, label: "TikTok" },
  ].filter((social) => Boolean(social.href));

  return (
    <footer className="relative overflow-hidden bg-midnight text-ivory">
      <JamdaniField id="footer-jamdani" color="var(--color-saffron)" opacity={0.08} size={62} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-royal/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 left-0 h-96 w-96 rounded-full bg-rosewood/10 blur-3xl" />

      <div className="container-wide relative py-9 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.9fr_0.75fr] lg:gap-10">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" aria-label="Bengalot home" className="inline-block">
              <Logo tone="light" />
            </Link>
            <p className="mt-4 max-w-[300px] text-[13px] leading-relaxed text-ivory/60">
              {footerContent.tagline || "Premium fashion from Bengal."} Considered clothing,
              footwear, bags and accessories, delivered across Bangladesh.
            </p>

            <div className="mt-5 space-y-2.5 text-[13px]">
              <p className="flex items-start gap-2.5 text-ivory/65">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                {SITE.address}
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 text-ivory/65 transition hover:text-gold"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                {SITE.email}
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-ivory/65 transition hover:text-gold"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 text-gold" />
                {SITE.whatsapp}
              </a>
            </div>

            {socials.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-8 w-8 place-items-center rounded-full border border-ivory/15 text-ivory/60 transition hover:border-gold hover:text-gold"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {t("footer.shop")}
            </h3>
            <ul className="space-y-2.5">
              {departments.map((department) => (
                <li key={department.slug}>
                  <Link
                    href={`/${department.slug}`}
                    className="group flex items-center gap-1 text-[13px] text-ivory/60 transition hover:text-ivory"
                  >
                    {department.name}
                    <ArrowUpRight className="h-2.5 w-2.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/collections/new-arrivals"
                  className="text-[13px] text-ivory/60 transition hover:text-ivory"
                >
                  New arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {t("footer.help")}
            </h3>
            <ul className="space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-ivory/60 transition hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {t("footer.company")}
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-ivory/60 transition hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mb-3.5 mt-6 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {t("footer.policies")}
            </h3>
            <ul className="space-y-2.5">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-ivory/60 transition hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-5 border-t border-ivory/10 pt-5 lg:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <SealStamp
              className="stamp-spin shrink-0 opacity-70"
              size={78}
              text={`${STORE_SETTINGS.sealText.toUpperCase()} · `}
            />
            <p className="order-2 text-center text-xs leading-relaxed text-ivory/55 sm:order-1 lg:text-left">
              © {new Date().getFullYear()} Bengalot. Managed By Masters Computer
              <br />
              {footerContent.note || "Saltha, Faridpur, Bangladesh"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {STORE_SETTINGS.codEnabled && (
              <span className="flex items-center gap-1.5 rounded-full border border-ivory/12 px-3 py-1.5 text-xs font-semibold text-ivory/70">
                <Banknote className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> Cash on Delivery
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border border-ivory/12 px-3 py-1.5 text-xs font-semibold text-ivory/70">
              <Truck className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              {deliveryNotice()}
            </span>
          </div>
        </div>

        <AlponaDivider className="my-4 opacity-30" />
      </div>

      {/* Full white wordmark at the foot of the footer. */}
      <div className="relative flex justify-center px-5 pb-8 pt-2">
        <Image
          src="/brand/logo-full.png"
          alt="Bengalot"
          width={900}
          height={276}
          sizes="(min-width: 768px) 420px, 70vw"
          className="h-auto w-full max-w-[420px] object-contain brightness-0 invert"
        />
      </div>
      <div className="h-16 bg-midnight md:h-0" aria-hidden="true" />
    </footer>
  );
}
