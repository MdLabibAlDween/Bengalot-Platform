import type { Metadata } from "next";

import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getCurrentUser } from "@/lib/auth";
import { getCatalog } from "@/lib/data/catalog";
import { isZinipayConfigured } from "@/lib/zinipay";

export const metadata: Metadata = {
  title: "Checkout",
  description: "A calm, clear checkout for Bengalot study tools.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [catalog, current] = await Promise.all([getCatalog(), getCurrentUser()]);

  return (
    <CheckoutClient
      settings={catalog.settings}
      zinipayEnabled={isZinipayConfigured()}
      user={
        current?.user
          ? {
              email: current.user.email ?? "",
              name:
                current.profile?.full_name ??
                current.user.email?.split("@")[0] ??
                "",
            }
          : null
      }
    />
  );
}
