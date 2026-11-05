import Link from "next/link";
import { ArrowLeft, Gift, ImageIcon, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { JamdaniField } from "@/components/brand/ornaments";

const highlights = [
  { icon: LayoutDashboard, text: "Homepage sections, order and visibility" },
  { icon: ImageIcon, text: "Every artwork and image slot" },
  { icon: Gift, text: "Physical and virtual gift cards" },
  { icon: ShieldCheck, text: "Role-based staff access and audit logs" },
];

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-[var(--color-ink)] p-10 text-ivory lg:flex lg:flex-col lg:justify-between xl:p-14">
        <JamdaniField
          id="admin-auth-pattern"
          color="var(--color-saffron)"
          opacity={0.09}
          size={62}
        />
        <div className="pointer-events-none absolute -right-32 top-16 h-[420px] w-[420px] rounded-full bg-magenta/20 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-indigo/40 blur-[100px]" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <Logo className="h-10 w-auto" tone="light" priority />
            <span className="rounded-full border border-saffron/30 bg-saffron/10 px-2.5 py-1 text-[0.48rem] font-bold uppercase tracking-[0.16em] text-saffron">
              Control room
            </span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="flex items-center gap-3 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-saffron">
            <span className="h-px w-7 bg-saffron" /> Bengalot admin
          </p>
          <p className="mt-4 font-display text-[clamp(2.6rem,4vw,4rem)] leading-[0.96] text-balance">
            Every corner,
            <br />
            in one <span className="italic text-saffron">room.</span>
          </p>
          <p className="mt-4 max-w-sm text-[0.84rem] leading-relaxed text-ivory/60">
            Manage the storefront, catalogue artwork, homepage order, gift cards, redirects,
            invoices and integrations without touching code.
          </p>
          <ul className="mt-7 space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[0.74rem] text-ivory/70">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-ivory/15 bg-white/5 text-saffron">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-[0.55rem] uppercase tracking-[0.14em] text-ivory/30">
          <span>Saltha · Faridpur</span>
          <span>bengalot.com</span>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col bg-[var(--color-sand)]">
        <div className="flex items-center justify-between px-5 py-5 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo className="h-8 w-auto" priority />
            <span className="text-[0.48rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Admin
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Store
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
