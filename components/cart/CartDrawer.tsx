"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/lib/catalog/money";
import { ProductImage } from "@/components/catalog/ProductImage";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    priced,
    isLoading,
    updateQuantity,
    removeItem,
    itemCount,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Cart ({itemCount})</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <p className="text-sm text-zinc-600">Loading cart…</p>
          ) : !priced?.lines.length ? (
            <p className="text-sm text-zinc-600">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {priced.lines.map((line) => (
                <li key={line.lineKey} className="flex gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    <ProductImage src={line.imageUrl} alt={line.productName} sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">{line.productName}</p>
                    <p className="text-sm text-zinc-600">{line.variantName}</p>
                    {line.personalization && Object.keys(line.personalization).length > 0 ? (
                      <p className="text-xs text-zinc-500">
                        {Object.entries(line.personalization)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    ) : null}
                    <p className="text-sm font-medium text-zinc-900">
                      {formatUsd(line.unitPrice)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={line.maxQuantity}
                        value={line.quantity}
                        onChange={(e) =>
                          void updateQuantity(line.lineKey, Number(e.target.value))
                        }
                        className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
                        aria-label={`Quantity for ${line.productName}`}
                      />
                      <button
                        type="button"
                        onClick={() => void removeItem(line.lineKey)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-zinc-200 px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">Subtotal</span>
            <span className="font-semibold text-zinc-900">
              {priced ? formatUsd(priced.totals.subtotal) : formatUsd(0)}
            </span>
          </div>
          <Link
            href="/cart"
            onClick={closeCart}
            className="mt-3 block rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium hover:bg-zinc-50"
          >
            View cart
          </Link>
          <Link
            href="/checkout"
            onClick={closeCart}
            className="mt-2 block rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
          >
            Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
