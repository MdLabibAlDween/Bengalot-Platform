import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ProductArt } from "@/components/brand/product-art";
import { JamdaniField, SealStamp, Sparkle } from "@/components/brand/ornaments";
import { SearchForm } from "@/components/storefront/search-form";
import { departments } from "@/lib/data";

export function NotFoundView() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface-2)]">
      <JamdaniField id="notfound-pattern" color="var(--color-saffron)" opacity={0.12} size={62} />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-rosewood/[0.07] blur-[100px]" />
      <div className="container-luxe relative grid min-h-[68vh] items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="eyebrow text-indigo">404 · Page not found</p>
          <p className="display-1 mt-4 text-[8rem] leading-[0.8] text-indigo/90 sm:text-[12rem]">
            404
          </p>
          <h1 className="display-3 mt-5">
            This page has <span className="italic text-gold-ink">wandered off.</span>
          </h1>
          <p className="mt-4 max-w-md text-[0.86rem] leading-relaxed text-muted-foreground">
            The link may be old, the piece may have sold out, or a small typo may have crept
            in. Let&apos;s get you back to something beautiful.
          </p>
          <div className="mt-6 max-w-md">
            <SearchForm />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {departments.map((department) => (
              <Link
                key={department.slug}
                href={`/${department.slug}`}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-gold hover:text-gold-ink"
              >
                {department.name}
              </Link>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/"
              className="cta-primary group flex h-12 items-center gap-3 rounded-full px-6 text-[0.62rem] font-bold uppercase tracking-[0.12em]"
            >
              Back home <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop"
              className="flex h-12 items-center gap-2 rounded-full border border-[var(--line-strong)] px-6 text-[0.62rem] font-bold uppercase tracking-[0.14em] transition hover:border-gold hover:text-gold-ink"
            >
              Browse the house
            </Link>
            <Link
              href="/search"
              className="flex h-12 items-center gap-2 rounded-full border border-[var(--line-strong)] px-6 text-[0.62rem] font-bold uppercase tracking-[0.14em] transition hover:border-gold hover:text-gold-ink"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="relative overflow-hidden rounded-[200px_200px_24px_24px] border border-gold/25 shadow-[0_40px_90px_-40px_rgba(20,10,40,0.4)]">
            <div className="aspect-[4/5]">
              <ProductArt
                id="notfound-art"
                art="saree"
                palette={["var(--color-indigo)", "var(--color-magenta)"]}
                showCaption={false}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/65 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-indigo">
                Still here
              </p>
              <p className="mt-1 font-display text-2xl text-ivory">The good pieces are.</p>
            </div>
          </div>
          <SealStamp
            size={104}
            className="stamp-spin absolute -left-6 top-6 opacity-80"
            text="BENGALOT · SALTHA · FARIDPUR · "
          />
          <Sparkle className="absolute -right-2 top-8" size={18} />
        </div>
      </div>
    </section>
  );
}
