import type { Metadata } from "next";
import { PolicyContentPage } from "@/components/storefront/policy-content-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Bengalot collects, uses and protects your personal data. No selling, no unnecessary data, no noise.",
  alternates: { canonical: `${SITE.url}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return <PolicyContentPage policyKey="privacy" />;
}
