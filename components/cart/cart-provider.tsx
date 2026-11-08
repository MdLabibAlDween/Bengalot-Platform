"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "bengalot-cart-v1";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  hydrated: boolean;
  lastAdded: CartLine | null;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  return (
    typeof line.slug === "string" &&
    typeof line.title === "string" &&
    typeof line.price === "number" &&
    typeof line.quantity === "number" &&
    line.quantity > 0 &&
    Array.isArray(line.palette)
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartLine | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          setLines(parsed.filter(isCartLine));
        }
      }
    } catch {
      // A malformed localStorage entry is ignored.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      setLines((current) => {
        const existing = current.find((item) => item.slug === line.slug);
        if (existing) {
          return current.map((item) =>
            item.slug === line.slug
              ? { ...item, quantity: Math.min(item.quantity + quantity, 20) }
              : item,
          );
        }
        return [...current, { ...line, quantity }];
      });
      setLastAdded({ ...line, quantity });
      setIsOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((item) => item.slug !== slug)
        : current.map((item) =>
            item.slug === slug
              ? { ...item, quantity: Math.min(quantity, 20) }
              : item,
          ),
    );
  }, []);

  const removeItem = useCallback((slug: string) => {
    setLines((current) => current.filter((item) => item.slug !== slug));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setLastAdded(null);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((total, line) => total + line.quantity, 0);
    const subtotal = lines.reduce(
      (total, line) => total + line.price * line.quantity,
      0,
    );

    return {
      lines,
      count,
      subtotal,
      isOpen,
      hydrated,
      lastAdded,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [
    lines,
    isOpen,
    hydrated,
    lastAdded,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
