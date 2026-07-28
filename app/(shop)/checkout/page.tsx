import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getShippingConfig } from "@/lib/checkout/shipping";
import { getPublicPaymentProvider } from "@/lib/payments/public-config";
import { getRazorpayKeyId } from "@/lib/razorpay";
import { getStripePublishableKey } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const { flatRate, freeThreshold } = getShippingConfig();
  const paymentProvider = getPublicPaymentProvider();

  let publishableKey: string | undefined;
  let razorpayKeyId: string | undefined;
  let configError: string | null = null;

  try {
    if (paymentProvider === "stripe") {
      publishableKey = getStripePublishableKey();
    } else {
      razorpayKeyId = getRazorpayKeyId();
    }
  } catch {
    configError =
      paymentProvider === "stripe"
        ? "Stripe publishable key is not configured."
        : "Razorpay keys are not configured.";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-semibold text-zinc-900">Checkout</h1>
      {configError ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {configError} Add{" "}
          {paymentProvider === "stripe" ? "Stripe" : "Razorpay"} keys to `.env` to enable checkout.
        </p>
      ) : (
        <CheckoutClient
          paymentProvider={paymentProvider}
          publishableKey={publishableKey}
          razorpayKeyId={razorpayKeyId}
          shippingFlatRate={flatRate}
          shippingFreeThreshold={freeThreshold}
        />
      )}
    </div>
  );
}
