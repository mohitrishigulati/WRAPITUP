import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getShippingConfig } from "@/lib/checkout/shipping";
import { getStripePublishableKey } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const { flatRate, freeThreshold } = getShippingConfig();

  let publishableKey: string | null = null;
  let configError: string | null = null;
  try {
    publishableKey = getStripePublishableKey();
  } catch {
    configError = "Stripe publishable key is not configured.";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold text-zinc-900">Checkout</h1>
      {configError || !publishableKey ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {configError ?? "Payments are not configured."} Add Stripe keys to `.env` to enable
          checkout.
        </p>
      ) : (
        <CheckoutClient
          publishableKey={publishableKey}
          shippingFlatRate={flatRate}
          shippingFreeThreshold={freeThreshold}
        />
      )}
    </div>
  );
}
