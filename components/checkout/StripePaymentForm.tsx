"use client";

import { useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type StripePaymentFormProps = {
  paymentIntentId: string;
};

export function StripePaymentForm({ paymentIntentId }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const returnUrl = `${window.location.origin}/checkout/confirmation?payment_intent=${encodeURIComponent(paymentIntentId)}`;

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setIsProcessing(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-zinc-900">Payment</h2>
      <p className="text-sm text-zinc-600">
        Card details are processed securely by Stripe. WrapItUp never sees your full card number.
      </p>
      <PaymentElement />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isProcessing ? "Processing…" : "Pay now"}
      </button>
    </form>
  );
}
