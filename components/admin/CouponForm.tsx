"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { CouponType } from "@prisma/client";
import type { ActionResult } from "@/types/actions";

type CouponFormProps = {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  initial?: {
    couponId?: string;
    code?: string;
    description?: string | null;
    discountType?: CouponType;
    discountValue?: number;
    minOrderAmount?: number | null;
    maxRedemptions?: number | null;
    startsAt?: string;
    expiresAt?: string;
    isActive?: boolean;
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

function toInputDate(value?: string) {
  if (!value) return "";
  return value.slice(0, 16);
}

export function CouponForm({ action, initial, submitLabel }: CouponFormProps) {
  const [state, formAction] = useFormState(action, { ok: false });

  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      {initial?.couponId ? <input type="hidden" name="couponId" value={initial.couponId} /> : null}
      <label className="block text-sm font-medium">
        Code
        <input name="code" required defaultValue={initial?.code} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Description
        <input name="description" defaultValue={initial?.description ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Discount type
        <select name="discountType" defaultValue={initial?.discountType ?? "PERCENT"} className={inputClass}>
          <option value="PERCENT">Percent</option>
          <option value="FIXED">Fixed amount</option>
        </select>
      </label>
      <label className="block text-sm font-medium">
        Discount value
        <input
          name="discountValue"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial?.discountValue}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium">
        Minimum order amount
        <input
          name="minOrderAmount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial?.minOrderAmount ?? ""}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium">
        Max redemptions
        <input
          name="maxRedemptions"
          type="number"
          min="1"
          defaultValue={initial?.maxRedemptions ?? ""}
          className={inputClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Starts at
          <input
            name="startsAt"
            type="datetime-local"
            defaultValue={toInputDate(initial?.startsAt)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Expires at
          <input
            name="expiresAt"
            type="datetime-local"
            defaultValue={toInputDate(initial?.expiresAt)}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} />
        Active
      </label>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p>
      ) : null}
      <div className="flex gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/coupons" className="text-sm text-zinc-600 hover:text-zinc-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}
