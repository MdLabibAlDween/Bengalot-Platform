import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Download,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import { ProductArt } from "@/components/product/product-art";
import { requireUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/account";
import { formatDate } from "@/lib/utils";

export default async function LibraryPage() {
  const { user } = await requireUser("/account/library");
  const snapshot = await getAccountSnapshot(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Private library</p>
          <h2 className="mt-2 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-ink sm:text-[2.6rem]">
            Your digital access.
          </h2>
          <p className="mt-3 max-w-[34rem] text-[0.8rem] leading-[1.7] text-muted">
            Files and Notion links are checked against your account on every
            open. If a link stops working, support will reset it for you.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-cream px-3.5 py-2 text-[0.62rem] font-semibold text-teal">
          <Check className="size-3.5" aria-hidden="true" />
          {snapshot.libraryCount} active {snapshot.libraryCount === 1 ? "resource" : "resources"}
        </div>
      </div>

      {snapshot.entitlements.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.entitlements.map((entitlement) => (
            <article
              key={entitlement.id}
              className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-line bg-cream"
            >
              <div className="relative aspect-[16/8] overflow-hidden">
                {entitlement.product ? (
                  <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.02]">
                    <ProductArt product={entitlement.product} showCaption={false} />
                  </div>
                ) : (
                  <div className="grid h-full place-items-center bg-teal text-cream">
                    <BookOpen className="size-8 opacity-40" />
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full border border-cream/25 bg-cream/90 px-2.5 py-1 text-[0.52rem] font-extrabold uppercase tracking-[0.1em] text-ink">
                  {entitlement.product?.type === "bundle"
                    ? "Bundle · digital"
                    : "Digital access"}
                </span>
                <span className="absolute right-3 top-3 rounded-full border border-cream/25 bg-ink/35 px-2.5 py-1 text-[0.52rem] font-bold text-cream/80 backdrop-blur">
                  Active
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-muted">
                    {entitlement.product?.format ?? "Digital resource"}
                  </p>
                  <h3 className="mt-1.5 font-display text-[1.45rem] leading-tight tracking-[-0.03em] text-ink">
                    {entitlement.title}
                  </h3>
                  <p className="mt-2 text-[0.7rem] leading-relaxed text-muted">
                    {entitlement.product?.subtitle ??
                      "A digital resource from your Bengalot library."}
                  </p>
                </div>
                <div className="mt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {entitlement.access_url ? (
                      <a
                        href={entitlement.access_url}
                        target={entitlement.access_url.startsWith("http") ? "_blank" : undefined}
                        rel={entitlement.access_url.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="btn btn-primary btn-sm"
                      >
                        {entitlement.access_label}
                        {entitlement.access_url.startsWith("http") ? (
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        ) : (
                          <Download className="size-3.5" aria-hidden="true" />
                        )}
                      </a>
                    ) : (
                      <a
                        href={`https://wa.me/8801341739202?text=${encodeURIComponent(`Hello Bengalot, I would like my access link for ${entitlement.title}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        Request access
                        <MessageCircle className="size-3.5" aria-hidden="true" />
                      </a>
                    )}
                    {entitlement.product ? (
                      <Link
                        href={`/product/${entitlement.product.slug}`}
                        className="text-[0.62rem] font-semibold text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-teal"
                      >
                        View product
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[0.56rem] text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3" aria-hidden="true" />
                      Added {formatDate(entitlement.granted_at)}
                    </span>
                    <span className="flex items-center gap-1.5 text-teal">
                      <LockKeyhole className="size-3" aria-hidden="true" />
                      Private to your account
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-line-strong bg-cream px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-soft/50 text-teal">
            <BookOpen className="size-6" aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-[1.8rem] tracking-[-0.03em] text-ink">
            The shelves are ready.
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[0.78rem] leading-relaxed text-muted">
            Digital resources appear here once payment is confirmed. Choose a
            template, planner or a complete bundle to begin.
          </p>
          <Link href="/shop" className="btn btn-primary mt-6">
            Explore digital tools
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: LockKeyhole,
            title: "Private by default",
            copy: "Only your account can open these links.",
          },
          {
            icon: RefreshCw,
            title: "Links kept alive",
            copy: "We check and reset broken access.",
          },
          {
            icon: MessageCircle,
            title: "Real support",
            copy: "Message us with your order number anytime.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex gap-3 rounded-xl border border-line bg-ivory p-4"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream text-teal">
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
  );
}
