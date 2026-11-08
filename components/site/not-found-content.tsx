import { ArrowRight, Compass, Sparkles } from "lucide-react";
import Link from "next/link";

export function NotFoundContent() {
  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-28">
      <div
        className="pointer-events-none absolute -right-20 top-10 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(243,201,95,0.3),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="container-wide relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow">404 · a small detour</p>
          <h1 className="display-xl mt-4 max-w-[11ch] text-ink">
            Lost in the{" "}
            <span className="display-italic text-coral">margin.</span>
          </h1>
          <p className="mt-5 max-w-[26rem] text-[0.94rem] leading-[1.8] text-ink-soft">
            The page you were looking for is not on this shelf. It may have
            moved, or the link may have picked up a stray character. The useful
            things are still close by.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/shop" className="btn btn-primary">
              Explore the shop
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/" className="btn btn-outline">
              Back home
            </Link>
          </div>
          <p className="mt-7 flex items-center gap-2 text-[0.66rem] text-muted">
            <Compass className="size-3.5 text-teal" aria-hidden="true" />
            Or try the search from the header — <kbd className="rounded border border-line-strong bg-surface px-1.5 py-0.5 text-[0.58rem]">/</kbd>
          </p>
        </div>

        <div className="relative mx-auto h-72 w-full max-w-[24rem]">
          <div className="absolute left-[8%] top-[14%] h-52 w-36 -rotate-[12deg] rounded-2xl border border-line bg-lavender" />
          <div className="absolute right-[4%] top-[6%] h-56 w-40 rotate-[9deg] rounded-2xl border border-line bg-butter" />
          <div className="absolute left-1/2 top-1/2 flex h-52 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-line bg-surface shadow-[0_30px_60px_-30px_rgba(21,34,50,0.4)]">
            <span className="font-display text-6xl italic leading-none text-teal/30">404</span>
            <span className="mt-2 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted">
              Page not found
            </span>
          </div>
          <span className="absolute -left-2 top-8 grid size-10 place-items-center rounded-full bg-coral text-cream shadow-lg">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </section>
  );
}
