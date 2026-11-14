import { ArrowUpRight, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { LogoMark } from "@/components/brand/logo";
import { requireStaff } from "@/lib/auth";
import { initials } from "@/lib/utils";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireStaff("/admin");
  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "Studio";
  const isOwner = profile?.role === "owner";

  return (
    <div className="min-h-dvh bg-ivory">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[15.5rem] flex-col bg-navy p-4 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(247,241,228,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(247,241,228,.7) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2.5 px-2 py-2">
          <LogoMark size={30} inverted />
          <div>
            <p className="font-display text-[1.25rem] leading-none tracking-[-0.04em] text-cream">
              Bengalot
            </p>
            <p className="mt-1 text-[0.46rem] font-bold uppercase tracking-[0.18em] text-cream/35">
              The studio
            </p>
          </div>
        </div>

        <div className="relative mt-8 flex-1">
          <p className="px-3 pb-2 text-[0.5rem] font-bold uppercase tracking-[0.16em] text-cream/25">
            Workspace
          </p>
          <AdminNav />
          <div className="mx-3 mt-6 rounded-xl border border-cream/10 bg-cream/[0.04] p-3.5">
            <p className="flex items-center gap-1.5 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-butter">
              <Sparkles className="size-3" aria-hidden="true" />
              Owner note
            </p>
            <p className="mt-1.5 text-[0.62rem] leading-relaxed text-cream/40">
              Promotions on the homepage are edited from the Promotions page.
            </p>
            <Link
              href="/admin/promotions"
              className="mt-2.5 inline-flex items-center gap-1 text-[0.56rem] font-bold uppercase tracking-[0.08em] text-cream/70 hover:text-butter"
            >
              Edit banners
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative border-t border-cream/10 pt-4">
          <div className="flex items-center gap-2.5 px-2">
            <span
              className="grid size-8 place-items-center rounded-full text-[0.58rem] font-extrabold text-ink"
              style={{ backgroundColor: `hsl(${profile?.avatar_hue ?? 24} 58% 78%)` }}
              aria-hidden="true"
            >
              {initials(name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.68rem] font-semibold text-cream">{name}</p>
              <p className="text-[0.52rem] capitalize text-cream/35">
                {profile?.role ?? "staff"}
                {isOwner ? " · owner" : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between px-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[0.64rem] font-semibold text-cream/40 transition-colors hover:text-cream"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              View shop
            </Link>
            <AdminSignOut />
          </div>
        </div>
      </aside>

      <div className="lg:pl-[15.5rem]">
        <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <LogoMark size={26} />
              <span className="font-display text-[1.15rem] tracking-[-0.03em] text-ink">
                Bengalot
              </span>
            </Link>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="size-1.5 rounded-full bg-teal" />
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.13em] text-muted">
                Bengalot studio · {new Date().toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" })}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.6rem] font-bold text-ink-soft transition-colors hover:border-teal hover:text-teal sm:flex"
              >
                <ExternalLink className="size-3" aria-hidden="true" />
                View shop
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3">
                <span
                  className="grid size-6 place-items-center rounded-full text-[0.5rem] font-extrabold text-ink"
                  style={{ backgroundColor: `hsl(${profile?.avatar_hue ?? 24} 58% 78%)` }}
                  aria-hidden="true"
                >
                  {initials(name)}
                </span>
                <span className="max-w-24 truncate text-[0.62rem] font-semibold text-ink-soft">
                  {name}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-line px-4 py-2 lg:hidden">
            <AdminNav variant="mobile" />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
