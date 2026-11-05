import { Mail } from "lucide-react";
import { JamdaniField } from "@/components/brand/ornaments";
import { NewsletterForm } from "@/components/storefront/newsletter-form";
import { STORE_SETTINGS } from "@/lib/settings";

export function NewsletterSection() {
  const copy = STORE_SETTINGS.newsletter;
  if (!copy.enabled) return null;

  const accentIndex = copy.heading.indexOf(copy.accent);
  const title =
    accentIndex >= 0 ? (
      <>
        {copy.heading.slice(0, accentIndex)}
        <span className="italic text-[var(--color-gold-ink)]">{copy.accent}</span>
        {copy.heading.slice(accentIndex + copy.accent.length)}
      </>
    ) : (
      copy.heading
    );

  return (
    <section className="bg-[var(--color-ivory)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <div className="relative overflow-hidden rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-9 shadow-[0_28px_70px_-52px_rgba(36,26,80,0.4)] sm:px-9 lg:px-12 lg:py-11">
          <JamdaniField id="newsletter-pattern" color="var(--color-saffron)" opacity={0.07} size={58} />
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--color-magenta)]/[0.06] blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_0.95fr] lg:gap-12">
            <div>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-indigo)]">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--color-border)]">
                  <Mail className="h-3.5 w-3.5 text-saffron" aria-hidden="true" />
                </span>
                {copy.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.04] text-[var(--color-ink)]">
                {title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {copy.body}
              </p>
              {copy.note && (
                <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">{copy.note}</p>
              )}
            </div>

            <div className="lg:pl-2">
              <NewsletterForm buttonLabel={copy.buttonLabel} tone="light" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
