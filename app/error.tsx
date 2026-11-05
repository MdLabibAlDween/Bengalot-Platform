"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import { JamdaniField } from "@/components/brand/ornaments";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-2)] px-5">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-xl">
        <JamdaniField id="error-pattern" color="var(--color-magenta)" opacity={0.09} size={42} />
        <div className="relative">
          <p className="eyebrow text-indigo">Something went wrong</p>
          <h1 className="display-3 mt-3">
            A small <span className="italic text-gold-ink">snag.</span>
          </h1>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-muted-foreground">
            We hit an unexpected error while preparing this page. It is not you — please try
            again, or head back home.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="cta-primary flex h-11 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
            <Link
              href="/"
              className="flex h-11 items-center gap-2 rounded-full border border-[var(--line-strong)] px-5 text-[0.6rem] font-bold uppercase tracking-[0.12em] transition hover:border-gold"
            >
              <Home className="h-3.5 w-3.5" /> Back home
            </Link>
          </div>
          {error.digest && (
            <p className="mt-5 text-[0.52rem] text-muted-foreground/60">
              Error reference: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
