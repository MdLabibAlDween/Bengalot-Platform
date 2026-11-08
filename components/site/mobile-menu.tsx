"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { Logo } from "@/components/brand/logo";
import type { Category } from "@/lib/types";

const mainLinks = [
  { href: "/shop", label: "Shop all" },
  { href: "/journal", label: "The journal" },
  { href: "/about", label: "Our story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({
  open,
  onClose,
  categories,
  accountHref,
  accountLabel,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  accountHref: string;
  accountLabel: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 100);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[85] flex flex-col overflow-y-auto bg-cream lg:hidden"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex h-[4.6rem] items-center justify-between border-b border-line px-[var(--page-gutter)]">
            <Logo />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="grid size-11 place-items-center rounded-full border border-line bg-surface"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 px-[var(--page-gutter)] py-8">
            <p className="eyebrow text-[0.62rem]">The Bengalot shelf</p>
            <nav aria-label="Mobile navigation" className="mt-5">
              <ul className="divide-y divide-line">
                {mainLinks.map((link, index) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-baseline justify-between py-4"
                    >
                      <span className="font-display text-[2.05rem] leading-none tracking-[-0.035em] text-ink">
                        {link.label}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-[0.6rem] font-bold tracking-[0.14em] text-muted">
                          0{index + 1}
                        </span>
                        <ArrowRight className="size-4 text-teal transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="eyebrow mt-9 text-[0.62rem]">Collections</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5"
                >
                  <span className="text-[0.82rem] font-semibold text-ink">
                    {category.name}
                  </span>
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: category.theme.accent }}
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-line px-[var(--page-gutter)] py-5">
            <Link href={accountHref} className="btn btn-primary w-full">
              {accountLabel}
              <ArrowRight className="size-4" />
            </Link>
            <p className="mt-3 text-center text-[0.65rem] font-medium text-muted">
              Saltha, Faridpur · Cash on delivery across Bangladesh
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
