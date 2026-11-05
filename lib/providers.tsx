"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast, Toaster } from "sonner";
import { getBundleSavings } from "./bundles";
import { couponAppliesToProduct, couponDiscountAmount } from "./coupons";
import { coupons, getProduct } from "./data";
import { productForLine } from "./cart";
import { translate, type Locale } from "./i18n";
import type { CartLine, Coupon, Product } from "./types";
import { FREE_DELIVERY_ENABLED, FREE_DELIVERY_THRESHOLD } from "./utils";

/* -------------------------------------------------------------------------- */
/*  Locale                                                                    */
/* -------------------------------------------------------------------------- */

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bengalot-locale");
      if (stored === "bn" || stored === "en") {
        setLocaleState(stored);
        document.documentElement.lang = stored;
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem("bengalot-locale", next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === "en" ? "bn" : "en"),
      t: (key: string) => translate(locale, key),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside Providers");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Cart                                                                      */
/* -------------------------------------------------------------------------- */

type CouponResult = { ok: boolean; message: string };

type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  coupon: Coupon | null;
  couponCode: string | null;
  discount: number;
  eligibleSubtotal: number;
  bundleSavings: number;
  freeShipping: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: CartLine, opts?: { silent?: boolean; openDrawer?: boolean }) => void;
  updateQty: (
    productSlug: string,
    size: string,
    color: string,
    qty: number,
    bundleId?: string
  ) => void;
  removeLine: (
    productSlug: string,
    size: string,
    color: string,
    bundleId?: string
  ) => void;
  updateLineVariant: (
    productSlug: string,
    oldSize: string,
    oldColor: string,
    bundleId: string | undefined,
    nextSize: string,
    nextColor: string
  ) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => CouponResult;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>(coupons);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bengalot-cart");
      if (stored) {
        const parsed = JSON.parse(stored) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed);
      }
      const storedCoupon = localStorage.getItem("bengalot-coupon");
      if (storedCoupon) setCouponCode(storedCoupon);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("bengalot-cart", JSON.stringify(lines));
      if (couponCode) localStorage.setItem("bengalot-coupon", couponCode);
      else localStorage.removeItem("bengalot-coupon");
    } catch {
      /* storage unavailable */
    }
  }, [lines, couponCode, hydrated]);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = productForLine(line);
        return sum + (product ? product.price * line.qty : 0);
      }, 0),
    [lines]
  );

  useEffect(() => {
    void fetch("/api/coupons", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        if (Array.isArray(data.coupons) && data.coupons.length > 0) {
          setAvailableCoupons(data.coupons as Coupon[]);
        }
      })
      .catch(() => undefined);
  }, []);

  const coupon = useMemo(
    () => (couponCode ? availableCoupons.find((c) => c.code === couponCode) ?? null : null),
    [couponCode, availableCoupons]
  );

  const couponEligibleSubtotal = useMemo(() => {
    if (!coupon) return subtotal;
    return lines.reduce((sum, line) => {
      if (!couponAppliesToProduct(coupon, line.productSlug)) return sum;
      const product = productForLine(line);
      return sum + (product ? product.price * line.qty : 0);
    }, 0);
  }, [coupon, lines, subtotal]);

  const discount = useMemo(
    () => couponDiscountAmount(coupon, couponEligibleSubtotal),
    [coupon, couponEligibleSubtotal]
  );

  const bundleSavings = useMemo(() => getBundleSavings(lines), [lines]);

  const freeShipping =
    (FREE_DELIVERY_ENABLED && subtotal >= FREE_DELIVERY_THRESHOLD) ||
    (coupon?.type === "shipping" && couponEligibleSubtotal > 0);

  const addLine = useCallback(
    (line: CartLine, opts?: { silent?: boolean; openDrawer?: boolean }) => {
      if (line.qty < 1) return;
      const product = productForLine(line);
      if (product?.isDemo) {
        toast.error("Demo product — ordering is disabled.", {
          description:
            "This is a preview listing while the real product is being prepared.",
        });
        return;
      }
      setLines((current) => {
        const idx = current.findIndex(
          (l) =>
            l.productSlug === line.productSlug &&
            l.size === line.size &&
            l.color === line.color &&
            (l.bundleId ?? null) === (line.bundleId ?? null)
        );
        if (idx >= 0) {
          const next = [...current];
          next[idx] = { ...next[idx], qty: next[idx].qty + line.qty };
          return next;
        }
        return [...current, line];
      });
      if (!opts?.silent) {
        toast.success("Added to your bag", {
          description: product?.name ?? "Piece added",
        });
      }
      if (opts?.openDrawer) setIsCartOpen(true);
    },
    []
  );

  const updateQty = useCallback(
    (productSlug: string, size: string, color: string, qty: number, bundleId?: string) => {
      setLines((current) =>
        qty <= 0
          ? current.filter(
              (l) =>
                !(
                  l.productSlug === productSlug &&
                  l.size === size &&
                  l.color === color &&
                  (l.bundleId ?? null) === (bundleId ?? null)
                )
            )
          : current.map((l) =>
              l.productSlug === productSlug &&
              l.size === size &&
              l.color === color &&
              (l.bundleId ?? null) === (bundleId ?? null)
                ? { ...l, qty }
                : l
            )
      );
    },
    []
  );

  const removeLine = useCallback(
    (productSlug: string, size: string, color: string, bundleId?: string) => {
      setLines((current) =>
        current.filter(
          (l) =>
            !(
              l.productSlug === productSlug &&
              l.size === size &&
              l.color === color &&
              (l.bundleId ?? null) === (bundleId ?? null)
            )
        )
      );
    },
    []
  );

  const updateLineVariant = useCallback(
    (
      productSlug: string,
      oldSize: string,
      oldColor: string,
      bundleId: string | undefined,
      nextSize: string,
      nextColor: string
    ) => {
      setLines((current) => {
        const sourceIndex = current.findIndex(
          (line) =>
            line.productSlug === productSlug &&
            line.size === oldSize &&
            line.color === oldColor &&
            (line.bundleId ?? null) === (bundleId ?? null)
        );
        if (sourceIndex < 0) return current;
        const source = current[sourceIndex];
        if (source.size === nextSize && source.color === nextColor) return current;

        const duplicateIndex = current.findIndex(
          (line, index) =>
            index !== sourceIndex &&
            line.productSlug === productSlug &&
            line.size === nextSize &&
            line.color === nextColor &&
            (line.bundleId ?? null) === (bundleId ?? null)
        );

        if (duplicateIndex >= 0) {
          return current
            .map((line, index) =>
              index === duplicateIndex
                ? { ...line, qty: line.qty + source.qty }
                : line
            )
            .filter((_, index) => index !== sourceIndex);
        }

        return current.map((line, index) =>
          index === sourceIndex ? { ...line, size: nextSize, color: nextColor } : line
        );
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setLines([]);
    setCouponCode(null);
  }, []);

  const applyCoupon = useCallback(
    (code: string): CouponResult => {
      const normalized = code.trim().toUpperCase();
      const found = availableCoupons.find((c) => c.code === normalized);
      if (!found) return { ok: false, message: "That code is not recognised." };
      const eligible = lines.reduce((sum, line) => {
        if (!couponAppliesToProduct(found, line.productSlug)) return sum;
        const product = productForLine(line);
        return sum + (product ? product.price * line.qty : 0);
      }, 0);
      if (eligible <= 0) {
        return {
          ok: false,
          message:
            (found.productSlugs?.length ?? 0) > 0
              ? "That code only applies to selected products. Add one of them to your bag first."
              : "Add an item to your bag before applying this code.",
        };
      }
      if (eligible < found.minSpend) {
        return {
          ok: false,
          message: `Add ৳${(found.minSpend - eligible).toLocaleString("en-US")} more of eligible products to use this code.`,
        };
      }
      setCouponCode(found.code);
      return { ok: true, message: `${found.code} applied — ${found.title}` };
    },
    [lines, availableCoupons]
  );

  const removeCoupon = useCallback(() => setCouponCode(null), []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      hydrated,
      itemCount,
      subtotal,
      coupon,
      couponCode,
      discount,
      eligibleSubtotal: couponEligibleSubtotal,
      bundleSavings,
      freeShipping,
      isCartOpen,
      openCart,
      closeCart,
      addLine,
      updateQty,
      removeLine,
      updateLineVariant,
      clearCart,
      applyCoupon,
      removeCoupon,
    }),
    [
      lines,
      hydrated,
      itemCount,
      subtotal,
      coupon,
      couponCode,
      discount,
      couponEligibleSubtotal,
      bundleSavings,
      freeShipping,
      isCartOpen,
      openCart,
      closeCart,
      addLine,
      updateQty,
      removeLine,
      updateLineVariant,
      clearCart,
      applyCoupon,
      removeCoupon,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside Providers");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Wishlist                                                                  */
/* -------------------------------------------------------------------------- */

type WishlistContextValue = {
  slugs: string[];
  hydrated: boolean;
  count: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bengalot-wishlist");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) setSlugs(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("bengalot-wishlist", JSON.stringify(slugs));
    } catch {
      /* ignore */
    }
  }, [slugs, hydrated]);

  const toggle = useCallback((slug: string) => {
    setSlugs((current) => {
      if (current.includes(slug)) {
        toast("Removed from wishlist");
        return current.filter((s) => s !== slug);
      }
      toast.success("Saved to wishlist");
      return [...current, slug];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((current) => current.filter((s) => s !== slug));
  }, []);

  const value = useMemo(
    () => ({
      slugs,
      hydrated,
      count: slugs.length,
      has: (slug: string) => slugs.includes(slug),
      toggle,
      remove,
    }),
    [slugs, hydrated, toggle, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside Providers");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Recently viewed                                                           */
/* -------------------------------------------------------------------------- */

type RecentlyViewedContextValue = {
  items: Product[];
  add: (product: Product) => void;
  clear: () => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bengalot-recent");
      if (stored) {
        const parsed = JSON.parse(stored) as unknown[];
        if (Array.isArray(parsed)) {
          const restored = parsed
            .map((entry) =>
              typeof entry === "string"
                ? getProduct(entry)
                : typeof entry === "object" && entry && "slug" in entry
                  ? (entry as Product)
                  : undefined
            )
            .filter((entry): entry is Product => Boolean(entry?.slug));
          setItems(restored);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback((product: Product) => {
    setItems((current) => {
      const next = [
        product,
        ...current.filter((entry) => entry.slug !== product.slug),
      ].slice(0, 8);
      try {
        localStorage.setItem("bengalot-recent", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem("bengalot-recent");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ items, add, clear }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used inside Providers");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Root                                                                      */
/* -------------------------------------------------------------------------- */

function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      theme="light"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border !border-[var(--border)] !bg-[var(--surface)] !text-[var(--foreground)] !shadow-[0_24px_60px_-30px_rgba(20,12,50,0.5)] !font-sans",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-[var(--muted-foreground)]",
          success: "!text-[var(--foreground)]",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            {children}
            <AppToaster />
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </LocaleProvider>
  );
}
