"use client";

import { CategoryChipBar } from "@/components/storefront/category-chip-bar";
import { useDepartmentCategory } from "@/components/storefront/department-category-context";
import type { Category, Department } from "@/lib/types";

export function DepartmentCategoryStrip({
  department,
  categories,
}: {
  department: Department;
  categories: Category[];
}) {
  const { activeSlug, ready, selectCategory } = useDepartmentCategory();

  return (
    <CategoryChipBar
      department={department}
      categories={categories}
      mode="scroll"
      activeSlug={ready ? activeSlug : undefined}
      onSelect={selectCategory}
    />
  );
}
