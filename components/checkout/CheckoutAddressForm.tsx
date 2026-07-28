"use client";

import { useState } from "react";
import type { AddressInput } from "@/lib/validators/checkout";

type CheckoutAddressFormProps = {
  isLoggedIn: boolean;
  defaultEmail: string;
  isSubmitting: boolean;
  error: string | null;
  couponCode: string;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
  couponError: string | null;
  onSubmit: (values: {
    guestEmail?: string;
    shipping: AddressInput;
    billing?: AddressInput;
    billingSameAsShipping: boolean;
    saveAddress?: boolean;
  }) => void;
};

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900";

export function CheckoutAddressForm({
  isLoggedIn,
  defaultEmail,
  isSubmitting,
  error,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  couponError,
  onSubmit,
}: CheckoutAddressFormProps) {
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const shipping: AddressInput = {
      fullName: String(form.get("shipFullName") ?? ""),
      line1: String(form.get("shipLine1") ?? ""),
      line2: String(form.get("shipLine2") ?? "") || undefined,
      city: String(form.get("shipCity") ?? ""),
      state: String(form.get("shipState") ?? "") || undefined,
      postalCode: String(form.get("shipPostalCode") ?? ""),
      country: String(form.get("shipCountry") ?? "US"),
      phone: String(form.get("shipPhone") ?? "") || undefined,
    };

    const billing: AddressInput | undefined = billingSameAsShipping
      ? undefined
      : {
          fullName: String(form.get("billFullName") ?? ""),
          line1: String(form.get("billLine1") ?? ""),
          line2: String(form.get("billLine2") ?? "") || undefined,
          city: String(form.get("billCity") ?? ""),
          state: String(form.get("billState") ?? "") || undefined,
          postalCode: String(form.get("billPostalCode") ?? ""),
          country: String(form.get("billCountry") ?? "US"),
          phone: String(form.get("billPhone") ?? "") || undefined,
        };

    onSubmit({
      guestEmail: isLoggedIn ? undefined : String(form.get("guestEmail") ?? ""),
      shipping,
      billing,
      billingSameAsShipping,
      saveAddress: isLoggedIn && form.get("saveAddress") === "on",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-zinc-200 bg-white p-6">
      {!isLoggedIn ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Contact</h2>
          <label className="block text-sm font-medium text-zinc-800">
            Email
            <input
              name="guestEmail"
              type="email"
              required
              defaultValue={defaultEmail}
              autoComplete="email"
              className={inputClass}
            />
          </label>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Shipping address</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">
            Full name
            <input name="shipFullName" required className={inputClass} />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Address line 1
            <input name="shipLine1" required className={inputClass} />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Address line 2
            <input name="shipLine2" className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            City
            <input name="shipCity" required className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            State / region
            <input name="shipState" className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Postal code
            <input name="shipPostalCode" required className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Country
            <input name="shipCountry" required defaultValue="US" className={inputClass} />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Phone
            <input name="shipPhone" type="tel" className={inputClass} />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={billingSameAsShipping}
            onChange={(e) => setBillingSameAsShipping(e.target.checked)}
          />
          Billing address same as shipping
        </label>
        {!billingSameAsShipping ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium sm:col-span-2">
              Billing full name
              <input name="billFullName" required className={inputClass} />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">
              Billing address line 1
              <input name="billLine1" required className={inputClass} />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">
              Billing address line 2
              <input name="billLine2" className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              City
              <input name="billCity" required className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              State / region
              <input name="billState" className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Postal code
              <input name="billPostalCode" required className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Country
              <input name="billCountry" required defaultValue="US" className={inputClass} />
            </label>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Coupon</h2>
        <div className="flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value)}
            placeholder="Coupon code"
            className={inputClass.replace("mt-1 ", "")}
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Apply
          </button>
        </div>
        {couponError ? <p className="text-sm text-red-600">{couponError}</p> : null}
      </section>

      {isLoggedIn ? (
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" name="saveAddress" />
          Save shipping address to my account
        </label>
      ) : null}

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isSubmitting ? "Preparing payment…" : "Continue to payment"}
      </button>
    </form>
  );
}
