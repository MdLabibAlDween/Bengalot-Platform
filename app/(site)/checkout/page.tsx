import type { Metadata } from "next";
import { CheckoutView } from "@/components/storefront/checkout-view";
import { getFeatureFlags } from "@/lib/admin/settings";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Bengalot order with cash on delivery.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const features = await getFeatureFlags();
  return <CheckoutView giftCardsEnabled={features.giftCards} />;
}
