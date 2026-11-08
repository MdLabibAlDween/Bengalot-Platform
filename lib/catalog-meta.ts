import type { Category } from "@/lib/types";

export const categoryAccent: Record<
  string,
  { label: string; motif: string }
> = {
  "notion-templates": { label: "Digital", motif: "A calmer workspace" },
  "study-cards": { label: "Printed", motif: "Recall, not rereading" },
  "printable-planners": { label: "Print at home", motif: "A week with shape" },
  "focus-productivity": { label: "Screen-free", motif: "Protect the hour" },
  bundles: { label: "Save more", motif: "The whole system" },
};

export const categoryOrder = [
  "notion-templates",
  "study-cards",
  "printable-planners",
  "focus-productivity",
  "bundles",
] as const;

export function categoryEyebrow(category: Category) {
  return categoryAccent[category.slug]?.label ?? "Collection";
}

export function productTypeLabel(type: string) {
  if (type === "physical") return "Physical";
  if (type === "bundle") return "Bundle";
  return "Digital";
}
