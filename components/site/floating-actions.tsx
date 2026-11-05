"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./whatsapp-icon";

export function FloatingActions() {
  const pathname = usePathname();
  const hideOnMobile =
    pathname.startsWith("/product/") ||
    pathname.startsWith("/account") ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname.startsWith("/order-success");
  const [showTop, setShowTop] = useState(false);
  const [hideForHero, setHideForHero] = useState(pathname === "/");

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setHideForHero(false);
      return;
    }

    const hero = document.querySelector('[aria-label="Bengalot featured collection"]');
    if (!hero) {
      setHideForHero(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setHideForHero(entry.isIntersecting),
      { threshold: 0.12 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  if (hideForHero) return null;

  return (
    <div
      className={cn(
        "fixed bottom-[calc(var(--site-tabbar)+env(safe-area-inset-bottom)+16px)] right-4 z-40 flex flex-col items-end gap-2.5 md:bottom-6 md:right-6",
        hideOnMobile && "hidden md:flex"
      )}
    >
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)]/90 text-foreground shadow-lg backdrop-blur transition hover:border-gold-ink hover:text-gold-ink"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        data-whatsapp-float
        aria-label={`Chat with Bengalot on WhatsApp — ${SITE.whatsapp}`}
        className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[var(--color-jade)] text-white shadow-lg transition-all duration-300 hover:brightness-110 md:h-12 md:w-auto md:justify-start"
      >
        <span
          className="absolute inset-0 animate-ping rounded-full"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-jade) 20%, transparent)",
            animationDuration: "3s",
          }}
        />
        <span className="relative grid h-11 w-11 place-items-center md:h-12 md:w-12">
          <WhatsAppIcon className="h-5 w-5" />
        </span>
        <span className="relative hidden max-w-0 overflow-hidden whitespace-nowrap pr-0 text-xs font-semibold transition-all duration-300 group-hover:max-w-[170px] group-hover:pr-5 md:block">
          Chat with us
        </span>
      </a>
    </div>
  );
}
