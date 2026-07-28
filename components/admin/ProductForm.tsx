"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { ActionResult } from "@/types/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type CategoryOption = { id: string; name: string };

type ProductFormProps = {
  categories: CategoryOption[];
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  initial?: {
    productId?: string;
    variantId?: string;
    name?: string;
    slug?: string;
    categoryId?: string;
    description?: string;
    basePrice?: number;
    isPublished?: boolean;
    images?: string[];
    defaultSku?: string;
    defaultVariantName?: string;
    stock?: number;
  };
  submitLabel: string;
};

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProductForm({ categories, action, initial, submitLabel }: ProductFormProps) {
  const [state, formAction] = useFormState(action, { ok: false });

  return (
    <form action={formAction} className="max-w-2xl space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      {initial?.productId ? <input type="hidden" name="productId" value={initial.productId} /> : null}
      {initial?.variantId ? <input type="hidden" name="variantId" value={initial.variantId} /> : null}

      <label className="block text-sm font-medium">
        Name
        <input name="name" required defaultValue={initial?.name} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Slug
        <input name="slug" defaultValue={initial?.slug} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Category
        <select name="categoryId" required defaultValue={initial?.categoryId} className={inputClass}>
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Base price (USD)
        <input
          name="basePrice"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial?.basePrice}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={initial?.description}
          className={inputClass}
        />
      </label>

      <ImageUploadField
        defaultValue={initial?.images?.join("\n") ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          SKU
          <input name="defaultSku" required defaultValue={initial?.defaultSku} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Variant name
          <input
            name="defaultVariantName"
            defaultValue={initial?.defaultVariantName ?? "Default"}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Inventory
          <input
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={initial?.stock ?? 0}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={initial?.isPublished}
        />
        Published on storefront
      </label>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/products" className="text-sm text-zinc-600 hover:text-zinc-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}
