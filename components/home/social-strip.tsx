import Image from "next/image";
import { ArrowUpRight, Instagram } from "lucide-react";
import { SectionHeading } from "@/components/storefront/section-heading";
import { getSocialStrip, SECTION_COPY } from "@/lib/homepage";

export function SocialStrip() {
  const social = getSocialStrip();
  if (!social) return null;
  const copy = SECTION_COPY.social;

  return (
    <section className="bg-[var(--color-ivory)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
        contentKey="social"
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
          {social.accountUrl && (
            <a
              href={social.accountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-fit items-center gap-2.5 rounded-full border border-[var(--color-border)] bg-white/45 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] transition hover:border-[var(--color-ink)] hover:bg-white"
            >
              <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
              {social.accountLabel || "Follow along"}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            </a>
          )}
        </div>

        {social.posts.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {social.posts.slice(0, 10).map((post, index) => (
              <a
                key={post.id}
                href={post.href || social.accountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-sand)] ${
                  index === 0 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.alt}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-midnight/40 text-ivory opacity-0 backdrop-blur transition group-hover:opacity-100">
                  <Instagram className="h-3 w-3" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
