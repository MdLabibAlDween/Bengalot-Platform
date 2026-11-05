import Link from "next/link";
import { ArrowLeft, BadgeCheck, Truck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ProductArt } from "@/components/brand/product-art";
import { Grain, JamdaniField, SealStamp, Sparkle } from "@/components/brand/ornaments";
import { SITE } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(150deg,var(--color-indigo)_0%,var(--color-magenta)_55%,var(--color-magenta)_100%)] p-10 text-ivory lg:flex lg:flex-col lg:justify-between xl:p-14">
        <JamdaniField id="auth-panel" color="var(--color-saffron)" opacity={0.13} size={64} />
        <Grain />
        <div className="pointer-events-none absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-rosewood/15 blur-[110px]" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-royal/30 blur-[100px]" />

        <div className="relative">
          <Link href="/" aria-label="Bengalot home">
            <Logo tone="light" priority />
          </Link>
        </div>

        <div className="relative my-8">
          <div className="relative mx-auto h-[390px] w-full max-w-[430px]">
            <div className="absolute left-[4%] top-[8%] w-[36%] -rotate-6 overflow-hidden rounded-2xl border border-gold/25 shadow-2xl">
              <div className="aspect-[3/4]">
                <ProductArt
                  id="auth-art-a"
                  art="kurti"
                  palette={["var(--color-magenta)", "var(--color-magenta-luminous)"]}
                  showCaption={false}
                  showMonogram={false}
                />
              </div>
            </div>
            <div className="absolute right-[2%] top-[2%] w-[40%] rotate-6 overflow-hidden rounded-2xl border border-gold/30 shadow-2xl">
              <div className="aspect-[3/4]">
                <ProductArt
                  id="auth-art-b"
                  art="panjabi"
                  palette={["var(--color-indigo)", "var(--color-indigo-luminous)"]}
                  showCaption={false}
                  showMonogram={false}
                />
              </div>
            </div>
            <div className="absolute bottom-[2%] left-[24%] z-10 w-[50%] -rotate-2 overflow-hidden rounded-2xl border border-gold/25 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
              <div className="aspect-[3/4]">
                <ProductArt
                  id="auth-art-c"
                  art="jute"
                  palette={["var(--color-terracotta)", "var(--color-terracotta)"]}
                  showCaption={false}
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/85 to-transparent p-4 pt-10">
                <p className="font-display text-lg text-ivory">Golden Hour Jute Tote</p>
              </div>
            </div>
            <Sparkle className="absolute right-0 top-[46%]" size={18} />
            <SealStamp
              size={108}
              className="stamp-spin absolute -left-2 bottom-[10%] opacity-80"
              text="BENGALOT · HOUSE OF CRAFT · SALTHA · FARIDPUR · "
            />
          </div>

          <div className="mx-auto mt-6 max-w-[420px] text-center">
            <p className="font-display text-2xl leading-snug text-ivory/90">
              “A wardrobe should feel like a <span className="italic text-gold">keepsake.</span>”
            </p>
            <p className="mt-2 text-[0.52rem] font-semibold uppercase tracking-[0.22em] text-ivory/30">
              The Bengalot atelier
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-5 border-t border-ivory/10 pt-5 text-[0.54rem] font-semibold uppercase tracking-[0.14em] text-ivory/35">
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="h-3.5 w-3.5 text-gold" /> Cash on delivery
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-gold" /> Delivery across Bangladesh
          </span>
          <span className="ml-auto">{SITE.addressShort}</span>
        </div>
      </aside>

      {/* Form panel */}
      <div className="relative flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 lg:border-0 lg:px-8 lg:py-6">
          <Link href="/" className="lg:hidden">
            <Logo priority />
          </Link>
          <Link
            href="/"
            className="ml-auto flex items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.13em] text-muted-foreground transition hover:text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
        <div className="border-t border-[var(--border)] px-5 py-4 text-center text-[0.55rem] text-muted-foreground lg:border-0">
          © {new Date().getFullYear()} Bengalot · Saltha, Faridpur · Online only
        </div>
      </div>
    </div>
  );
}
