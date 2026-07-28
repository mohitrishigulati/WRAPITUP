"use client";

import type { PersonalizationFieldDef } from "@/lib/store/storefront-config";
import { useMemo, useState } from "react";
import type { ProductVariantView } from "@/types/catalog";
import { formatStorePrice } from "@/lib/catalog/money";
import { useCart } from "@/components/cart/CartProvider";

type ProductPurchasePanelProps = {
  productName: string;
  variants: ProductVariantView[];
  inStock: boolean;
  isPersonalizable?: boolean;
  personalizationFields?: PersonalizationFieldDef[];
  minOrderQty?: number;
  isBulkOnly?: boolean;
};

export function ProductPurchasePanel({
  productName,
  variants,
  inStock,
  isPersonalizable = false,
  personalizationFields = [],
  minOrderQty = 1,
  isBulkOnly = false,
}: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const [personalization, setPersonalization] = useState<Record<string, string>>({});

  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const variant of variants) {
      for (const key of Object.keys(variant.attributes)) keys.add(key);
    }
    return Array.from(keys);
  }, [variants]);

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const first = variants[0];
    if (first) {
      for (const key of Object.keys(first.attributes)) {
        initial[key] = first.attributes[key];
      }
    }
    return initial;
  });

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find((variant) =>
        attributeKeys.every((key) => variant.attributes[key] === selection[key]),
      ) ?? variants[0]
    );
  }, [variants, attributeKeys, selection]);

  const optionValues = (key: string) => {
    const values = new Set<string>();
    for (const variant of variants) {
      const value = variant.attributes[key];
      if (value) values.add(value);
    }
    return Array.from(values);
  };

  if (!selectedVariant) {
    return <p className="text-sm text-zinc-600">No variants available.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="price space-y-1">
        <span className="sr-only">Sale price</span>
        <p className="text-2xl font-semibold text-sale-price">
          {formatStorePrice(selectedVariant.price)}
        </p>
        {selectedVariant.compareAtPrice &&
        selectedVariant.compareAtPrice > selectedVariant.price ? (
          <>
            <span className="sr-only">Regular price</span>
            <p className="text-base text-sale-strike line-through">
              {formatStorePrice(selectedVariant.compareAtPrice)}
            </p>
          </>
        ) : null}
      </div>

      {attributeKeys.map((key) => (
        <div key={key}>
          <p className="mb-2 text-sm font-medium capitalize text-zinc-900">{key}</p>
          <div className="flex flex-wrap gap-2">
            {optionValues(key).map((value) => {
              const active = selection[key] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelection((prev) => ({ ...prev, [key]: value }))}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 text-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {isPersonalizable && personalizationFields.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-brand-200 bg-brand-50/50 p-4">
          <p className="text-sm font-semibold text-zinc-900">Personalization</p>
          {personalizationFields.map((field) => (
            <label key={field.key} className="block text-sm">
              {field.label}
              <input
                type="text"
                maxLength={field.maxLength}
                value={personalization[field.key] ?? ""}
                onChange={(e) =>
                  setPersonalization((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                required
              />
            </label>
          ))}
        </div>
      ) : null}

      {isBulkOnly ? (
        <p className="text-sm text-zinc-600">
          Bulk / corporate SKU — minimum order qty: {minOrderQty}.{" "}
          <a href="/corporate-gifts" className="font-medium text-brand-600 hover:underline">
            Contact us for bulk pricing
          </a>
        </p>
      ) : null}

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
        <p className="font-medium text-zinc-900">{selectedVariant.name}</p>
        <p className="text-zinc-600">SKU: {selectedVariant.sku}</p>
        <p className={selectedVariant.stock > 0 ? "text-emerald-700" : "text-red-600"}>
          {selectedVariant.stock > 0
            ? `${selectedVariant.stock} in stock`
            : "Out of stock"}
        </p>
      </div>

      <button
        type="button"
        disabled={!inStock || selectedVariant.stock <= 0 || isAdding}
        onClick={() => {
          if (isPersonalizable) {
            for (const field of personalizationFields) {
              if (!personalization[field.key]?.trim()) return;
            }
          }
          setIsAdding(true);
          const pers =
            isPersonalizable && Object.keys(personalization).length
              ? personalization
              : undefined;
          void addItem(selectedVariant.id, Math.max(minOrderQty, 1), pers).finally(() =>
            setIsAdding(false),
          );
        }}
        className="w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Add ${productName} to cart`}
      >
        {isAdding ? "Adding…" : "Add to cart"}
      </button>
    </div>
  );
}
