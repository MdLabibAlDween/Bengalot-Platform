import {
  BadgeCheck,
  Banknote,
  MessageCircle,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/storefront/section-heading";
import { getWhyCards, SECTION_COPY } from "@/lib/homepage";

const icons: Record<string, LucideIcon> = {
  cod: Banknote,
  quality: BadgeCheck,
  delivery: Truck,
  support: MessageCircle,
};

const tones = ["var(--color-indigo)", "var(--color-magenta)", "var(--color-gold-ink)", "var(--color-teal)"];

export function WhyBengalot() {
  const cards = getWhyCards();
  if (cards.length === 0) return null;
  const copy = SECTION_COPY.why;

  return (
    <section className="bg-[var(--color-sand)] py-12 md:py-20 lg:py-24">
      <div className="container-luxe">
        <SectionHeading
        contentKey="why"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = icons[card.icon] ?? BadgeCheck;
            const tone = tones[index % tones.length];
            return (
              <article
                key={card.id}
                className="flex min-h-[200px] flex-col rounded-[22px] border border-white/80 bg-[var(--color-surface)] p-4 shadow-[0_18px_44px_-36px_rgba(36,26,80,0.34)] sm:min-h-[220px] sm:p-5"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-full border"
                  style={{
                    color: tone,
                    borderColor: `color-mix(in srgb, ${tone} 18%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${tone} 6%, transparent)`,
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <p className="mt-5 font-display text-[2.4rem] leading-none text-[var(--color-ink)]">
                  {card.value}
                </p>
                <p
                  className="mt-1 text-xs font-bold uppercase tracking-[0.1em]"
                  style={{ color: tone }}
                >
                  {card.label}
                </p>
                <div className="my-4 h-px w-full bg-[var(--color-border)]" />
                <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">{card.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-muted-foreground)]">{card.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
