import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { BundleCard } from "@/components/bundle/bundle-card";
import { BundleArt } from "@/components/bundle/bundle-art";
import { JamdaniField, SealStamp } from "@/components/brand/ornaments";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { Reveal } from "@/components/storefront/reveal";
import { getBundlePricing } from "@/lib/bundles";
import { getStoreBundles } from "@/lib/taxonomy-db";
import { departments, getDepartment } from "@/lib/data";
import { SITE } from "@/lib/constants";
import { formatBDT } from "@/lib/utils";

export function generateStaticParams() {
  return departments.map((department) => ({ department: department.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string }>;
}): Promise<Metadata> {
  const { department: slug } = await params;
  const department = getDepartment(slug);
  if (!department) return { title: "Bundles not found" };
  return {
    title: `${department.name} Bundles — Complete outfits`,
    description: `Complete ${department.name.toLowerCase()}'s outfits from Bengalot. Choose a size and color for every piece and save on the set.`,
    alternates: { canonical: `${SITE.url}/${department.slug}/bundles` },
  };
}

export default async function DepartmentBundlesPage({
  params,
}: {
  params: Promise<{ department: string }>;
}) {
  const { department: slug } = await params;
  const department = getDepartment(slug);
  if (!department) notFound();
  const bundles = await getStoreBundles(department.slug);
  const maxSaving = Math.max(
    0,
    ...bundles.map((bundle) => getBundlePricing(bundle).savings)
  );

  return (
    <>
      <section
        className="relative overflow-hidden text-ivory"
        style={{
          background: `linear-gradient(140deg, ${department.accentDeep} 0%, ${department.accent} 120%)`,
        }}
      >
        <JamdaniField
          id={`bundles-hero-${department.slug}`}
          color="var(--color-saffron)"
          opacity={0.14}
          size={64}
        />
        <div className="container-luxe relative py-10 md:py-14">
          <Breadcrumbs
            items={[
              { label: department.name, href: `/${department.slug}` },
              { label: "Bundles" },
            ]}
            light
          />
          <div className="mt-7 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow flex items-center gap-3 text-indigo">
                <span className="h-px w-8 bg-gold" /> Complete outfits
              </p>
              <h1 className="display-2 mt-3">
                {department.name} <span className="italic text-gold">bundles.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[0.86rem] leading-relaxed text-ivory/55">
                Ready-made looks from the {department.name.toLowerCase()} department. Pick
                your size and color for every piece, add the complete outfit in one go, and
                save on the set.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-ivory/45">
                <span className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-gold" /> {bundles.length}{" "}
                  {bundles.length === 1 ? "complete outfit" : "complete outfits"}
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold" /> Save up to{" "}
                  {formatBDT(maxSaving)}
                </span>
              </div>
            </div>
            {bundles[0] && (
              <div className="relative hidden w-[230px] overflow-hidden rounded-[130px_130px_20px_20px] border border-gold/25 lg:block">
                <div className="aspect-[4/5]">
                  <BundleArt bundle={bundles[0]} className="h-full w-full" />
                </div>
                <SealStamp
                  size={82}
                  className="stamp-spin absolute -bottom-5 -left-5 opacity-80"
                  text="BENGALOT · COMPLETE OUTFITS · "
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-luxe py-14 md:py-20">
        {bundles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle, index) => (
              <Reveal key={bundle.slug} delay={index * 0.05}>
                <BundleCard bundle={bundle} />
              </Reveal>
            ))}
            <Reveal delay={0.1}>
              <div className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6">
                <JamdaniField
                  id={`bundle-help-${department.slug}`}
                  color="var(--color-magenta)"
                  opacity={0.07}
                  size={42}
                />
                <div className="relative">
                  <p className="eyebrow text-indigo">Need a hand?</p>
                  <h2 className="mt-3 font-display text-[1.8rem] leading-tight">
                    Not sure about a size?
                  </h2>
                  <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
                    Send us your usual sizes and we will help you put the complete look
                    together. A real person will reply.
                  </p>
                </div>
                <div className="relative flex flex-wrap gap-2">
                  <Link
                    href="/contact"
                    className="flex h-10 items-center gap-2 rounded-full bg-midnight px-4 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-ivory transition hover:bg-royal"
                  >
                    Ask the atelier <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/${department.slug}`}
                    className="flex h-10 items-center rounded-full border border-[var(--border)] px-4 text-[0.55rem] font-bold uppercase tracking-[0.1em] transition hover:border-gold"
                  >
                    Shop all {department.name}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        ) : (
          <div className="mx-auto max-w-xl rounded-[24px] border border-dashed border-[var(--line-strong)] px-6 py-16 text-center">
            <Layers className="mx-auto h-8 w-8 text-gold/60" strokeWidth={1.3} />
            <h2 className="mt-4 font-display text-3xl">Complete outfits, soon.</h2>
            <p className="mx-auto mt-3 max-w-sm text-[0.8rem] leading-relaxed text-muted-foreground">
              We are still putting the finishing touches on this department&apos;s bundles.
              In the meantime, explore the full collection piece by piece.
            </p>
            <Link
              href={`/${department.slug}`}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-midnight px-5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ivory"
            >
              Shop {department.name} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
