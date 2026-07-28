"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type ProductQuickAddProps = {
  variantId: string | null;
  inStock: boolean;
  className?: string;
};

export function ProductQuickAdd({ variantId, inStock, className = "" }: ProductQuickAddProps) {
  const { addItem, openCart } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  if (!variantId || !inStock) return null;

  async function onAdd() {
    if (!variantId) return;
    setStatus("adding");
    try {
      await addItem(variantId, 1);
      setStatus("added");
      openCart();
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }

  const label =
    status === "adding" ? "Adding…" : status === "added" ? "Added! 🛍️" : "Add to cart";

  return (
    <button
      type="button"
      onClick={() => void onAdd()}
      disabled={status === "adding"}
      className={`mt-2 w-full rounded-md border border-neutral-border bg-white py-2 text-xs font-semibold uppercase tracking-wide text-neutral-text transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-60 ${className}`}
    >
      {label}
    </button>
  );
}
