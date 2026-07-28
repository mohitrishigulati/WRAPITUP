"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { OrderStatus } from "@prisma/client";
import type { ActionResult } from "@/types/actions";
import { updateOrderAction } from "@/actions/admin/orders";

const initialState: ActionResult = { ok: false };

const statuses: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Update order"}
    </button>
  );
}

type OrderAdminFormProps = {
  orderId: string;
  status: OrderStatus;
  trackingNumber: string | null;
};

export function OrderAdminForm({ orderId, status, trackingNumber }: OrderAdminFormProps) {
  const [state, formAction] = useFormState(updateOrderAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-sm font-medium">
        Status
        <select name="status" defaultValue={status} className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Tracking number
        <input
          name="trackingNumber"
          defaultValue={trackingNumber ?? ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs text-zinc-500">
        Changing status to SHIPPED sends a shipping update email to the customer.
      </p>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
