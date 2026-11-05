import type { Metadata } from "next";
import { PolicyContentPage } from "@/components/storefront/policy-content-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description:
    "The terms that apply when you shop with Bengalot. Plain language, fair conditions.",
  alternates: { canonical: `${SITE.url}/terms` },
};

export default function TermsPage() {
  return <PolicyContentPage policyKey="terms" />;
}
