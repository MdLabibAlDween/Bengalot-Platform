"use client";

import { motion } from "motion/react";
import {
  LayoutDashboard,
  Megaphone,
  Package,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
];

export function AdminNav({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();
  const id = variant === "sidebar" ? "admin-nav-desktop" : "admin-nav-mobile";

  return (
    <nav aria-label="Admin navigation">
      <ul
        className={cn(
          variant === "sidebar"
            ? "space-y-1"
            : "grid grid-cols-4 gap-1",
        )}
      >
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="min-w-0 lg:w-full">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative isolate flex rounded-xl text-[0.74rem] font-semibold transition-colors",
                  variant === "sidebar"
                    ? "items-center gap-2.5 px-3 py-2.5"
                    : "flex-col items-center justify-center gap-1 px-1 py-1.5 text-[0.56rem]",
                  variant === "sidebar"
                    ? active
                      ? "text-cream"
                      : "text-cream/40 hover:bg-cream/[0.06] hover:text-cream/75"
                    : active
                      ? "bg-ink text-cream"
                      : "text-ink-soft hover:bg-ink/[0.05]",
                )}
              >
                {active && variant === "sidebar" ? (
                  <motion.span
                    layoutId={id}
                    className="absolute inset-0 -z-10 rounded-xl bg-cream/[0.09]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <link.icon
                  className={cn(
                    "size-4",
                    variant === "sidebar" && active ? "text-butter" : undefined,
                  )}
                  aria-hidden="true"
                />
                {link.label}
                {variant === "sidebar" && active ? (
                  <span className="ml-auto size-1.5 rounded-full bg-butter" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
