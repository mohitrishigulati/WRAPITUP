"use client";

import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import type { ActionResult } from "@/types/actions";
import {
  createAddressAction,
  deleteAddressAction,
  updateAddressAction,
} from "@/actions/addresses";

const initialState: ActionResult = { ok: false };

type AddressRecord = {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

type AddressManagerProps = {
  addresses: AddressRecord[];
};

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function AddressFields({ address }: { address?: AddressRecord }) {
  return (
    <>
      <label className="block text-sm font-medium sm:col-span-2">
        Label (optional)
        <input name="label" defaultValue={address?.label ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        Full name
        <input name="fullName" required defaultValue={address?.fullName ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        Address line 1
        <input name="line1" required defaultValue={address?.line1 ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        Address line 2
        <input name="line2" defaultValue={address?.line2 ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        City
        <input name="city" required defaultValue={address?.city ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        State
        <input name="state" defaultValue={address?.state ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Postal code
        <input name="postalCode" required defaultValue={address?.postalCode ?? ""} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Country
        <input name="country" required defaultValue={address?.country ?? "US"} className={inputClass} />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        Phone
        <input name="phone" defaultValue={address?.phone ?? ""} className={inputClass} />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          name="isDefaultShipping"
          defaultChecked={address?.isDefaultShipping}
        />
        Default shipping
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          name="isDefaultBilling"
          defaultChecked={address?.isDefaultBilling}
        />
        Default billing
      </label>
    </>
  );
}

function CreateAddressForm() {
  const [state, formAction] = useFormState(createAddressAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="font-medium text-zinc-900">Add address</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <AddressFields />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p>
      ) : null}
      <SaveButton label="Add address" />
    </form>
  );
}

function EditAddressForm({ address }: { address: AddressRecord }) {
  const [state, formAction] = useFormState(updateAddressAction, initialState);
  const router = useRouter();

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <input type="hidden" name="addressId" value={address.id} />
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-900">{address.label ?? "Saved address"}</h3>
        <button
          type="button"
          className="text-sm text-red-600 hover:underline"
          onClick={() =>
            void deleteAddressAction(address.id).then((result) => {
              if (result.ok) router.refresh();
            })
          }
        >
          Delete
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <AddressFields address={address} />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p>
      ) : null}
      <SaveButton label="Update address" />
    </form>
  );
}

export function AddressManager({ addresses }: AddressManagerProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900">Saved addresses</h2>
      {addresses.map((address) => (
        <EditAddressForm key={address.id} address={address} />
      ))}
      <CreateAddressForm />
    </div>
  );
}
