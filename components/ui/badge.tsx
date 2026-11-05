import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em] leading-none",
  {
    variants: {
      variant: {
        new: "border-peacock/20 bg-peacock/10 text-peacock ",
        sale: "border-rosewood/20 bg-rosewood/10 text-rosewood ",
        bestseller: "border-gold/40 bg-gold/15 text-ink ",
        limited: "border-royal/20 bg-royal/10 text-royal ",
        outline: "border-[var(--border)] bg-transparent text-muted-foreground",
        gold: "border-transparent bg-gold text-midnight",
        dark: "border-transparent bg-midnight text-ivory",
        muted: "border-transparent bg-[var(--muted)] text-foreground",
      },
    },
    defaultVariants: {
      variant: "new",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
