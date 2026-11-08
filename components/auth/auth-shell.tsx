import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream">
      <div className="container-wide grid min-h-[calc(100dvh-10rem)] gap-10 py-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-stretch lg:py-10">
        <div className="flex flex-col justify-center">
          <Link
            href="/"
            className="mb-8 inline-flex w-fit items-center gap-2 text-[0.64rem] font-extrabold uppercase tracking-[0.12em] text-muted transition-colors hover:text-teal"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to Bengalot
          </Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-xl mt-4 max-w-[11ch] text-ink">{title}</h1>
          <p className="mt-4 max-w-[25rem] text-[0.9rem] leading-[1.75] text-ink-soft">
            {description}
          </p>
          <div className="mt-8 max-w-[26rem]">{children}</div>
        </div>

        <div className="relative hidden overflow-hidden rounded-[2rem] bg-teal-deep p-8 text-cream lg:flex lg:flex-col lg:justify-between">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(247,241,228,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(247,241,228,.7) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-cream/15"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-12 left-10 size-32 rounded-full bg-coral/25 blur-[40px]"
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between">
            <span className="text-[0.58rem] font-extrabold uppercase tracking-[0.16em] text-cream/70">
              The Bengalot library
            </span>
            <div className="flex items-center gap-0.5 text-butter" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="size-3 fill-current" />
              ))}
            </div>
          </div>

          <div className="relative my-8 flex justify-center">
            <div className="relative h-64 w-48">
              <div className="absolute inset-0 -rotate-[12deg] rounded-2xl border border-white/15 bg-butter" />
              <div className="absolute inset-0 rotate-[6deg] rounded-2xl border border-white/15 bg-coral" />
              <div className="absolute inset-0 flex -rotate-[3deg] flex-col justify-between overflow-hidden rounded-2xl border border-white/30 bg-[#ffffff] p-5 text-ink shadow-[-20px_30px_60px_-20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <span className="text-[0.45rem] font-extrabold uppercase tracking-[0.16em] text-muted">
                    Study cards
                  </span>
                  <span className="size-1.5 rounded-full bg-coral" />
                </div>
                <p className="font-display text-[2.35rem] italic leading-[0.9] tracking-[-0.05em]">
                  seren-
                  <br />
                  dipity
                </p>
                <div>
                  <div className="h-px bg-line" />
                  <p className="mt-2 text-[0.5rem] leading-relaxed text-muted">
                    Turn the card. Say the meaning before you check.
                  </p>
                </div>
                <span className="text-[0.5rem] font-bold uppercase tracking-[0.15em] text-muted">
                  Bengalot · 01 / 120
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="font-display text-[2rem] leading-[1.05] tracking-[-0.04em]">
              “Keep the useful thing close.”
            </p>
            <p className="mt-3 max-w-[18rem] text-[0.75rem] leading-relaxed text-cream/70">
              Your orders, digital resources and profile in one quiet place.
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-cream/10 pt-4">
              <span className="grid size-8 place-items-center rounded-full bg-cream/10 font-display text-sm">
                B
              </span>
              <span className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-cream/40">
                Bring a lot to learning
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

