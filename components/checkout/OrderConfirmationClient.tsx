"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/lib/catalog/money";

type OrderConfirmationClientProps = {
  paymentIntentId: string;
};

type OrderStatusResponse =
  | { status: "pending" }
  | {
      status: "paid";
      order: {
        orderNumber: string;
        total: string;
        itemCount: number;
      };
    };

export function OrderConfirmationClient({ paymentIntentId }: OrderConfirmationClientProps) {
  const { clearCart } = useCart();
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!paymentIntentId) return;

    let cancelled = false;

    async function poll(attempt: number) {
      if (cancelled || attempt > 20) {
        if (!cancelled) setTimedOut(true);
        return;
      }

      const response = await fetch(
        `/api/orders/status?payment_intent=${encodeURIComponent(paymentIntentId)}`,
      );
      const json = (await response.json()) as OrderStatusResponse;
      if (cancelled) return;

      setData(json);
      if (json.status === "paid") {
        await clearCart();
        return;
      }

      setTimeout(() => void poll(attempt + 1), 1500);
    }

    void poll(0);
    return () => {
      cancelled = true;
    };
  }, [paymentIntentId, clearCart]);

  if (!paymentIntentId) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-zinc-700">Missing payment reference.</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-medium hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!data || data.status === "pending") {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Confirming payment…</h1>
        <p className="mt-2 text-zinc-600">
          Your order is created only after Stripe notifies our server. This usually takes a few
          seconds.
        </p>
        {timedOut ? (
          <p className="mt-4 text-sm text-amber-700">
            Still processing. Refresh this page in a moment or check your email for confirmation.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Order confirmed</h1>
      <p className="mt-2 text-zinc-600">
        Thank you! Order <strong>{data.order.orderNumber}</strong> is paid (
        {formatUsd(Number.parseFloat(data.order.total))}).
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        A confirmation email is on its way. Items: {data.order.itemCount}
      </p>
      <Link
        href="/products"
        className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Continue shopping
      </Link>
    </div>
  );
}
