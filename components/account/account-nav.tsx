"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Gift,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Package,
  RotateCcw,
  ShieldCheck,
  Star,
  TicketPercent,
  User,
  type LucideIcon,
} from "lucide-react";
import { useWishlist } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import { STORE_SETTINGS } from "@/lib/settings";
import { cn } from "@/lib/utils";

type AccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
};

type AccountNavGroup = { label: string; items: AccountNavItem[] };

const groups: AccountNavGroup[] = [
  {
    label: "Shopping",
    items: [
      { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/account/orders", label: "My orders", icon: Package },
      { href: "/account/wishlist", label: "Wishlist", icon: Heart, badge: "wishlist" },
      { href: "/account/addresses", label: "Addresses", icon: MapPin },
    ],
  },
  {
    label: "Perks",
    items: [
      { href: "/account/rewards", label: "Rewards", icon: Gift },
      { href: "/account/coupons", label: "Coupons", icon: TicketPercent },
      { href: "/account/reviews", label: "My reviews", icon: Star },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/account/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
      { href: "/account/returns", label: "Returns & claims", icon: RotateCcw },
      { href: "/account/support", label: "Support", icon: LifeBuoy },
      { href: "/account/security", label: "Security", icon: ShieldCheck },
      { href: "/account/profile", label: "Profile", icon: User },
    ],
  },
];

export function AccountNav() {
  const pathname = usePathname();
  const { count } = useWishlist();
  const { rewardsEnabled } = useSiteConfig();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    void fetch("/api/account/notifications", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        if (active && typeof data.unread === "number") setUnread(data.unread);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => rewardsEnabled || item.href !== "/account/rewards"
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
            {visibleGroups.map((group, index) => (
              <div key={group.label}>
                {index > 0 && <div className="my-2 h-px bg-[var(--border)]" />}
                <p className="px-3 pb-1.5 pt-2 text-[0.5rem] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  {group.label}
                </p>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.74rem] font-medium transition",
                          active
                            ? "bg-midnight text-ivory"
                            : "text-muted-foreground hover:bg-[var(--muted)] hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn("h-4 w-4", active ? "text-gold " : "text-muted-foreground")}
                          strokeWidth={1.8}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge === "wishlist" && count > 0 && (
                          <span
                            className={cn(
                              "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.48rem] font-bold",
                              active ? "bg-ivory/15 text-ivory" : "bg-rosewood/10 text-rosewood"
                            )}
                          >
                            {count}
                          </span>
                        )}
                        {item.badge === "notifications" && unread > 0 && (
                          <span
                            className={cn(
                              "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.48rem] font-bold",
                              active ? "bg-ivory/15 text-ivory" : "bg-magenta/10 text-magenta"
                            )}
                          >
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                        {active && item.badge !== "wishlist" && (
                          <ChevronRight className="h-3 w-3 opacity-50" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-[var(--color-indigo)] to-[var(--color-indigo-luminous)] p-4 text-ivory">
            <LifeBuoy className="h-4 w-4 text-gold" />
            <p className="mt-2 font-display text-lg">At your service.</p>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-ivory/60">
              {STORE_SETTINGS.replyTime || "A real person is on the other end. Ask us anything."}
            </p>
            <a
              href="https://wa.me/8801341739202"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[0.54rem] font-bold uppercase tracking-[0.12em] text-gold"
            >
              WhatsApp us <ChevronRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
        {visibleGroups.flatMap((group) => group.items).map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[0.64rem] font-semibold transition",
                active
                  ? "border-midnight bg-midnight text-ivory"
                  : "border-[var(--border)] bg-[var(--surface)] text-muted-foreground"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
              {item.badge === "wishlist" && count > 0 && (
                <span className="text-[0.55rem] opacity-70">{count}</span>
              )}
              {item.badge === "notifications" && unread > 0 && (
                <span className="text-[0.55rem] opacity-70">{unread > 9 ? "9+" : unread}</span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
