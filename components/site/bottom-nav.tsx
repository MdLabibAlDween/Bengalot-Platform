"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Heart, Home, Search, User } from "lucide-react";
import { departments } from "@/lib/data";
import { useWishlist } from "@/lib/providers";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Grid2X2 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { count } = useWishlist();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--glass)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid h-[62px] grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const shopPrefixes = [
            "/collections",
            "/bundle",
            "/offers",
            "/lookbook",
            "/product",
          ];
          const active =
            href === "/"
              ? pathname === "/"
              : href === "/shop"
                ? pathname === "/shop" ||
                  shopPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
                  departments.some(
                    (department) =>
                      pathname === `/${department.slug}` ||
                      pathname.startsWith(`/${department.slug}/`)
                  )
                : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.02em] transition-colors min-[341px]:text-xs min-[341px]:tracking-[0.1em]",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span className="relative">
                <Icon
                  className={cn("h-[19px] w-[19px]", active && "text-gold")}
                  strokeWidth={active ? 2.2 : 1.7}
                />
                {label === "Wishlist" && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rosewood px-0.5 text-[0.45rem] font-bold text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
              {label}
              {active && (
                <span className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-gold" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
