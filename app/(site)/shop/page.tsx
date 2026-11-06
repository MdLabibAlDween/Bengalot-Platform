import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { DepartmentArt } from "@/components/brand/product-art";
import { JamdaniField, SealStamp } from "@/components/brand/ornaments";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { Reveal } from "@/components/storefront/reveal";
import { ShopCatalogue } from "@/components/storefront/shop-catalogue";
import {
  categoriesFor,
  departments,
} from "@/lib/data";
import { getStoreCatalogue } from "@/lib/catalog-db";
import { getMediaMap } from "@/lib/admin/settings";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

export const metadata: Metadata = {
  title: "Shop all departments",
  description:
    "Explore every Bengalot department — Men, Women, Kids, Footwear, Bags and Accessories. Premium fashion delivered across Bangladesh.",
  alternates: { canonical: `${SITE.url}/shop` },
};

const collections = [
  {
    title: "New Arrivals",
    subtitle: "Just landed",
    href: "/collections/new-arrivals",
    palette: ["var(--color-teal-luminous)", "var(--color-teal)"],
  },
  {
    title: "Selected Pieces",
    subtitle: "From the collection",
    href: "/collections/best-sellers",
    palette: ["var(--color-indigo)", "var(--color-gold-ink)"],
  },
  {
    title: "The Sale",
    subtitle: "Last pieces",
    href: "/collections/sale",
    palette: ["var(--color-magenta)", "var(--color-indigo)"],
  },
  {
    title: "Offers",
    subtitle: "Codes & campaigns",
    href: "/offers",
    palette: ["var(--color-indigo)", "var(--color-indigo-luminous)"],
  },
  {
    title: "Lookbook",
    subtitle: "Stories in color",
    href: "/lookbook",
    palette: ["var(--color-terracotta)", "var(--color-terracotta)"],
  },
];

