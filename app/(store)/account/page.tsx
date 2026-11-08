import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Package,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";

import { ProductArt } from "@/components/product/product-art";
import { requireUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/account";
import { orderStatusMeta } from "@/lib/order-status";
import { formatDate, formatMoney, initials } from "@/lib/utils";

function AccessLink({
  accessUrl,
  label,
  title,
}: {
  accessUrl: string | null;
  label: string;
  title: string;
}) {
  if (accessUrl) {
    return (
      <a
        href={accessUrl}
        target={accessUrl.startsWith("http") ? "_blank" : undefined}
        rel={accessUrl.startsWith("http") ? "noopener noreferrer" : undefined}
        className="btn btn-primary btn-sm"
      >
        {label}
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={`https://wa.me/8801341739202?text=${encodeURIComponent(`Hello Bengalot, I would like my access link for ${title}.`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline btn-sm"
    >
      Request access
      <ArrowUpRight className="size-3.5" aria-hidden="true" />
    </a>
  );
}

export default async function AccountOverviewPage() {
  const { user, profile } = await requireUser("/account");
  const snapshot = await getAccountSnapshot(user.id);
  const latestEntitlement = snapshot.entitlements[0];
  const latestOrder = snapshot.orders[0];
  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "learner";

  const stats = [
    {
      icon: BookOpen,
      label: "In your library",
      value: snapshot.libraryCount,
      note: "Digital resources",
      tone: "bg-teal text-cream",
    },
    {
      icon: Package,
      label: "Orders",
      value: snapshot.orderCount,
      note: snapshot.activeOrderCount
        ? `${snapshot.activeOrderCount} on the way`
        : "All settled",
      tone: "bg-butter text-ink",
    },
    {
      icon: Sparkles,
      label: "Member since",
      value: new Date(profile?.created_at ?? user.created_at).getFullYear(),
      note: "A quiet habit",
      tone: "bg-lavender text-ink",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.2rem] border border-line bg-cream p-4"
          >
            <div className="flex items-start justify-between">
              <span
                className={`grid size-8 place-items-center rounded-full ${stat.tone}`}
              >
                <stat.icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-[0.55rem] font-bold uppercase tracking-[0.11em] text-muted">
                {stat.note}
              </span>
            </div>
            <p className="mt-4 font-display text-[2rem] leading-none tracking-[-0.04em] text-ink">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.09em] text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.36fr_0.64fr]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-[1.4rem] border border-line bg-cream">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-muted">
                  Your digital library
                </p>
                <h2 className="mt-1 font-display text-[1.45rem] tracking-[-0.03em] text-ink">
                  Pick up where you left off.
                </h2>
              </div>
              <Link
                href="/account/library"
                className="group hidden items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.09em] text-teal sm:flex"
              >
                All library
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {latestEntitlement ? (
              <div className="flex flex-col gap-5 p-5 sm:flex-row">
                <div className="relative aspect-[4/3.5] w-full shrink-0 overflow-hidden rounded-[1rem] sm:w-[11rem]">
                  {latestEntitlement.product ? (
                    <ProductArt product={latestEntitlement.product} showCaption={false} />
                  ) : (
                    <div className="h-full w-full bg-teal" />
                  )}
                  <span className="absolute left-2.5 top-2.5 rounded-full border border-cream/30 bg-cream/90 px-2 py-1 text-[0.5rem] font-extrabold uppercase tracking-[0.1em] text-ink">
                    Digital
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-teal">
                      Ready for you
                    </p>
                    <h3 className="mt-1 font-display text-[1.55rem] leading-tight tracking-[-0.03em] text-ink">
                      {latestEntitlement.title}
                    </h3>
                    <p className="mt-1.5 text-[0.7rem] leading-relaxed text-muted">
                      Added {formatDate(latestEntitlement.granted_at)} · Open
                      anytime, as often as you need.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    <AccessLink
                      accessUrl={latestEntitlement.access_url}
                      label={latestEntitlement.access_label}
                      title={latestEntitlement.title}
                    />
                    <span className="flex items-center gap-1.5 text-[0.6rem] font-medium text-muted">
                      <Check className="size-3 text-teal" aria-hidden="true" />
                      Access verified
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center px-5 py-12 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-teal-soft/50 text-teal">
                  <BookOpen className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-2xl text-ink">
                  Your library is waiting.
                </h3>
                <p className="mt-2 max-w-sm text-[0.74rem] leading-relaxed text-muted">
                  Digital tools appear here after payment is confirmed. Start
                  with the Student OS or a focus guide.
                </p>
                <Link href="/shop" className="btn btn-primary btn-sm mt-5">
                  Explore digital tools
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-[1.4rem] border border-line bg-cream p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-muted">
                  Order notes
                </p>
                <h2 className="mt-1 font-display text-[1.45rem] tracking-[-0.03em] text-ink">
                  Recently in motion.
                </h2>
              </div>
              <Link
                href="/account/orders"
                className="group flex items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.09em] text-teal"
              >
                All orders
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {latestOrder ? (
              <div className="mt-4 space-y-3">
                {snapshot.orders.slice(0, 2).map((order) => {
                  const meta = orderStatusMeta[order.status];
                  return (
                    <Link
                      key={order.id}
                      href="/account/orders"
                      className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-line-strong"
                    >
                      <div className="min-w-0">
                        <p className="text-[0.78rem] font-semibold text-ink">
                          {order.order_number}
                        </p>
                        <p className="mt-0.5 text-[0.62rem] text-muted">
                          {formatDate(order.created_at)} · {order.order_items.length}{" "}
                          {order.order_items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[0.54rem] font-extrabold uppercase tracking-[0.08em] ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                        <span className="price text-[0.8rem] font-semibold text-ink">
                          {formatMoney(order.total)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-line-strong p-6 text-center">
                <p className="text-[0.78rem] text-muted">
                  No orders yet. Your first one will appear here.
                </p>
                <Link href="/shop" className="btn btn-outline btn-sm mt-4">
                  Visit the shop
                </Link>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="relative overflow-hidden rounded-[1.4rem] bg-teal p-5 text-cream">
            <div
              className="pointer-events-none absolute inset-0 dot-paper opacity-15"
              aria-hidden="true"
            />
            <div className="relative">
              <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.14em] text-butter-soft">
                A note for the week
              </p>
              <p className="mt-4 font-display text-[1.65rem] leading-[1.06] tracking-[-0.035em]">
                “Make learning more intentional. Make productivity more
                meaningful.”
              </p>
              <p className="mt-4 border-t border-cream/15 pt-3 text-[0.62rem] leading-relaxed text-cream/80">
                The Bengalot point of view, for the desk.
              </p>
            </div>
          </section>

          <section className="rounded-[1.4rem] border border-line bg-cream p-5">
            <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Your details
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span
                className="grid size-10 place-items-center rounded-full font-display text-sm text-ink"
                style={{ backgroundColor: `hsl(${profile?.avatar_hue ?? 24} 58% 80%)` }}
                aria-hidden="true"
              >
                {initials(name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.76rem] font-semibold text-ink">
                  {profile?.full_name ?? name}
                </p>
                <p className="truncate text-[0.62rem] text-muted">{profile?.email}</p>
              </div>
            </div>
            <Link
              href="/account/profile"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.09em] text-teal"
            >
              Edit my profile
              <ArrowRight className="size-3" />
            </Link>
          </section>

          <section className="rounded-[1.4rem] border border-line bg-ivory p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-coral/10 text-coral">
                <MessageCircleIcon />
              </span>
              <div>
                <p className="text-[0.68rem] font-bold text-ink">Need something?</p>
                <p className="text-[0.6rem] text-muted">A real person replies.</p>
              </div>
            </div>
            <a
              href="https://wa.me/8801341739202"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[0.64rem] font-semibold text-ink-soft transition-colors hover:border-teal hover:text-teal"
            >
              WhatsApp support
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/account/orders"
              className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2.5 text-[0.62rem] font-semibold text-ink-soft transition-colors hover:border-teal"
            >
              <Truck className="size-3.5 text-teal" aria-hidden="true" />
              Track order
            </Link>
            <Link
              href="/account/library"
              className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2.5 text-[0.62rem] font-semibold text-ink-soft transition-colors hover:border-teal"
            >
              <BookOpen className="size-3.5 text-teal" aria-hidden="true" />
              Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.7 8.7 0 0 1-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
