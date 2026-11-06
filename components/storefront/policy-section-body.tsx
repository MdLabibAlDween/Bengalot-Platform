import { Fragment } from "react";
import { EmailText } from "@/components/site/email-display";
import type { PolicySection } from "@/lib/policies";

function fill(text: string, values: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}

function fillNode(text: string, values: Record<string, string>) {
  const filled = fill(text, values);
  const email = values.email;
  if (!email || !filled.includes(email)) return filled;
  const parts = filled.split(email);
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <EmailText email={email} fallback="our support team" />
      )}
    </Fragment>
  ));
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
        <p key={`p-${index}`}>{fillNode(paragraph, values)}</p>
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
              <p className="mt-1 text-[0.7rem] text-muted-foreground">{fillNode(card.note, values)}</p>
            </div>
          ))}
        </div>
      )}
      {section.bullets.length > 0 && (
        <ul>
          {section.bullets.map((bullet, index) => (
            <li key={`b-${index}`}>{fillNode(bullet, values)}</li>
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
