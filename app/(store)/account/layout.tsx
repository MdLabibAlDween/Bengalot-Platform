import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { LogoutButton } from "@/components/account/logout-button";
import { requireUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/account";
import { initials } from "@/lib/utils";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUser("/account");
  const snapshot = await getAccountSnapshot(user.id);
  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "learner";
  const isStaff =
    profile?.role === "staff" ||
    profile?.role === "admin" ||
    profile?.role === "owner";
  const hue = profile?.avatar_hue ?? 24;

  return (
    <div className="relative overflow-hidden bg-ivory">
      <div
        className="pointer-events-none absolute -right-32 top-10 size-[26rem] rounded-full border border-line/70"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-10 size-[22rem] rounded-full bg-lavender/30 blur-[80px]"
        aria-hidden="true"
      />
      <div className="container-wide relative pb-20 pt-10 sm:pt-12">
        <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-cream font-display text-xl text-ink shadow-md sm:size-16"
              style={{ backgroundColor: `hsl(${hue} 58% 80%)` }}
              aria-hidden="true"
            >
              {initials(name)}
            </span>
            <div>
              <p className="eyebrow">My account</p>
              <h1 className="mt-1.5 font-display text-[2rem] leading-none tracking-[-0.04em] text-ink sm:text-[2.5rem]">
                Hello, {name.split(" ")[0]}.
              </h1>
              <p className="mt-1.5 text-[0.7rem] text-muted">{profile?.email ?? user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{snapshot.orderCount} orders</span>
            <span className="chip !border-teal/20 !bg-teal-soft/40 !text-teal">
              {snapshot.libraryCount} in library
            </span>
            {isStaff ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-cream transition-colors hover:bg-teal"
              >
                Studio
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-[5.4rem]">
            <div className="rounded-[1.4rem] border border-line bg-cream p-3 shadow-[0_24px_50px_-42px_rgba(21,34,50,0.4)]">
              <AccountNav libraryCount={snapshot.libraryCount} />
              <div className="mt-3 hidden border-t border-line pt-3 lg:block">
                <div className="rounded-xl bg-teal p-3.5 text-cream">
                  <p className="flex items-center gap-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-butter-soft">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Need a hand?
                  </p>
                  <p className="mt-1.5 text-[0.68rem] leading-relaxed text-cream/85">
                    If an access link stops working, we reset it for you.
                  </p>
                  <a
                    href="https://wa.me/8801341739202"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.09em] text-butter-soft"
                  >
                    <MessageCircle className="size-3" aria-hidden="true" />
                    WhatsApp
                  </a>
                </div>
                <div className="mt-3 flex items-center justify-between px-2">
                  <Link
                    href="/shop"
                    className="text-[0.62rem] font-semibold text-ink-soft transition-colors hover:text-teal"
                  >
                    Back to shop
                  </Link>
                  <LogoutButton />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between px-2 lg:hidden">
              <Link
                href="/shop"
                className="text-[0.64rem] font-semibold text-ink-soft"
              >
                Back to shop
              </Link>
              <LogoutButton />
            </div>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
