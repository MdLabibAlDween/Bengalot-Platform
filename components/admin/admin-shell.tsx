"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BadgePercent,
  BarChart3,
  Bell,
  ChevronLeft,
  Command,
  CreditCard,
  ExternalLink,
  FileText,
  FolderTree,
  Gift,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PanelsTopLeft,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const CONTENT = ["super_admin", "manager", "content_editor"];
const ORDERS = ["super_admin", "manager", "order_staff", "support"];
const MONEY = ["super_admin", "manager"];
const SUPPORT = ["super_admin", "manager", "support"];

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: readonly string[];
  badge?: "orders" | "inbox" | "giftCards" | "stock";
  description: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const nav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Revenue, orders, stock and system health",
      },
      {
        href: "/admin/inbox",
        label: "Inbox",
        icon: Inbox,
        roles: SUPPORT,
        badge: "inbox",
        description: "Contact, support, returns and newsletter",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        href: "/admin/orders",
        label: "Orders",
        icon: ShoppingBag,
        roles: ORDERS,
        badge: "orders",
        description: "Order desk, status and fulfilment",
      },
      {
        href: "/admin/couriers",
        label: "Couriers",
        icon: Truck,
        roles: ["super_admin", "manager", "order_staff"],
        description: "Steadfast parcels, tracking and webhooks",
      },
      {
        href: "/admin/catalogue",
        label: "Catalogue",
        icon: Package,
        roles: CONTENT,
        badge: "stock",
        description: "Products, variants, stock and SEO",
      },
      {
        href: "/admin/taxonomy",
        label: "Categories & collections",
        icon: FolderTree,
        roles: CONTENT,
        description: "Categories, curated collections and bundles",
      },
      {
        href: "/admin/media",
        label: "Media library",
        icon: ImageIcon,
        roles: CONTENT,
        description: "Upload and place storefront imagery",
      },
      {
        href: "/admin/reports",
        label: "Reports",
        icon: BarChart3,
        roles: MONEY,
        description: "Sales ledger, print and CSV export",
      },
      {
        href: "/admin/reviews",
        label: "Reviews",
        icon: MessageSquare,
        roles: ["super_admin", "manager", "content_editor", "support"],
        description: "Moderate verified-buyer reviews",
      },
    ],
  },
  {
    label: "Storefront",
    items: [
      {
        href: "/admin/homepage",
        label: "Homepage",
        icon: PanelsTopLeft,
        roles: CONTENT,
        description: "Sections, hero slides and reels",
      },
      {
        href: "/admin/content",
        label: "Page content",
        icon: FileText,
        roles: CONTENT,
        description: "Copy and images for every page",
      },
      {
        href: "/admin/pages",
        label: "Pages & features",
        icon: ShieldCheck,
        roles: CONTENT,
        description: "Visibility and feature switches",
      },
      {
        href: "/admin/redirects",
        label: "URL redirects",
        icon: ArrowUpRight,
        roles: CONTENT,
        description: "Legacy URLs and page moves",
      },
      {
        href: "/admin/offers",
        label: "Offers & coupons",
        icon: BadgePercent,
        roles: CONTENT,
        description: "Campaigns and promotional codes",
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        href: "/admin/customers",
        label: "Customers",
        icon: Users,
        roles: SUPPORT,
        description: "Profiles, order history and blocking",
      },
      {
        href: "/admin/rewards",
        label: "Rewards & loyalty",
        icon: Sparkles,
        roles: MONEY,
        description: "Points, tiers and reward redemptions",
      },
    ],
  },
  {
    label: "Revenue",
    items: [
      {
        href: "/admin/gift-cards",
        label: "Gift cards",
        icon: Gift,
        roles: MONEY,
        badge: "giftCards",
        description: "Issue, request, balance and void",
      },
      {
        href: "/admin/invoices",
        label: "Invoices",
        icon: ReceiptText,
        roles: MONEY,
        description: "Sender identity and invoice footer",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/admin/integrations",
        label: "Integrations",
        icon: Sparkles,
        roles: ["super_admin"],
        description: "SMTP, SMS, courier, bKash, Discord",
      },
      {
        href: "/admin/staff",
        label: "Staff & roles",
        icon: ShieldCheck,
        roles: ["super_admin"],
        description: "Permissions and staff accounts",
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: Settings2,
        roles: MONEY,
        description: "Store profile, delivery and SEO",
      },
      {
        href: "/admin/audit",
        label: "Audit log",
        icon: Activity,
        roles: ["super_admin"],
        description: "Every admin write and actor",
      },
    ],
  },
];

