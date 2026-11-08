import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { MaskedLine, Reveal } from "@/components/motion/reveal";
import { ProductArt } from "@/components/product/product-art";
import type { Category, Product } from "@/lib/types";
import { isLightHex } from "@/lib/color";
import { cn } from "@/lib/utils";

const layouts: Record<
  string,
  {
    span: string;
    height: string;
    align: "start" | "end";
    index: string;
    fullBleed?: boolean;
    artClass?: string;
    productSlug: string;
  }
> = {
  "notion-templates": {
    span: "md:col-span-7",
    height: "min-h-[25rem] md:min-h-[31rem]",
    align: "end",
    index: "01",
    fullBleed: true,
    productSlug: "notion-student-os",
  },
  "study-cards": {
    span: "md:col-span-5",
    height: "min-h-[25rem] md:min-h-[31rem]",
    align: "start",
    index: "02",
    artClass:
      "right-[-15%] bottom-[-13%] h-[63%] w-[70%] sm:h-[66%] sm:w-[64%] rotate-[-9deg]",
    productSlug: "english-vocabulary-cards",
  },
  "printed-planners": {
    span: "md:col-span-4",
    height: "min-h-[20rem] md:min-h-[22.5rem]",
    align: "end",
    index: "03",
    artClass:
      "right-[-9%] top-[-11%] h-[64%] w-[64%] rotate-[8deg]",
    productSlug: "exam-focus-planner",
  },
  "focus-productivity": {
    span: "md:col-span-4",
    height: "min-h-[20rem] md:min-h-[22.5rem]",
    align: "start",
    index: "04",
    artClass:
      "right-[-16%] bottom-[-18%] h-[72%] w-[62%] rotate-[6deg]",
    productSlug: "bengalot-focus-timer",
  },
  bundles: {
    span: "md:col-span-4",
    height: "min-h-[20rem] md:min-h-[22.5rem]",
    align: "end",
    index: "05",
    artClass:
      "right-[-9%] top-[-9%] h-[58%] w-[62%] rotate-[7deg]",
    productSlug: "student-starter-bundle",
  },
};

