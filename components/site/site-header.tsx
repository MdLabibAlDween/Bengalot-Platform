"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/components/cart/cart-provider";
import { Logo } from "@/components/brand/logo";
import { ProductArt } from "@/components/product/product-art";
import { MobileMenu } from "@/components/site/mobile-menu";
import { SearchDialog } from "@/components/site/search-dialog";
import type { Category, Product } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

type HeaderProps = {
  categories: Category[];
  products: Product[];
  user: { name: string; role: string } | null;
};

export function SiteHeader({ categories, products, user }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart, hydrated } = useCart();
  const pathname = usePathname();
  const shopRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<number | null>(null);

  const isStaff = user?.role === "staff" || user?.role === "admin" || user?.role === "owner";
  const accountHref = user ? (isStaff ? "/admin" : "/account") : "/login";
  const accountLabel = user ? (isStaff ? "Open admin" : "My library") : "Sign in";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShopOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !isTyping)
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setShopOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function scheduleShopClose() {
    closeTimeout.current = window.setTimeout(() => setShopOpen(false), 140);
  }

  function cancelShopClose() {
    if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
  }

  const featured = products.filter((product) => product.featured).slice(0, 2);
  const navItems = [
    { href: "/journal", label: "Journal" },
    { href: "/about", label: "Our story" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[60] border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-line/80 bg-cream/88 shadow-[0_14px_34px_-30px_rgba(21,34,50,0.5)] backdrop-blur-xl"
            : "border-transparent bg-ivory/55 backdrop-blur-sm",
        )}
      >
        <div
          className={cn(
            "container-wide flex items-center gap-3 transition-[height] duration-300 sm:gap-5",
            scrolled ? "h-[4.15rem]" : "h-[4.9rem]",
          )}
        >
          <Logo />

          <nav
            className="ml-5 hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            <div
              ref={shopRef}
              className="relative"
              onMouseEnter={() => {
                cancelShopClose();
                setShopOpen(true);
              }}
              onMouseLeave={scheduleShopClose}
            >
              <button
                type="button"
                aria-expanded={shopOpen}
                aria-haspopup="true"
                onClick={() => setShopOpen((current) => !current)}
                className={cn(
                  "flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[0.78rem] font-semibold text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink",
                  shopOpen && "bg-ink/[0.05] text-ink",
                  pathname === "/shop" && "text-ink",
                )}
              >
                Shop
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    shopOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {shopOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.995 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-[-7rem] top-[calc(100%+0.45rem)] w-[50rem] overflow-hidden rounded-[1.65rem] border border-line bg-cream shadow-[0_34px_80px_-32px_rgba(16,28,42,0.55)]"
                  >
                    <div className="grid grid-cols-[1.08fr_0.92fr]">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <p className="eyebrow eyebrow-no-dot text-[0.6rem]">
                            Shop by collection
                          </p>
                          <Link
                            href="/shop"
                            className="flex items-center gap-1 text-[0.64rem] font-bold uppercase tracking-[0.08em] text-teal"
                          >
                            Everything
                            <ArrowRight className="size-3" />
                          </Link>
                        </div>
                        <ul className="mt-4 grid gap-1">
                          {categories.map((category) => (
                            <li key={category.id}>
                              <Link
                                href={`/shop/${category.slug}`}
                                className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-surface"
                              >
                                <span
                                  className="grid size-9 shrink-0 place-items-center rounded-lg text-cream"
                                  style={{
                                    background: `linear-gradient(135deg, ${category.theme.from}, ${category.theme.to})`,
                                  }}
                                >
                                  <Sparkles className="size-3.5 opacity-90" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block font-display text-[1rem] leading-tight text-ink">
                                    {category.name}
                                  </span>
                                  <span className="mt-0.5 block truncate text-[0.67rem] text-muted">
                                    {category.tagline}
                                  </span>
                                </span>
                                <ArrowRight className="size-3.5 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 bg-paper p-5">
                        {featured.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream"
                          >
                            <div className="aspect-[4/3.5] overflow-hidden">
                              <ProductArt product={product} showCaption={false} />
                            </div>
                            <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                              <p className="font-display text-[0.92rem] leading-tight text-ink">
                                {product.title}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="price text-[0.7rem] font-semibold text-ink-soft">
                                  {formatMoney(product.price)}
                                </span>
                                <span className="grid size-6 place-items-center rounded-full bg-ink text-cream transition-colors group-hover:bg-teal">
                                  <ArrowRight className="size-3" />
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                        <div className="col-span-2 rounded-2xl bg-teal px-4 py-3.5 text-cream">
                          <p className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-cream/85">
                            Not sure where to start?
                          </p>
                          <Link
                            href="/product/student-starter-bundle"
                            className="mt-1.5 flex items-center justify-between gap-2"
                          >
                            <span className="font-display text-[1.05rem] leading-tight">
                              Meet the Student Starter Bundle
                            </span>
                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-butter text-ink">
                              <ArrowRight className="size-3.5" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center rounded-full px-3.5 text-[0.78rem] font-semibold text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink",
                  pathname.startsWith(item.href) && "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10.5 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
              aria-label="Search Bengalot"
            >
              <Search className="size-[1.1rem]" aria-hidden="true" />
            </button>
            <Link
              href={accountHref}
              className="hidden size-10.5 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink sm:grid"
              aria-label={user ? accountLabel : "Sign in"}
            >
              <UserRound className="size-[1.1rem]" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative grid size-10.5 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
              aria-label={`Open bag${hydrated && count > 0 ? `, ${count} items` : ""}`}
            >
              <ShoppingBag className="size-[1.1rem]" aria-hidden="true" />
              <AnimatePresence>
                {hydrated && count > 0 ? (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="absolute right-0.5 top-0.5 grid min-w-4.5 place-items-center rounded-full bg-coral px-1 text-[0.56rem] font-bold leading-[1.15rem] text-cream"
                  >
                    {count}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid size-10.5 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/[0.06] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-[1.2rem]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        categories={categories}
      />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        accountHref={accountHref}
        accountLabel={user ? accountLabel : "Sign in to your library"}
      />
      <CartDrawer />
    </>
  );
}
