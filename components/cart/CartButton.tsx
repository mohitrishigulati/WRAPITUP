"use client";

import { useCart } from "@/components/cart/CartProvider";

export function CartButton() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
      aria-label={`Open cart, ${itemCount} items`}
    >
      Cart
      {itemCount > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-xs text-white">
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
