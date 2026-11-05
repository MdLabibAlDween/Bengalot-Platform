"use client";

import { useEffect } from "react";

type TawkConfig = {
  enabled?: boolean;
  propertyId?: string;
  widgetId?: string;
};

let requested = false;

/**
 * Tawk.to live chat. The widget loads in-page and opens as a chat panel, not a
 * pop-up window. The config is fetched at runtime so enabling or disabling the
 * integration in Admin -> Integrations takes effect without a rebuild.
 */
export function TawkChat() {
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (requested) return;
      requested = true;
      try {
        const response = await fetch("/api/site-config", { cache: "no-store" });
        if (!response.ok) return;
        const config = (await response.json()) as { tawk?: TawkConfig };
        const tawk = config.tawk ?? {};
        const propertyId = String(tawk.propertyId ?? "").replace(/[^A-Za-z0-9]/g, "");
        const widgetId = String(tawk.widgetId ?? "").replace(/[^A-Za-z0-9]/g, "");
        if (cancelled || !tawk.enabled || !propertyId || !widgetId) return;
        if (document.getElementById("tawk-embed-script")) return;

        document.documentElement.dataset.tawk = "on";
        const api = ((window as typeof window & { Tawk_API?: Record<string, unknown> }).Tawk_API ??= {});
        api.customStyle = {
          visibility: {
            desktop: { position: "br", xOffset: 24, yOffset: 24 },
            mobile: { position: "br", xOffset: 16, yOffset: 90 },
          },
        };
        (window as typeof window & { Tawk_LoadStart?: Date }).Tawk_LoadStart = new Date();

        const script = document.createElement("script");
        script.id = "tawk-embed-script";
        script.async = true;
        script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
        script.charset = "UTF-8";
        document.head.appendChild(script);
      } catch {
        // Chat is an enhancement; the storefront keeps working if it is blocked.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
