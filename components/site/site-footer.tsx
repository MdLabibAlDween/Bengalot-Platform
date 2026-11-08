import {
  ArrowUpRight,
  Mail,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

import { Logo, LogoMark } from "@/components/brand/logo";
import { FooterNewsletter } from "@/components/site/footer-newsletter";
import type { Category } from "@/lib/types";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.2-1.5 1.5-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.2V10H8.6v3h2.7v8h3.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="m10.2 9.4 4.6 2.6-4.6 2.6V9.4Z" fill="currentColor" />
    </svg>
  );
}

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="relative overflow-hidden bg-navy text-cream">
      <div
        className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full border border-cream/[0.06]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-10 size-[22rem] rounded-full bg-teal/20 blur-[90px]"
        aria-hidden="true"
      />

      <div className="container-wide relative z-10 grid gap-12 pb-16 pt-16 sm:pt-20 lg:grid-cols-[1.15fr_0.72fr_0.72fr_1.2fr] lg:gap-10">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-5 max-w-[19rem] text-[0.86rem] leading-[1.7] text-cream/55">
            Thoughtful tools for study, focus and the long game. Designed in
            Bangladesh, made to be used every day.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {[
              { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
              { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
              { href: "https://youtube.com", label: "YouTube", Icon: YoutubeIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-9.5 place-items-center rounded-full border border-cream/15 text-cream/65 transition-all hover:border-butter/50 hover:text-butter"
              >
                <Icon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cream/70">
            Collections
          </p>
          <ul className="mt-4 space-y-2.5">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop/${category.slug}`}
                  className="text-[0.82rem] text-cream/70 transition-colors hover:text-butter"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-[0.82rem] font-semibold text-butter"
              >
                Shop everything
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cream/70">
            Help
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              { href: "/journal", label: "The journal" },
              { href: "/about", label: "Our story" },
              { href: "/faq", label: "FAQ" },
              { href: "/contact", label: "Contact" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.82rem] text-cream/70 transition-colors hover:text-butter"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-cream/10 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <FooterNewsletter />
          <div className="mt-6 space-y-2 border-t border-cream/10 pt-5 text-[0.78rem] text-cream/75">
            <a
              href="mailto:support@bengalot.com"
              className="flex items-center gap-2 transition-colors hover:text-butter"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              support@bengalot.com
            </a>
            <a
              href="https://wa.me/8801341739202"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-butter"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" />
              WhatsApp 01341739202
            </a>
          </div>
        </div>
      </div>

      <div className="container-wide relative z-10 flex flex-col gap-4 border-t border-cream/10 py-6 text-[0.65rem] text-cream/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Bengalot · Saltha, Faridpur, Bangladesh</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cream/15 px-2.5 py-1">
            Cash on delivery
          </span>
          <span className="rounded-full border border-cream/15 px-2.5 py-1">
            bKash
          </span>
          <span className="rounded-full border border-cream/15 px-2.5 py-1">
            Digital access
          </span>
        </div>
        <Link
          href="#top"
          className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.1em] text-cream/70 transition-colors hover:text-butter"
        >
          Back to top
          <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-4 z-0 rotate-[-8deg] opacity-[0.09] lg:right-16"
      >
        <LogoMark size={340} />
      </div>
    </footer>
  );
}
