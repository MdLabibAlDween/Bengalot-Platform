import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { NotFoundView } from "@/components/site/not-found-view";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)]">
        <div className="container-luxe flex h-[72px] items-center justify-between">
          <Link href="/" aria-label="Bengalot home">
            <Logo priority />
          </Link>
          <Link
            href="/shop"
            className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition hover:text-gold"
          >
            Shop the house
          </Link>
        </div>
      </header>
      <NotFoundView />
      <footer className="border-t border-[var(--border)] py-6 text-center text-[0.56rem] uppercase tracking-[0.16em] text-muted-foreground">
        © {new Date().getFullYear()} Bengalot · Saltha, Faridpur · Online only
      </footer>
    </div>
  );
}
