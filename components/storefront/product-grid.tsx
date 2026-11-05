import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The single product grid used across the storefront.
 * Fixed column counts; cards never stretch past 300px.
 */
export const productGridClass =
  "grid w-full max-w-[1240px] grid-cols-2 items-start gap-x-4 gap-y-6 min-[600px]:grid-cols-3 min-[600px]:gap-x-6 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4";

export function ProductGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(productGridClass, "mx-auto", className)}>{children}</div>;
}
