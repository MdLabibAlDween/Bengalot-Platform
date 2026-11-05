import type { Metadata } from "next";
import { PolicyContentPage } from "@/components/storefront/policy-content-page";
import { getStoreProfile } from "@/lib/admin/settings";
import { SITE } from "@/lib/constants";
import { formatBDT } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getStoreProfile();
  return {
    title: "Shipping & delivery",
    description: `Bengalot delivery charges — ${formatBDT(profile.deliveryInside)} inside Faridpur, ${formatBDT(profile.deliveryOutside)} elsewhere in Bangladesh. Cash on delivery, tracked with Steadfast.`,
    alternates: { canonical: `${SITE.url}/shipping-policy` },
  };
}

export default function ShippingPolicyPage() {
  return <PolicyContentPage policyKey="shipping" />;
}
