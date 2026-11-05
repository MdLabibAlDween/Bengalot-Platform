"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Globe2,
  Heart,
  LogIn,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { JamdaniField } from "@/components/brand/ornaments";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { categories, departments, getProduct } from "@/lib/data";
import { useLocale, useWishlist } from "@/lib/providers";
import { useSiteConfig } from "@/lib/site-config-provider";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav({
  open,
  onOpenChange,
  onOpenSearch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSearch: () => void;
}) {
  const { locale, toggleLocale } = useLocale();
  const { count } = useWishlist();
  const { catalog } = useSiteConfig();
  const navCategories = catalog?.loaded ? catalog.categories : categories;
  const navBundles = catalog?.bundles ?? [];
  const { features } = useSiteConfig();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const routeDepartment = departments.find((department) => department.slug === segments[0]);
  const product =
    segments[0] === "product" && segments[1] ? getProduct(segments[1]) : undefined;
  const bundle =
    segments[0] === "bundle" && segments[1]
      ? navBundles.find((item) => item.slug === segments[1])
      : undefined;
  const activeDepartment =
    routeDepartment?.slug ?? product?.department ?? bundle?.department ?? null;
  const activeCategory =
    routeDepartment && segments[1] && segments[1] !== "bundles"
      ? segments[1]
      : product?.category ?? null;
  const [openDept, setOpenDept] = useState<string | null>(activeDepartment);

  useEffect(() => {
    if (open && activeDepartment) setOpenDept(activeDepartment);
  }, [open, activeDepartment]);

  const quickLinks = [
    { href: "/collections/new-arrivals", label: "New Arrivals" },
    { href: "/collections/best-sellers", label: "Selected Pieces" },
    ...(features.giftCards ? [{ href: "/gift-cards", label: "Gift Cards" }] : []),
    { href: "/offers", label: "Offers" },
    { href: "/lookbook", label: "Lookbook" },
    { href: "/track", label: "Track Order" },
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="left" showClose={false} className="max-w-[390px] p-0">
        <DialogTitle className="sr-only">Bengalot menu</DialogTitle>
        <DialogDescription className="sr-only">
          Browse departments, categories and account links.
        </DialogDescription>

        <div className="relative flex items-center border-b border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] transition hover:border-gold hover:text-gold"
          >
            <X className="h-4 w-4" />
          </button>
          <Link
            href="/"
            onClick={() => onOpenChange(false)}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <Logo />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onOpenSearch();
            }}
            className="mt-5 flex w-full items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--muted)]/60 px-4 py-3 text-left text-[0.8rem] text-muted-foreground transition hover:border-gold"
          >
            <Search className="h-4 w-4 text-gold" />
            Search for sarees, panjabis, sneakers…
          </button>

          <div className="mt-6">
            <p className="eyebrow mb-2 text-xs text-indigo">Departments</p>
            {departments.map((d) => {
              const expanded = openDept === d.slug;
              return (
                <div key={d.slug} className="border-b border-[var(--border)]">
                  <div className="flex items-center">
                    <Link
                      href={`/${d.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="flex flex-1 items-center gap-3 py-3.5"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: d.accent }}
                      />
                      <span className="font-display text-[1.28rem]">
                        <span className={cn(activeDepartment === d.slug && "font-semibold text-foreground")}>
                          {locale === "bn" ? d.nameBn : d.name}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Toggle ${d.name} categories`}
                      aria-expanded={expanded}
                      onClick={() => setOpenDept(expanded ? null : d.slug)}
                      className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:text-gold"
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
                      />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pb-4 pt-1">
                          <Link
                            href={`/${d.slug}`}
                            onClick={() => onOpenChange(false)}
                            className="rounded-lg bg-[var(--muted)] px-2.5 py-2 text-xs font-semibold"
                          >
                            Shop all →
                          </Link>
                          {navCategories
                            .filter((category) => category.department === d.slug)
                            .map((c) => (
                            <Link
                              key={c.slug}
                              href={`/${d.slug}/${c.slug}`}
                              onClick={() => onOpenChange(false)}
                              aria-current={activeCategory === c.slug ? "page" : undefined}
                              className={cn(
                                "rounded-lg px-2.5 py-2 text-xs transition",
                                activeCategory === c.slug
                                  ? "bg-[var(--muted)] font-semibold text-foreground"
                                  : "text-muted-foreground hover:bg-[var(--muted)] hover:text-foreground"
                              )}
                            >
                              {locale === "bn" ? c.nameBn : c.name}
                            </Link>
                          ))}
                          {navBundles.some((item) => item.department === d.slug) && (
                            <Link
                              href={`/${d.slug}/bundles`}
                              onClick={() => onOpenChange(false)}
                              className="rounded-lg bg-gold/10 px-2.5 py-2 text-xs font-semibold text-indigo transition hover:bg-gold/20 "
                            >
                              Complete outfits →
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="eyebrow mb-2 text-xs text-indigo">Quick links</p>
            <div className="grid grid-cols-2 gap-x-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => onOpenChange(false)}
                  className="border-b border-[var(--border)] py-2.5 text-[0.8rem] text-muted-foreground transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={toggleLocale}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-2.5 text-xs font-semibold transition hover:border-gold"
            >
              <Globe2 className="h-3.5 w-3.5 text-gold" />
              {locale === "en" ? "বাংলা" : "English"}
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            <Link
              href="/account"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <span className="flex items-center gap-2.5 text-[0.8rem] font-medium">
                <User className="h-4 w-4 text-gold" /> My account
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                View
              </span>
            </Link>
            <Link
              href="/wishlist"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <span className="flex items-center gap-2.5 text-[0.8rem] font-medium">
                <Heart className="h-4 w-4 text-rosewood" /> Wishlist
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
            </Link>
            <Link
              href="/login"
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <span className="flex items-center gap-2.5 text-[0.8rem] font-medium">
                <LogIn className="h-4 w-4 text-muted-foreground" /> Sign in / Register
              </span>
            </Link>
          </div>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2.5 rounded-full bg-[var(--color-jade)] py-3.5 text-[0.75rem] font-semibold text-white transition hover:bg-[var(--color-jade)]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Chat with us · {SITE.whatsapp}
          </a>

          <div className="relative mt-6 overflow-hidden rounded-2xl bg-midnight p-4 text-ivory">
            <JamdaniField id="mobilenav-promo" color="var(--color-saffron)" opacity={0.12} size={36} />
            <div className="relative flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <div>
                <p className="text-xs font-semibold">Delivered across Bangladesh</p>
                <p className="mt-1 text-xs leading-relaxed text-ivory/55">
                  ৳70 inside Faridpur · ৳130 elsewhere · Cash on delivery available.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
            {SITE.address}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
