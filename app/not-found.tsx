import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { NotFoundContent } from "@/components/site/not-found-content";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-cream">
      <header className="container-wide flex h-20 items-center justify-between border-b border-line">
        <Logo />
        <Link
          href="/shop"
          className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-teal"
        >
          Shop all tools
        </Link>
      </header>
      <NotFoundContent />
    </div>
  );
}
