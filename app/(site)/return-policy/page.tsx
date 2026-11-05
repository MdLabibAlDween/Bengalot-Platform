import type { Metadata } from "next";
import { PolicyContentPage } from "@/components/storefront/policy-content-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Returns & exchanges",
  description:
    "Bengalot returns and exchanges for unused pieces with tags intact. Contact support for the current policy and options.",
  alternates: { canonical: `${SITE.url}/return-policy` },
};

export default function ReturnPolicyPage() {
  return <PolicyContentPage policyKey="returns" />;
}
