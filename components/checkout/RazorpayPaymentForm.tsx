"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type RazorpayPaymentFormProps = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  customerEmail?: string;
  customerName?: string;
};

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayConstructorOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string; name?: string };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayConstructorOptions) => { open: () => void };
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser"));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export function RazorpayPaymentForm({
  orderId,
  amount,
  currency,
  keyId,
  customerEmail,
  customerName,
}: RazorpayPaymentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const openCheckout = useCallback(async () => {
    setError(null);
    setIsPaying(true);
    try {
      await loadRazorpayScript();
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay failed to initialize");
      }

      const rzp = new Razorpay({
        key: keyId,
        amount,
        currency,
        name: "WrapItUp",
        description: "Order payment",
        order_id: orderId,
        prefill: {
          email: customerEmail,
          name: customerName,
        },
        theme: { color: "#18181b" },
        handler: async (response) => {
          const verify = await fetch("/api/checkout/verify-razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const data = await verify.json();
          if (!verify.ok) {
            setError(data.error ?? "Payment verification failed");
            setIsPaying(false);
            return;
          }
          router.push(
            `/checkout/confirmation?payment_ref=${encodeURIComponent(response.razorpay_order_id)}`,
          );
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open payment");
      setIsPaying(false);
    }
  }, [amount, currency, customerEmail, customerName, keyId, orderId, router]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Pay with Razorpay</h2>
      <p className="mt-2 text-sm text-zinc-600">
        UPI, cards, netbanking, and wallets are supported. If the payment window did not open, use
        the button below.
      </p>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={() => void openCheckout()}
        disabled={isPaying}
        className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isPaying ? "Opening payment…" : "Pay now"}
      </button>
    </div>
  );
}
