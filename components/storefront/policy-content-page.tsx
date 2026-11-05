import { getStoreProfile } from "@/lib/admin/settings";
import { SITE } from "@/lib/constants";
import { STORE_SETTINGS } from "@/lib/settings";
import { getSiteContent } from "@/lib/site-content";
import type { PolicyKey } from "@/lib/policies";
import { FREE_DELIVERY_ENABLED, FREE_DELIVERY_THRESHOLD, formatBDT } from "@/lib/utils";
import { PolicyPage } from "@/components/storefront/policy-page";
import { PolicySectionBody } from "@/components/storefront/policy-section-body";

export async function PolicyContentPage({ policyKey }: { policyKey: PolicyKey }) {
  const [content, profile] = await Promise.all([getSiteContent(), getStoreProfile()]);
  const policy = content.policies[policyKey];
  const values = {
    email: profile.supportEmail || SITE.email,
    whatsapp: profile.whatsapp || SITE.whatsapp,
    deliveryInside: formatBDT(profile.deliveryInside),
    deliveryOutside: formatBDT(profile.deliveryOutside),
    freeThreshold: FREE_DELIVERY_ENABLED
      ? formatBDT(FREE_DELIVERY_THRESHOLD)
      : "the threshold shown at checkout",
    exchangeWindow:
      STORE_SETTINGS.exchangeWindowEnabled && STORE_SETTINGS.exchangeWindowDays > 0
        ? String(STORE_SETTINGS.exchangeWindowDays)
        : "7",
  };

  return (
    <PolicyPage
      eyebrow={policy.eyebrow}
      title={policy.title}
      shortTitle={policy.shortTitle}
      description={policy.description}
      updated={policy.updated || STORE_SETTINGS.policyUpdated}
      needsReview={false}
      sections={policy.sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: <PolicySectionBody section={section} values={values} />,
      }))}
    />
  );
}