export default async function ShopPage() {
  const [catalogue, media] = await Promise.all([
    getStoreCatalogue(),
    getMediaMap(),
  ]);
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)]">
        <JamdaniField id="shop-hero" color="var(--color-saffron)" opacity={0.1} size={64} />
        <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-rosewood/[0.07] blur-[100px]" />
        <div className="container-luxe relative py-10 md:py-14">
          <Breadcrumbs items={[{ label: "Shop" }]} />
          <div className="mt-7 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow flex items-center gap-3 text-indigo">
                <span className="h-px w-8 bg-saffron" /> The whole house
              </p>
              <h1 className="display-1 mt-4">
                Shop the <span className="italic text-gold-ink">house.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
                Six departments, one point of view. Browse the world of Bengalot by
                department — each with its own color, craft and character.
              </p>
            </div>
            <div className="hidden items-center gap-8 border-l border-[var(--border)] pl-8 lg:flex">
              <div>
                <p className="font-display text-3xl leading-none">06</p>
                <p className="mt-1 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Departments
                </p>
              </div>
              <div>
                <p className="font-display text-3xl leading-none">{catalogue.length}</p>
                <p className="mt-1 text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Pieces
                </p>
              </div>
              <div className="max-w-[170px]">
                <p className="text-[0.78rem] font-semibold leading-snug">
                  Delivery across Bangladesh
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cash on delivery available
                </p>
              </div>
              <SealStamp size={82} className="stamp-spin opacity-60" text="BENGALOT · SALTHA · FARIDPUR · " />
            </div>
          </div>
        </div>
      </section>

      <section className="container-luxe py-10 md:py-14">
        <div className="mb-3 flex items-center justify-between sm:hidden">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Swipe departments
          </p>
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-gold-ink">
            01 — 06
          </p>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-6">
          {departments.map((department, index) => {
            const count = catalogue.filter((product) => product.department === department.slug).length;
            const cats = categoriesFor(department.slug).slice(0, 2);
            const image =
              media[`department.${department.slug}`] || media[`department-${department.slug}`];
            return (
              <Reveal
                key={department.slug}
                delay={(index % 3) * 0.06}
                className="min-w-[78%] snap-center sm:min-w-0"
              >
                <Link
                  href={`/${department.slug}`}
                  className="group relative block overflow-hidden rounded-[18px] border border-white/10 shadow-[0_24px_50px_-38px_rgba(20,10,50,0.5)] transition-transform duration-500 hover:-translate-y-1"
                >
                  <div className="absolute inset-0">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={department.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <DepartmentArt
                        id={`shop-dept-${department.slug}`}
                        art={department.icon}
                        palette={department.heroPalette}
                        word={department.name.slice(0, 1)}
                      />
                    )}
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, ${department.accentDeep}05 0%, ${department.accentDeep}35 40%, ${department.accentDeep}F7 100%)`,
                    }}
                  />
                  <div className="relative flex min-h-[250px] flex-col justify-between p-4 text-ivory">
                    <div className="flex items-start justify-between">
                      <span className="text-[0.5rem] font-bold uppercase tracking-[0.18em] text-ivory/45">
                        0{index + 1} / 06
                      </span>
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-ivory/25 bg-ivory/10 backdrop-blur transition group-hover:border-gold group-hover:bg-gold group-hover:text-midnight">
                        <ArrowUpRight className="h-3 w-3 transition-transform group-hover:rotate-45" />
                      </span>
                    </div>
                    <div>
                      <p className="mb-1 text-[0.48rem] font-bold uppercase tracking-[0.16em] text-gold">
                        {count} pieces · {department.nameBn}
                      </p>
                      <h2 className="font-display text-[1.65rem] leading-none text-ivory">
                        {department.name}
                      </h2>
                      <p className="mt-1.5 line-clamp-2 text-[0.66rem] leading-relaxed text-ivory/55">
                        {department.tagline}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cats.map((c) => (
                          <span
                            key={c.slug}
                            className="rounded-full border border-ivory/15 bg-ivory/5 px-2 py-0.5 text-[0.46rem] uppercase tracking-[0.08em] text-ivory/60 backdrop-blur"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <ShopCatalogue catalogue={catalogue} />

      <section className="border-t border-[var(--border)] bg-[var(--surface-2)] py-10 md:py-14">
        <div className="container-luxe">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow flex items-center gap-3 text-indigo">
                <span className="h-px w-8 bg-saffron" /> Curated collections
              </p>
              <h2 className="display-3 mt-3">Beyond the departments.</h2>
            </div>
            <p className="max-w-sm text-[0.76rem] leading-relaxed text-muted-foreground">
              Seasonal selections, private offers and stories from the atelier.
            </p>
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            {collections.map((collection) => (
              <Link
                key={collection.title}
                href={collection.href}
                className="group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-4 text-ivory transition hover:-translate-y-1"
                style={{
                  background: `linear-gradient(145deg, ${collection.palette[0]}, ${collection.palette[1]})`,
                }}
              >
                <JamdaniField
                  id={`shop-collection-${collection.title.replace(/\s/g, "-")}`}
                  color="var(--color-saffron)"
                  opacity={0.15}
                  size={36}
                />
                <div className="relative flex items-start justify-between">
                  <span className="text-[0.5rem] font-bold uppercase tracking-[0.18em] text-gold">
                    {collection.subtitle}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-ivory/50 transition group-hover:text-gold" />
                </div>
                <div className="relative">
                  <h3 className="font-display text-[1.45rem] leading-tight text-ivory">
                    {collection.title}
                  </h3>
                  <span className="mt-2 flex items-center gap-2 text-[0.52rem] font-bold uppercase tracking-[0.14em] text-ivory/50 transition group-hover:text-gold">
                    Explore <span className="h-px w-6 bg-current" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-luxe py-14">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
              <Sparkles className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-display text-xl">Not sure where to start?</p>
              <p className="mt-1 max-w-md text-[0.75rem] leading-relaxed text-muted-foreground">
                Tell us the occasion, your size and your budget. We will help you find the
                right pieces on WhatsApp.
              </p>
            </div>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-[var(--color-jade)] px-5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--color-jade)]"
          >
            <WhatsAppIcon className="h-4 w-4" /> Ask the atelier
          </a>
        </div>
      </section>
    </>
  );
}
