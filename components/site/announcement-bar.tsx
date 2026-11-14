import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { getPageContent } from "@/lib/page-content.server";

const toneStyles = {
  navy: "bg-navy text-cream",
  teal: "bg-teal text-cream",
  coral: "bg-coral text-cream",
  butter: "bg-butter text-ink",
};

const accentStyles = {
  navy: "text-butter",
  teal: "text-butter",
  coral: "text-butter",
  butter: "text-ink",
};

export async function AnnouncementBar() {
  const { announcement } = await getPageContent();
  if (!announcement.enabled) return null;

  const hasLink = Boolean(announcement.ctaLabel && announcement.ctaHref);

  return (
    <aside
      aria-label="Store announcement"
      className={toneStyles[announcement.tone]}
    >
      <p className="sr-only">{announcement.desktopText}</p>
      <div className="container-wide flex min-h-9 items-center justify-center gap-3 py-2">
        <span
          className={`size-1.5 shrink-0 rounded-full ${
            announcement.tone === "butter" ? "bg-ink" : "bg-butter"
          }`}
          aria-hidden="true"
        />
        <p
          className={`text-center text-[0.58rem] font-bold uppercase tracking-[0.13em] ${
            announcement.tone === "butter" ? "text-ink/80" : "text-cream/80"
          }`}
          aria-hidden="true"
        >
          <span className="hidden sm:inline">{announcement.desktopText}</span>
          <span className="sm:hidden">{announcement.mobileText}</span>
        </p>
        {hasLink ? (
          <Link
            href={announcement.ctaHref}
            className={`hidden shrink-0 items-center gap-1 text-[0.56rem] font-bold uppercase tracking-[0.11em] transition-colors md:flex ${
              accentStyles[announcement.tone]
            } ${announcement.tone === "butter" ? "hover:text-coral" : "hover:text-cream"}`}
          >
            {announcement.ctaLabel}
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
