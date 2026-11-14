"use client";

import { motion } from "motion/react";
import {
  BookOpen,
  LayoutDashboard,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/library", label: "My library", icon: BookOpen },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: UserRound },
];

export function AccountNav({ libraryCount }: { libraryCount: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account navigation">
      <ul className="grid grid-cols-5 gap-1 lg:flex lg:flex-col">
        {links.map((link) => {
          const active =
            link.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="min-w-0 lg:w-full">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative isolate flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[0.56rem] font-semibold transition-colors lg:flex-row lg:justify-start lg:gap-2.5 lg:px-3.5 lg:py-2.5 lg:text-[0.74rem]",
                  active
                    ? "text-cream"
                    : "text-ink-soft hover:bg-ink/[0.045] hover:text-ink",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="account-nav-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-ink"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <link.icon className="size-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{link.label}</span>
                {link.href === "/account/library" && libraryCount > 0 ? (
                  <span
                    className={cn(
                      "ml-auto hidden min-w-5 place-items-center rounded-full px-1 text-[0.56rem] font-bold lg:grid",
                      active ? "bg-cream/20 text-cream" : "bg-teal/10 text-teal",
                    )}
                  >
                    {libraryCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
