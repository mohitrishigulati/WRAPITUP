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
import { useSession } from "next-auth/react";
import { CART_STORAGE_KEY, type CartLine, type PricedCart } from "@/types/cart";

type CartContextValue = {
  lines: CartLine[];
  priced: PricedCart | null;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshQuote: (couponCode?: string) => Promise<void>;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line) =>
        line &&
        typeof line.variantId === "string" &&
        typeof line.quantity === "number" &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

function writeStoredLines(lines: CartLine[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [priced, setPriced] = useState<PricedCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const persistLines = useCallback(
    async (nextLines: CartLine[]) => {
      setLines(nextLines);
      writeStoredLines(nextLines);

      if (session?.user) {
        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: nextLines }),
        });
      }
    },
    [session?.user],
  );

  const refreshQuote = useCallback(
    async (couponCode?: string) => {
      if (!lines.length) {
        setPriced(null);
        return;
      }
      const response = await fetch("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, couponCode }),
      });
      if (!response.ok) {
        setPriced(null);
        return;
      }
      const data = (await response.json()) as PricedCart;
      setPriced(data);
    },
    [lines],
  );

  useEffect(() => {
    setHydrated(true);
    setLines(readStoredLines());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!hydrated || status === "loading") return;

    async function syncWithAccount() {
      if (!session?.user) {
        await refreshQuote();
        return;
      }

      setIsLoading(true);
      const local = readStoredLines();
      if (local.length) {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: local, mode: "merge" }),
        });
        if (response.ok) {
          const data = (await response.json()) as { lines: CartLine[] };
          setLines(data.lines);
          writeStoredLines(data.lines);
        }
      } else {
        const response = await fetch("/api/cart");
        if (response.ok) {
          const data = (await response.json()) as { lines: CartLine[] };
          setLines(data.lines);
          writeStoredLines(data.lines);
        }
      }
      setIsLoading(false);
    }

    void syncWithAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when auth/session hydration changes
  }, [hydrated, session?.user, status]);

  useEffect(() => {
    if (!hydrated) return;
    void refreshQuote();
  }, [hydrated, lines, refreshQuote]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      const next = [...lines];
      const existing = next.find((line) => line.variantId === variantId);
      if (existing) {
        existing.quantity = Math.min(99, existing.quantity + quantity);
      } else {
        next.push({ variantId, quantity });
      }
      await persistLines(next);
      setIsOpen(true);
    },
    [lines, persistLines],
  );

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      const next = lines
        .map((line) =>
          line.variantId === variantId
            ? { ...line, quantity: Math.max(1, Math.min(99, quantity)) }
            : line,
        )
        .filter((line) => line.quantity > 0);
      await persistLines(next);
    },
    [lines, persistLines],
  );

  const removeItem = useCallback(
    async (variantId: string) => {
      const next = lines.filter((line) => line.variantId !== variantId);
      await persistLines(next);
    },
    [lines, persistLines],
  );

  const clearCart = useCallback(async () => {
    await persistLines([]);
    setPriced(null);
  }, [persistLines]);

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      priced,
      isLoading,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshQuote,
      itemCount,
    }),
    [
      lines,
      priced,
      isLoading,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshQuote,
      itemCount,
    ],
  );

  function openCart() {
    setIsOpen(true);
  }
  function closeCart() {
    setIsOpen(false);
  }
  function toggleCart() {
    setIsOpen((open) => !open);
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
