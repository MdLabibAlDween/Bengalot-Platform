"use client";

import { BadgeCheck, Banknote, MessageCircle, Truck } from "lucide-react";
import { STORE_SETTINGS } from "@/lib/settings";
import { useSiteConfig } from "@/lib/site-config-provider";

const icons = [Banknote, BadgeCheck, Truck, MessageCircle];

export function TrustStrip() {
  const { content } = useSiteConfig();
  const customItems = (content?.home as { trust?: { items?: string[] } } | undefined)?.trust?.items;
  const items = (customItems?.length ? customItems : STORE_SETTINGS.trustItems)
    .filter(Boolean)
    .slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-ivory)]">
      <div className="container-wide">
        <ul className="grid grid-cols-2 divide-x divide-[var(--color-border)] sm:grid-cols-4">
          {items.map((item, index) => {
            const Icon = icons[index] ?? BadgeCheck;
            return (
              <li
                key={item}
                className="flex items-center justify-center gap-2.5 px-3 py-4 text-center sm:justify-start sm:px-6"
              >
                <Icon className="h-4 w-4 shrink-0 text-[var(--color-gold-ink)]" strokeWidth={1.7} aria-hidden="true" />
                <span className="text-xs font-semibold text-[var(--color-ink)] sm:text-[13px]">
                  {item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
