import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBar() {
  return (
    <aside
      aria-label="Pre-launch announcement"
      className="bg-navy text-cream"
    >
      <p className="sr-only">
        Bengalot is in pre-launch. Our first study tools are being prepared. No
        products are on sale yet.
      </p>
      <div className="container-wide flex min-h-9 items-center justify-center gap-3 py-2">
        <span className="size-1.5 shrink-0 rounded-full bg-butter" aria-hidden="true" />
        <p
          className="text-center text-[0.58rem] font-bold uppercase tracking-[0.13em] text-cream/80"
          aria-hidden="true"
        >
          <span className="hidden sm:inline">
            Bengalot is in pre-launch · First study tools in preparation · No
            products on sale yet
          </span>
          <span className="sm:hidden">Pre-launch · first study tools in preparation</span>
        </p>
        <Link
          href="/contact"
          className="hidden shrink-0 items-center gap-1 text-[0.56rem] font-bold uppercase tracking-[0.11em] text-butter transition-colors hover:text-cream md:flex"
        >
          Ask us anything
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
