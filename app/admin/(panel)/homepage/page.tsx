import Link from "next/link";
import { ArrowUpRight, Eye, LayoutTemplate } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { HomepageBuilder } from "@/components/admin/homepage-builder";
import { HOMEPAGE_SECTIONS } from "@/lib/homepage";
import { reels as demoReels } from "@/lib/reels";
import { getHomepageControl, type HomepageControl } from "@/lib/admin/settings";

export default async function AdminHomepagePage() {
  const stored = await getHomepageControl();
  const fallback: HomepageControl = {
    sections: HOMEPAGE_SECTIONS.map((section) => ({
      key: section.key,
      label: section.label,
      enabled: section.enabled,
      sort: section.sort,
    })),
    reels: demoReels.map((reel) => ({
      id: reel.id,
      title: reel.title,
      caption: reel.caption,
      platform: reel.platform,
      videoUrl: reel.videoUrl,
      watchUrl: reel.watchUrl,
      posterUrl: reel.posterUrl,
      productSlug: reel.productSlug,
      status: reel.status,
      sort: reel.sort,
    })),
  };
  const initial: HomepageControl = {
    sections: stored.sections.length > 0 ? stored.sections : fallback.sections,
    reels: stored.reels.length > 0 ? stored.reels : fallback.reels,
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Storefront"
        title="Homepage"
        description="Reorder every section, turn sections off, and attach Instagram or YouTube reels without a deploy."
      >
        <Link
          href="/"
          target="_blank"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[0.58rem] font-bold uppercase tracking-[0.1em]"
        >
          Preview home <ArrowUpRight className="h-3 w-3" />
        </Link>
      </AdminPageHeader>

      <div className="mb-4 flex items-start gap-3 rounded-[18px] border border-indigo/15 bg-indigo/[0.04] p-4 text-[0.66rem] leading-relaxed text-muted-foreground">
        <LayoutTemplate className="mt-0.5 h-4 w-4 shrink-0 text-indigo" />
        <p>
          The storefront falls back to its built-in section defaults if this table is empty.
          Saving here overrides the order and visibility immediately. The hero copy, product
          selection and section headings stay in the content bridge until the full page copy
          editor is connected.
        </p>
        <Eye className="ml-auto hidden h-4 w-4 shrink-0 text-indigo/50 sm:block" />
      </div>

      <HomepageBuilder initial={initial} />
    </div>
  );
}
