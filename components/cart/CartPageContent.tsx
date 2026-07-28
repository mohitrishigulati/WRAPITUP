"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { ProductImage } from "@/components/catalog/ProductImage";
import { formatUsd } from "@/lib/catalog/money";

export function CartPageContent() {
  const { priced, isLoading, updateQuantity, removeItem } = useCart();

  if (isLoading) {
    return <p className="text-zinc-600">Loading cart…</p>;
  }

  if (!priced?.lines.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-medium text-zinc-900">Your cart is empty</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-medium text-zinc-900 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        {priced.lines.map((line) => (
          <article
            key={line.variantId}
            className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              <ProductImage src={line.imageUrl} alt={line.productName} sizes="96px" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium text-zinc-900">{line.productName}</h2>
                  <p className="text-sm text-zinc-600">{line.variantName}</p>
                </div>
                <p className="font-medium text-zinc-900">{formatUsd(line.lineTotal)}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-zinc-600">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={line.maxQuantity}
                    value={line.quantity}
                    onChange={(e) =>
                      void updateQuantity(line.variantId, Number(e.target.value))
                    }
                    className="ml-2 w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void removeItem(line.variantId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-zinc-900">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-600">Subtotal</dt>
            <dd>{formatUsd(priced.totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-zinc-900">
            <dt>Estimated total</dt>
            <dd>{formatUsd(priced.totals.subtotal)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-zinc-500">
          Shipping and discounts are calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-4 block rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
        >
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
