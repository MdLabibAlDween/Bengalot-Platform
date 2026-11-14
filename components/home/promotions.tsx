import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { ProductArt } from "@/components/product/product-art";
import type { Product, Promotion } from "@/lib/types";

function isLight(hex: string) {
  const clean = hex.replace("#", "");
  const value =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

export function PromotionSection({
  promotions,
  products,
}: {
  promotions: Promotion[];
  products: Product[];
}) {
  if (!promotions.length) return null;

  return (
    <section id="promotions" className="section-pad relative overflow-hidden bg-ivory">
      <div
        className="pointer-events-none absolute -left-32 bottom-0 size-[28rem] rounded-full bg-lavender/25 blur-[70px]"
        aria-hidden="true"
      />
      <div className="container-wide relative">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal>
              <p className="eyebrow">A little push, gently</p>
            </Reveal>
            <h2 className="display-xl mt-4 max-w-[15ch] text-ink">
              <MaskedLine>Good reasons</MaskedLine>
              <MaskedLine delay={0.08}>
                <span className="display-italic text-teal">to begin.</span>
              </MaskedLine>
            </h2>
          </div>
          <Reveal delay={0.12} className="sm:pb-2">
            <p className="max-w-[19rem] text-[0.88rem] leading-[1.7] text-ink-soft">
              Seasonal pairings and small invitations. Every banner here is
              edited in the Bengalot admin, not buried in code.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-3.5 lg:grid-cols-12">
          {promotions.map((promotion, index) => {
            const product =
              products.find((item) => item.art_key === promotion.art_key) ??
              products[0];
            const surface = promotion.theme?.surface ?? "#0d6f6d";
            const ink = promotion.theme?.ink ?? "#ffffff";
            const accent = promotion.theme?.accent ?? "#f3c95f";
            const image = promotion.theme?.image ?? "";
            const light = isLight(surface);
            const wide = index === 0;

            return (
              <Reveal
                key={promotion.id}
                delay={index * 0.08}
                className={wide ? "lg:col-span-7" : "lg:col-span-5"}
              >
                <article
                  className={`group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.7rem] border p-6 shadow-[0_26px_60px_-42px_rgba(21,34,50,0.5)] sm:min-h-[24rem] sm:p-8 ${
                    wide ? "lg:min-h-[27rem]" : ""
                  }`}
                  style={{
                    backgroundColor: surface,
                    borderColor: light
                      ? "rgba(21,34,50,0.1)"
                      : "rgba(247,241,228,0.12)",
                    color: ink,
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    aria-hidden="true"
                    style={{
                      backgroundImage: `radial-gradient(${ink} 0.7px, transparent 0.7px)`,
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border"
                    style={{ borderColor: `${ink}22` }}
                    aria-hidden="true"
                  />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <span
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.14em]"
                      style={{
                        borderColor: `${ink}28`,
                        color: ink,
                        backgroundColor: `${ink}12`,
                      }}
                    >
                      <Sparkles className="size-3" style={{ color: accent }} aria-hidden="true" />
                      {promotion.eyebrow}
                    </span>
                    <span
                      className="font-display text-[2rem] italic leading-none opacity-30"
                      aria-hidden="true"
                    >
                      0{index + 1}
                    </span>
                  </div>

                  <div
                    className={`relative z-10 mt-6 flex flex-1 flex-col ${wide ? "max-w-[65%] sm:max-w-[58%]" : "max-w-[88%]"}`}
                  >
                    <h3
                      className="font-display text-[2rem] leading-[0.95] tracking-[-0.04em] sm:text-[2.5rem]"
                      style={{ color: ink }}
                    >
                      {promotion.title}
                    </h3>
                    <p
                      className="mt-3 max-w-[30ch] text-[0.78rem] leading-[1.65] sm:text-[0.84rem]"
                      style={{ color: `${ink}bb` }}
                    >
                      {promotion.description}
                    </p>
                    <Link
                      href={promotion.cta_href}
                      className="group/cta mt-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-[0.66rem] font-extrabold uppercase tracking-[0.11em] transition-transform hover:-translate-y-0.5"
                      style={{
                        backgroundColor: light ? "#101c2a" : accent,
                        color: light ? "#ffffff" : "#101c2a",
                      }}
                    >
                      {promotion.cta_label}
                      <ArrowRight className="size-3.5 transition-transform group-hover/cta:translate-x-1" />
                    </Link>
                  </div>

                  {image || product ? (
                    <div
                      className={`pointer-events-none absolute z-0 ${
                        wide
                          ? "-bottom-6 -right-4 h-[78%] w-[43%] rotate-[6deg] sm:-right-2 sm:h-[84%] sm:w-[40%]"
                          : "-bottom-10 -right-8 h-[48%] w-[58%] rotate-[-5deg]"
                      }`}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[1.35rem] border border-white/30 shadow-[0_28px_50px_-20px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:rotate-[2deg] group-hover:scale-[1.03]">
                        {image ? (
                          <Image
                            src={image}
                            alt={promotion.title}
                            fill
                            sizes="(max-width: 1024px) 60vw, 30vw"
                            className="object-cover"
                          />
                        ) : product ? (
                          <ProductArt product={product} showCaption={false} />
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

