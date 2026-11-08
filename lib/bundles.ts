/**
 * A physical bundle can include digital resources. These slugs are the
 * products that should be added to the customer's library when that bundle is
 * purchased.
 */
export const bundleDigitalComponents: Record<string, string[]> = {
  "student-starter-bundle": ["notion-student-os", "deep-work-study-guide"],
};

export function hasDigitalContent(item: { type: string; slug: string }) {
  if (item.type !== "physical") return true;
  return (bundleDigitalComponents[item.slug]?.length ?? 0) > 0;
}

export function getBundleDigitalComponents(slug: string) {
  return bundleDigitalComponents[slug] ?? [];
}
