"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useActiveCategory } from "@/lib/use-active-category";
import type { Category } from "@/lib/types";

type DepartmentCategoryValue = ReturnType<typeof useActiveCategory>;

const DepartmentCategoryContext = createContext<DepartmentCategoryValue | null>(null);

export function DepartmentCategoryProvider({
  deptSlug,
  categories,
  children,
}: {
  deptSlug: string;
  categories: Category[];
  children: ReactNode;
}) {
  const value = useActiveCategory(deptSlug, categories);
  return (
    <DepartmentCategoryContext.Provider value={value}>
      {children}
    </DepartmentCategoryContext.Provider>
  );
}

export function useDepartmentCategory() {
  const value = useContext(DepartmentCategoryContext);
  if (!value) {
    throw new Error("useDepartmentCategory must be used inside DepartmentCategoryProvider");
  }
  return value;
}