export function AdminShell({
  children,
  profile,
  badges = {},
  system,
}: {
  children: React.ReactNode;
  profile: { email: string | null; full_name: string | null; role: string };
  badges?: Partial<Record<"orders" | "inbox" | "giftCards" | "stock", number>>;
  system: {
    supabase: boolean;
    discord: boolean;
    smtp: boolean;
    steadfast: boolean;
    bkash: boolean;
  };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userOpen, setUserOpen] = useState(false);

  const initials = (profile.full_name || profile.email || "A")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const visibleNav = useMemo(
    () =>
      nav
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => !item.roles || item.roles.includes(profile.role)
          ),
        }))
        .filter((group) => group.items.length > 0),
    [profile.role]
  );

  const activeItem =
    visibleNav.flatMap((group) => group.items).find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) ?? visibleNav[0]?.items[0];
  const activeGroup = visibleNav.find((group) =>
    group.items.some((item) => item.href === activeItem?.href)
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bengalot-admin-collapsed");
      if (stored === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem("bengalot-admin-collapsed", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setUserOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const signOut = async () => {
    const supabase = createBrowserSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    window.location.assign("/admin/login");
  };

  const commandItems = visibleNav
    .flatMap((group) =>
      group.items.map((item) => ({ ...item, group: group.label }))
    )
    .filter((item) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [item.label, item.group, item.description]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

  const navBody = (mobile = false) => (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-[76px] shrink-0 items-center border-b border-white/10",
          collapsed && !mobile ? "justify-center px-2" : "justify-between px-5"
        )}
      >
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <Logo className={cn("w-auto", collapsed && !mobile ? "h-7" : "h-8")} tone="light" priority />
          {(!collapsed || mobile) && (
            <span className="rounded-full border border-saffron/30 bg-saffron/10 px-2 py-0.5 text-[0.42rem] font-bold uppercase tracking-[0.14em] text-saffron">
              Ops
            </span>
          )}
        </Link>
        {mobile ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-ivory/70"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-ivory/50 transition hover:border-white/25 hover:text-ivory"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition", collapsed && "rotate-180")} />
          </button>
        )}
      </div>

      {(!collapsed || mobile) && (
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-[0.68rem] text-ivory/45 transition hover:border-saffron/40 hover:bg-white/[0.07]"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Search anything…</span>
            <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.48rem] text-ivory/40">
              ⌘K
            </span>
          </button>
        </div>
      )}

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {visibleNav.map((group) => (
          <div key={group.label} className="mb-5">
            {(!collapsed || mobile) && (
              <p className="px-2.5 pb-1.5 text-[0.46rem] font-bold uppercase tracking-[0.2em] text-ivory/30">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = activeItem?.href === item.href;
                const count = item.badge ? badges[item.badge] ?? 0 : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed && !mobile ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[0.72rem] font-medium transition",
                      active
                        ? "bg-ivory text-midnight shadow-[0_8px_24px_-16px_rgba(0,0,0,0.7)]"
                        : "text-ivory/60 hover:bg-white/[0.06] hover:text-ivory",
                      collapsed && !mobile && "justify-center px-0"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-indigo" : "text-ivory/40 group-hover:text-saffron"
                      )}
                      strokeWidth={1.8}
                    />
                    {(!collapsed || mobile) && (
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    )}
                    {(!collapsed || mobile) && count > 0 && (
                      <span
                        className={cn(
                          "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.46rem] font-bold",
                          active
                            ? "bg-indigo text-ivory"
                            : "bg-saffron/15 text-saffron"
                        )}
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                    {(!collapsed || mobile) && active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {(!collapsed || mobile) && (
        <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[0.48rem] font-bold uppercase tracking-[0.14em] text-ivory/35">
              System health
            </p>
            <span className="flex items-center gap-1 text-[0.46rem] font-bold uppercase tracking-[0.08em] text-jade">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade" /> Live
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5 text-[0.56rem]">
            {[
              ["Supabase", system.supabase],
              ["Discord", system.discord],
              ["SMTP", system.smtp],
              ["Steadfast", system.steadfast],
              ["bKash", system.bkash],
            ].map(([label, ok]) => (
              <div key={String(label)} className="flex items-center justify-between">
                <span className="text-ivory/45">{label}</span>
                <span className={ok ? "text-jade" : "text-ivory/25"}>
                  {ok ? "Ready" : "Off"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={cn("border-t border-white/10 p-3", collapsed && !mobile && "px-2")}>
        <button
          type="button"
          onClick={() => setUserOpen((open) => !open)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-white/[0.06]",
            collapsed && !mobile && "justify-center"
          )}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-saffron to-magenta text-[0.58rem] font-bold text-ivory">
            {initials}
          </span>
          {(!collapsed || mobile) && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.66rem] font-semibold text-ivory">
                {profile.full_name || "Admin"}
              </span>
              <span className="block truncate text-[0.5rem] uppercase tracking-[0.08em] text-ivory/35">
                {profile.role.replace("_", " ")}
              </span>
            </span>
          )}
        </button>
        {userOpen && (
          <div className="mt-2 rounded-xl border border-white/10 bg-midnight p-1.5 shadow-xl">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.62rem] text-ivory/65 hover:bg-white/[0.06] hover:text-ivory"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View storefront
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[0.62rem] text-rosewood hover:bg-rosewood/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-sand)] text-[var(--color-ink)]">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 hidden flex-col bg-[var(--color-ink)] text-ivory transition-[width] duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen",
            collapsed ? "w-[76px]" : "w-[264px]"
          )}
        >
          {navBody()}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu overlay"
            />
            <aside className="relative h-full w-[286px] bg-[var(--color-ink)] text-ivory shadow-2xl">
              {navBody(true)}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-sand)]/90 backdrop-blur-xl">
            <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 xl:px-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="text-[0.48rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {activeGroup?.label ?? "Overview"}
                </p>
                <p className="truncate text-[0.82rem] font-semibold">
                  {activeItem?.label ?? "Dashboard"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  className="hidden h-9 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[0.6rem] text-muted-foreground transition hover:border-indigo hover:text-foreground sm:flex"
                >
                  <Command className="h-3.5 w-3.5" />
                  Search
                  <span className="rounded border border-[var(--color-border)] px-1 font-mono text-[0.46rem]">
                    ⌘K
                  </span>
                </button>
                <Link
                  href="/admin/inbox"
                  className="relative grid h-9 w-9 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-muted-foreground transition hover:border-indigo hover:text-indigo"
                  aria-label="Open inbox"
                >
                  <Bell className="h-4 w-4" />
                  {(badges.inbox ?? 0) > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-magenta px-1 text-[0.42rem] font-bold text-ivory">
                      {(badges.inbox ?? 0) > 9 ? "9+" : badges.inbox}
                    </span>
                  )}
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="hidden h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:border-indigo hover:text-indigo sm:flex"
                >
                  Store <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  href="/admin/catalogue/products/new"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo px-3.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-ivory transition hover:bg-royal"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add product</span>
                </Link>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">{children}</main>
        </div>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
          <button
            type="button"
            className="absolute inset-0 bg-midnight/55 backdrop-blur-sm"
            onClick={() => setCommandOpen(false)}
            aria-label="Close command menu"
          />
          <div className="relative w-full max-w-[620px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_40px_100px_-30px_rgba(15,11,30,0.55)]">
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Jump to a page or action…"
                className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[0.52rem] text-muted-foreground"
              >
                esc
              </button>
            </div>
            <div className="max-h-[52vh] overflow-y-auto p-2">
              {commandItems.length === 0 ? (
                <p className="px-3 py-8 text-center text-[0.72rem] text-muted-foreground">
                  Nothing found for “{query}”.
                </p>
              ) : (
                commandItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setCommandOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--muted)]"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo/10 text-indigo">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.72rem] font-semibold">{item.label}</span>
                      <span className="block truncate text-[0.58rem] text-muted-foreground">
                        {item.group} · {item.description}
                      </span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                  </Link>
                ))
              )}
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 text-[0.52rem] text-muted-foreground">
              <span>Type to filter · Enter to open</span>
              <span>Bengalot ops console</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
