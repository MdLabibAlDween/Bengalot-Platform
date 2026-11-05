"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Heart,
  LogIn,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { JamdaniField } from "@/components/brand/ornaments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SITE } from "@/lib/constants";
import { departments, getProduct } from "@/lib/data";
import { homeSectionEnabled } from "@/lib/homepage";
import {
  freeDeliveryNotice,
  exchangeNotice,
  deliveryLine,
  STORE_SETTINGS,
} from "@/lib/settings";
import {
  useCart,
  useLocale,
  useWishlist,
} from "@/lib/providers";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/lib/site-config-provider";
import { TakaText } from "./taka-text";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";
import { SearchDialog } from "./search-dialog";

const iconButton =
  "relative grid h-9 w-9 place-items-center rounded-full text-foreground/80 transition-all duration-200 hover:bg-[var(--muted)] hover:text-gold sm:h-10 sm:w-10";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-xs font-bold tabular-nums text-midnight shadow-sm">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function AnnouncementBar({ onClose }: { onClose: () => void }) {
  const { content } = useSiteConfig();
  const customMessages = (
    content?.home as { announcement?: { messages?: string[] } } | undefined
  )?.announcement?.messages;
  const messages = [
    ...(customMessages?.length ? customMessages : STORE_SETTINGS.announcementMessages),
    freeDeliveryNotice(),
    exchangeNotice(),
  ].filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % messages.length),
      5200
    );
    return () => window.clearInterval(timer);
  }, [messages.length]);

  if (messages.length === 0) return null;
  const active = messages[Math.min(index, messages.length - 1)];

  return (
    <div className="relative z-[60] border-b border-[var(--color-border)] bg-[var(--color-sand)] text-[var(--color-ink)]">
      <JamdaniField id="announcement-pattern" color="var(--color-gold-ink)" opacity={0.07} size={28} />
      <div className="container-wide relative flex h-9 items-center justify-center">
        <span className="mr-2.5 hidden h-1.5 w-1.5 rounded-full bg-[var(--color-gold-ink)] sm:block" aria-hidden="true" />
        <p className="max-w-[calc(100%-2.5rem)] truncate text-center text-xs font-semibold tracking-[0.02em] text-[var(--color-ink)]">
          <TakaText text={active} />
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss announcement"
          className="absolute right-3 grid h-5 w-5 place-items-center text-[var(--color-muted-foreground)] transition hover:text-[var(--color-ink)]"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLocale();
  const { count: wishCount } = useWishlist();
  const { catalog } = useSiteConfig();
  const { itemCount, openCart } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [openDept, setOpenDept] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenDept(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setOpenDept(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  const openMenu = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDept(slug);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenDept(null), 150);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const activeDept = departments.find((d) => d.slug === openDept) ?? null;
  const segments = pathname.split("/").filter(Boolean);
  const product =
    segments[0] === "product" && segments[1] ? getProduct(segments[1]) : undefined;
  const bundle =
    segments[0] === "bundle" && segments[1]
      ? catalog?.bundles.find((item) => item.slug === segments[1])
      : undefined;
  const pathDepartment = departments.find((d) => d.slug === segments[0]);
  const activeDepartmentSlug =
    pathDepartment?.slug ?? product?.department ?? bundle?.department ?? null;
  const activeCategorySlug =
    pathDepartment && segments[1] && segments[1] !== "bundles"
      ? segments[1]
      : product?.category ?? null;

  return (
    <>
      {announcementOpen && homeSectionEnabled("announcement") && (
        <AnnouncementBar onClose={() => setAnnouncementOpen(false)} />
      )}

      <header
        className="sticky top-0 z-50"
        onMouseLeave={scheduleClose}
      >
        <div
          className={cn(
            "relative z-40 border-b border-[var(--border)] transition-[background-color,box-shadow] duration-300",
            scrolled
              ? "bg-[var(--glass)] shadow-[0_16px_50px_-35px_rgba(15,10,35,0.55)] backdrop-blur-xl"
              : "bg-[var(--background)]/95 backdrop-blur-md"
          )}
        >
          <div className="container-wide">
            <div className="relative flex h-[64px] items-center justify-between gap-4 lg:h-[76px]">
              <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className={cn(iconButton, "-ml-2 xl:hidden")}
                  aria-label="Open menu"
                >
                  <Menu className="h-[19px] w-[19px]" />
                </button>
                <Link
                  href="/"
                  aria-label="Bengalot home"
                  className="absolute left-1/2 top-1/2 shrink-0 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 hover:opacity-90 xl:static xl:translate-x-0 xl:translate-y-0"
                >
                  <Logo priority />
                </Link>
              </div>

              <nav
                aria-label="Primary navigation"
                className="hidden h-full shrink-0 items-center xl:flex xl:w-[600px] xl:justify-between"
              >
                {departments.map((d) => {
                  const active = openDept === d.slug;
                  const routeActive = activeDepartmentSlug === d.slug;
                  return (
                    <Link
                      key={d.slug}
                      href={`/${d.slug}`}
                      aria-haspopup="true"
                      aria-expanded={active}
                      aria-controls="mega-menu"
                      aria-current={routeActive ? "page" : undefined}
                      onMouseEnter={() => openMenu(d.slug)}
                      onFocus={() => openMenu(d.slug)}
                      className={cn(
                        "relative flex h-full shrink-0 items-center gap-1 whitespace-nowrap px-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                        routeActive
                          ? "font-bold text-foreground"
                          : active
                            ? "text-foreground"
                            : "text-foreground/70 hover:text-foreground"
                      )}
                    >
                      {locale === "bn" ? d.nameBn : d.name}
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 text-muted-foreground transition-transform duration-300",
                          active && "rotate-180 text-gold"
                        )}
                      />
                      <span
                        className={cn(
                          "absolute inset-x-2 bottom-0 h-[2px] origin-left rounded-full transition-transform duration-300",
                          active || routeActive ? "scale-x-100" : "scale-x-0"
                        )}
                        style={{ backgroundColor: d.accent }}
                      />
                    </Link>
                  );
                })}
                <Link
                  href="/collections/new-arrivals"
                  onMouseEnter={() => setOpenDept(null)}
                  className="group relative ml-1 flex h-full shrink-0 items-center gap-1 whitespace-nowrap px-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground/70 transition hover:text-foreground"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-jade" />
                  {t("nav.newIn")}
                </Link>
                <Link
                  href="/collections/sale"
                  onMouseEnter={() => setOpenDept(null)}
                  className="flex h-full shrink-0 items-center whitespace-nowrap px-2 text-xs font-semibold uppercase tracking-[0.08em] text-rosewood transition hover:text-[var(--color-magenta)] "
                >
                  {t("nav.sale")}
                </Link>
              </nav>

              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={iconButton}
                  aria-label="Search"
                  title="Search (Ctrl K)"
                >
                  <Search className="h-[18px] w-[18px]" />
                </button>

                <button
                  type="button"
                  onClick={toggleLocale}
                  className={cn(
                    iconButton,
                    "hidden text-xs font-bold uppercase tracking-wider lg:grid"
                  )}
                  aria-label="Toggle language"
                  title={locale === "en" ? "বাংলায় দেখুন" : "View in English"}
                >
                  {locale === "en" ? "বাং" : "EN"}
                </button>

                <div className="hidden lg:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={iconButton}
                        aria-label="Account menu"
                      >
                        <User className="h-[18px] w-[18px]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[250px]">
                      <DropdownMenuLabel>Welcome to Bengalot</DropdownMenuLabel>
                      <div className="px-3 pb-2">
                        <p className="text-[13px] leading-relaxed text-muted-foreground">
                          Sign in to see your orders, saved pieces and delivery details.
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/login">
                          <LogIn className="h-4 w-4 text-muted-foreground" /> Sign in
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register">
                          <User className="h-4 w-4 text-muted-foreground" /> Create an account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account">
                          <User className="h-4 w-4 text-muted-foreground" /> My account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders">
                          <Package className="h-4 w-4 text-muted-foreground" /> My orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wishlist">
                          <Heart className="h-4 w-4 text-muted-foreground" /> Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/track">
                          <Truck className="h-4 w-4 text-muted-foreground" /> Track an order
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link
                  href="/wishlist"
                  className={cn(iconButton, "hidden sm:grid")}
                  aria-label={`Wishlist (${wishCount} ${wishCount === 1 ? "item" : "items"})`}
                  title="Wishlist"
                >
                  <Heart className="h-[18px] w-[18px]" />
                  <CountBadge count={wishCount} />
                </Link>

                <button
                  type="button"
                  onClick={openCart}
                  className={iconButton}
                  aria-label={`Shopping bag (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
                  title="Shopping bag"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  <CountBadge count={itemCount} />
                </button>
              </div>
            </div>

          </div>
        </div>

        <AnimatePresence>
          {activeDept && (
            <>
              <motion.button
                type="button"
                aria-label="Close menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpenDept(null)}
                className="fixed inset-0 z-30 cursor-default bg-[var(--color-ink)]/45 backdrop-blur-[3px]"
              />
              <motion.div
                id="mega-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-full z-40"
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                <MegaMenu
                  department={activeDept}
                  activeCategorySlug={activeCategorySlug}
                  onNavigate={() => setOpenDept(null)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* small floating reminder for trial period? hidden intentionally */}
      <span className="sr-only">
        {deliveryLine()} · {SITE.address}
      </span>
    </>
  );
}