export function CategoryBento({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  return (
    <section id="categories" className="section-pad relative overflow-hidden bg-ivory">
      <div
        className="pointer-events-none absolute right-0 top-1/4 size-[30rem] translate-x-1/2 rounded-full border border-line/70"
        aria-hidden="true"
      />
      <div className="container-wide relative">
        <div className="grid gap-7 lg:grid-cols-[1fr_0.46fr] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">Find your way in</p>
            </Reveal>
            <h2 className="display-xl mt-4 max-w-[17ch] text-ink">
              <MaskedLine>Five rooms.</MaskedLine>
              <MaskedLine delay={0.08}>
                <span className="display-italic text-teal">One clearer mind.</span>
              </MaskedLine>
            </h2>
          </div>
          <Reveal delay={0.15} className="lg:pb-2">
            <p className="max-w-sm text-[0.92rem] leading-[1.75] text-ink-soft">
              Start with the way you like to work. Every collection is made to
              stand on its own — and to fit neatly beside the others.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center gap-2 border-b border-ink/20 pb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-ink transition-colors hover:border-teal hover:text-teal"
            >
              Browse all 10 tools
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:mt-12 md:grid-cols-12">
          {categories.map((category, position) => {
            const layout = layouts[category.slug] ?? layouts.bundles;
            const product =
              products.find((item) => item.slug === layout?.productSlug) ??
              products.find((item) => item.category_slug === category.slug);
            const darkText = !isLightHex(category.theme.ink);

            return (
              <Reveal
                key={category.id}
                delay={position * 0.06}
                className={cn(layout?.span, layout?.height, "min-w-0")}
              >
                <Link
                  href={`/shop/${category.slug}`}
                  className="group relative flex h-full min-h-[inherit] w-full flex-col overflow-hidden rounded-[1.55rem] border border-ink/5 p-6 shadow-[0_20px_50px_-38px_rgba(21,34,50,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-32px_rgba(21,34,50,0.4)] sm:p-7"
                  style={{
                    backgroundColor: category.theme.from,
                    backgroundImage: layout?.fullBleed
                      ? undefined
                      : `linear-gradient(145deg, ${category.theme.from} 0%, ${category.theme.to} 160%)`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 dot-paper opacity-[0.16] mix-blend-soft-light"
                    aria-hidden="true"
                  />

                  {layout?.fullBleed && product ? (
                    <>
                      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.035]">
                        <ProductArt product={product} showCaption={false} />
                      </div>
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `linear-gradient(10deg, ${category.theme.from}FC 5%, ${category.theme.from}B8 36%, ${category.theme.from}10 78%)`,
                        }}
                        aria-hidden="true"
                      />
                    </>
                  ) : null}

                  {!layout?.fullBleed && product ? (
                    <div
                      className={cn(
                        "pointer-events-none absolute overflow-hidden rounded-[1.1rem] border border-white/45 shadow-[0_24px_46px_-24px_rgba(21,34,50,0.5)] transition-transform duration-700 ease-out group-hover:rotate-0 group-hover:scale-[1.025]",
                        layout?.artClass,
                      )}
                    >
                      <ProductArt product={product} showCaption={false} />
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "relative z-10 flex h-full w-full flex-col",
                      layout?.align === "end"
                        ? "justify-between"
                        : "justify-start",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.54rem] font-extrabold uppercase tracking-[0.14em] backdrop-blur-sm"
                        style={{
                          borderColor: darkText
                            ? "rgba(19,42,42,0.16)"
                            : "rgba(247,242,231,0.22)",
                          color: darkText
                            ? "rgba(19,42,42,0.72)"
                            : "rgba(247,242,231,0.78)",
                          backgroundColor: darkText
                            ? "rgba(253,249,240,0.42)"
                            : "rgba(16,28,42,0.16)",
                        }}
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: category.theme.accent }}
                        />
                        {category.tagline}
                      </span>
                      <span
                        className="font-display text-[2.15rem] italic leading-none tracking-[-0.04em]"
                        style={{
                          color: darkText
                            ? "rgba(19,42,42,0.22)"
                            : "rgba(247,242,231,0.35)",
                        }}
                      >
                        {layout?.index}
                      </span>
                    </div>

                    <div
                      className={cn(
                        layout?.align === "end" ? "mt-auto pt-14" : "mt-8",
                        !layout?.fullBleed && "max-w-[65%]",
                      )}
                    >
                      <h3
                        className={cn(
                          "font-display leading-[0.93] tracking-[-0.045em]",
                          category.slug === "notion-templates"
                            ? "max-w-[12ch] text-[2.6rem] sm:text-[3.5rem]"
                            : "max-w-[13ch] text-[1.65rem] sm:text-[2rem]",
                        )}
                        style={{ color: category.theme.ink }}
                      >
                        {category.name}
                      </h3>
                      <p
                        className="mt-2.5 max-w-[30ch] text-[0.72rem] leading-[1.6] sm:text-[0.78rem]"
                        style={{
                          color: darkText
                            ? "rgba(19,42,42,0.66)"
                            : "rgba(247,242,231,0.68)",
                        }}
                      >
                        {category.description}
                      </p>
                      <span
                        className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.56rem] font-extrabold uppercase tracking-[0.12em] transition-all duration-300 group-hover:gap-3"
                        style={{
                          borderColor: darkText
                            ? "rgba(19,42,42,0.2)"
                            : "rgba(247,242,231,0.25)",
                          color: category.theme.ink,
                          backgroundColor: darkText
                            ? "rgba(253,249,240,0.45)"
                            : "rgba(16,28,42,0.18)",
                        }}
                      >
                        Explore
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

