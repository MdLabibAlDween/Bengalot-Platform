"use client";

import { useEffect } from "react";

/**
 * Deep links such as /product/foo#size-guide are commonly used from the home
 * page and quick view. The browser lands on the old layout position while the
 * product page is still settling, so make one precise correction after mount.
 */
export function ScrollToHash() {
  useEffect(() => {
    const scroll = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      if (!hash) return;
      const target = document.getElementById(hash);
      if (!target) return;
      target.scrollIntoView({ behavior: "auto", block: "start" });
    };

    // Client-side navigation can set the hash after the page mounts, and the
    // router's own scroll restoration may land after that. A few quiet
    // corrections make deep links reliable without affecting in-page anchors.
    const timers = [120, 380, 800, 1400, 2200].map((delay) =>
      window.setTimeout(scroll, delay)
    );
    window.addEventListener("hashchange", scroll);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("hashchange", scroll);
    };
  }, []);

  return null;
}
