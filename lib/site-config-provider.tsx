"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Bundle, Category } from "@/lib/types";

export type SiteConfig = {
  features: Record<string, boolean>;
  pages: Record<string, boolean>;
  content?: Record<string, unknown>;
  catalog?: {
    categories: Category[];
    bundles: Bundle[];
    loaded?: boolean;
  };
  rewardsEnabled?: boolean;
  tawk: { enabled: boolean; propertyId: string; widgetId: string };
  profile: {
    brandName: string;
    whatsapp: string;
    supportEmail: string;
    infoEmail: string;
    deliveryInside: number;
    deliveryOutside: number;
  };
  giftCards: {
    enabled: boolean;
    mode: "physical" | "virtual";
    virtualEnabled: boolean;
    denominations: number[];
    minAmount: number;
    maxAmount: number;
    expiryMonths: number;
    deliveryMethods: string[];
  };
  media: Record<string, string>;
};

const defaults: SiteConfig = {
  features: {
    giftCards: false,
    reels: true,
    lookbook: true,
    offers: true,
    reviews: true,
    wishlist: true,
    whatsapp: true,
    newsletter: true,
  },
  pages: {},
  rewardsEnabled: false,
  tawk: { enabled: false, propertyId: "", widgetId: "" },
  profile: {
    brandName: "Bengalot",
    whatsapp: "01341739202",
    supportEmail: "support@bengalot.com",
    infoEmail: "info@bengalot.com",
    deliveryInside: 70,
    deliveryOutside: 130,
  },
  giftCards: {
    enabled: false,
    mode: "physical",
    virtualEnabled: false,
    denominations: [1000, 2000, 5000, 10000],
    minAmount: 500,
    maxAmount: 50000,
    expiryMonths: 12,
    deliveryMethods: ["whatsapp", "email"],
  },
  content: {},
  media: {},
  catalog: { categories: [], bundles: [], loaded: false },
};

const SiteConfigContext = createContext<SiteConfig>(defaults);

export function SiteConfigProvider({
  value,
  children,
}: {
  value: Partial<SiteConfig>;
  children: ReactNode;
}) {
  return (
    <SiteConfigContext.Provider
      value={{
        ...defaults,
        ...value,
        features: { ...defaults.features, ...value.features },
        profile: { ...defaults.profile, ...value.profile },
        giftCards: { ...defaults.giftCards, ...value.giftCards },
        content: value.content ?? {},
        media: value.media ?? {},
        pages: value.pages ?? {},
        catalog: value.catalog ?? defaults.catalog,
        rewardsEnabled: value.rewardsEnabled ?? false,
        tawk: value.tawk ?? defaults.tawk,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
