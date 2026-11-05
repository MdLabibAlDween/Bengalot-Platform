import type { PolicySection } from "@/lib/policies";

function fill(text: string, values: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}

export function PolicySectionBody({
  section,
  values,
}: {
  section: PolicySection;
  values: Record<string, string>;
}) {
  return (
    <>
      {section.paragraphs.map((paragraph, index) => (
        <p key={`p-${index}`}>{fill(paragraph, values)}</p>
      ))}
      {section.cards && section.cards.length > 0 && (
        <div className="not-prose mt-4 grid gap-3 sm:grid-cols-2">
          {section.cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold">
                {card.label}
              </p>
              <p className="mt-1 font-display text-3xl">{fill(card.value, values)}</p>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">{fill(card.note, values)}</p>
            </div>
          ))}
        </div>
      )}
      {section.bullets.length > 0 && (
        <ul>
          {section.bullets.map((bullet, index) => (
            <li key={`b-${index}`}>{fill(bullet, values)}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export function policyValues(input: {
  email: string;
  whatsapp: string;
  deliveryInside: string;
  deliveryOutside: string;
  freeThreshold: string;
  exchangeWindow: string;
}) {
  return input;
}
