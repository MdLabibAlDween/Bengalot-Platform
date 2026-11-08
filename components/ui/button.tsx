import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva("btn", {
  variants: {
    variant: {
      primary: "btn-primary",
      coral: "btn-coral",
      butter: "btn-butter",
      outline: "btn-outline",
      ghost: "btn-ghost",
    },
    size: {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
      icon: "btn-icon",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export function buttonLinkClass(
  options: VariantProps<typeof buttonVariants> = {},
  className?: string,
) {
  return cn(buttonVariants(options), className);
}
