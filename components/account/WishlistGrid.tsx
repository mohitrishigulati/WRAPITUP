"use client";

import Link from "next/link";
import { removeWishlistItemAction } from "@/actions/wishlist";
import { ProductImage } from "@/components/catalog/ProductImage";
import { formatUsd } from "@/lib/catalog/money";
import { productImageUrl } from "@/lib/catalog/images";

type WishlistEntry = {
  productId: string;
  product: {
    name: string;
    slug: string;
    images: string[];
    basePrice: { toString(): string };
    variants: { stock: number; price: { toString(): string } | null }[];
  };
};

function money(value: { toString(): string }) {
  return Number(value.toString());
}

function productMinPrice(product: WishlistEntry["product"]) {
  const base = money(product.basePrice);
  const variantPrices = product.variants.map((v) => (v.price ? money(v.price) : base));
  return variantPrices.length ? Math.min(...variantPrices) : base;
}

export function WishlistGrid({ items }: { items: WishlistEntry[] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <p className="text-zinc-700">Your wishlist is empty.</p>
        <Link href="/products" className="mt-3 inline-block text-sm font-medium hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.productId}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
        >
          <Link href={`/products/${item.product.slug}`} className="relative block aspect-square bg-zinc-100">
            <ProductImage
              src={productImageUrl(item.product.images[0] ?? null)}
              alt={item.product.name}
            />
          </Link>
          <div className="space-y-2 p-4">
            <Link href={`/products/${item.product.slug}`} className="font-medium text-zinc-900 hover:underline">
              {item.product.name}
            </Link>
            <p className="text-sm font-semibold text-zinc-900">
              {formatUsd(productMinPrice(item.product))}
            </p>
            <button
              type="button"
              className="text-sm text-red-600 hover:underline"
              onClick={() => void removeWishlistItemAction(item.productId)}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
