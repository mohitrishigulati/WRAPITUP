"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/components/cart/CartProvider";
import { CheckoutAddressForm } from "@/components/checkout/CheckoutAddressForm";
import { RazorpayPaymentForm } from "@/components/checkout/RazorpayPaymentForm";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";
import { formatUsd } from "@/lib/catalog/money";
import type { PublicPaymentProvider } from "@/lib/payments/public-config";
import type { AddressInput } from "@/lib/validators/checkout";

type CheckoutClientProps = {
  paymentProvider: PublicPaymentProvider;
  publishableKey?: string;
  razorpayKeyId?: string;
  shippingFlatRate: number;
  shippingFreeThreshold: number;
};

type RazorpayCheckoutState = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  customerEmail?: string;
  customerName?: string;
};

export function CheckoutClient({
  publishableKey,
  razorpayKeyId,
  shippingFlatRate,
  shippingFreeThreshold,
}: CheckoutClientProps) {
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey],
  );
  const { data: session } = useSession();
  const { lines, priced, refreshQuote } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<"details" | "payment">("details");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [razorpayCheckout, setRazorpayCheckout] = useState<RazorpayCheckoutState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  if (!lines.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <p className="text-zinc-700">Your cart is empty.</p>
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="mt-4 text-sm font-medium text-zinc-900 hover:underline"
        >
          Browse products
        </button>
      </div>
    );
  }

  async function startPayment(form: {
    guestEmail?: string;
    shipping: AddressInput;
    billing?: AddressInput;
    billingSameAsShipping: boolean;
    saveAddress?: boolean;
  }) {
    setError(null);
    setIsSubmitting(true);
    try {
      await refreshQuote(couponCode || undefined);
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          checkout: {
            ...form,
            couponCode: couponCode || undefined,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not start checkout");
      }

      if (data.provider === "razorpay") {
        setRazorpayCheckout({
          orderId: data.razorpayOrderId,
          amount: data.amount,
          currency: data.currency,
          keyId: data.keyId ?? razorpayKeyId ?? "",
          customerEmail: form.guestEmail ?? session?.user?.email ?? undefined,
          customerName: form.shipping.fullName,
        });
      } else {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      }
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        {step === "details" ? (
          <CheckoutAddressForm
            isLoggedIn={Boolean(session?.user)}
            defaultEmail={session?.user?.email ?? ""}
            isSubmitting={isSubmitting}
            error={error}
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            onApplyCoupon={() => void refreshQuote(couponCode || undefined)}
            couponError={priced?.couponError ?? null}
            onSubmit={(values) => void startPayment(values)}
          />
        ) : razorpayCheckout ? (
          <RazorpayPaymentForm {...razorpayCheckout} />
        ) : clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm paymentIntentId={paymentIntentId ?? ""} />
          </Elements>
        ) : null}
      </div>

      <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Summary</h2>
        <p className="mt-2 text-zinc-600">
          Shipping: {formatUsd(shippingFlatRate)} flat rate, free over{" "}
          {formatUsd(shippingFreeThreshold)}.
        </p>
        {priced ? (
          <dl className="mt-4 space-y-2">
            <div className="flex justify-between">
              <dt className="text-zinc-600">Subtotal</dt>
              <dd>{formatUsd(priced.totals.subtotal)}</dd>
            </div>
            {priced.totals.discount > 0 ? (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount</dt>
                <dd>-{formatUsd(priced.totals.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-zinc-600">Shipping</dt>
              <dd>{formatUsd(priced.totals.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
              <dt>Total</dt>
              <dd>{formatUsd(priced.totals.total)}</dd>
            </div>
          </dl>
        ) : null}
      </aside>
    </div>
  );
}
