import type { Metadata } from "next";
import { OrderConfirmationClient } from "@/components/checkout/OrderConfirmationClient";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

type ConfirmationPageProps = {
  searchParams: { payment_intent?: string };
};

export default function CheckoutConfirmationPage({ searchParams }: ConfirmationPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <OrderConfirmationClient paymentIntentId={searchParams.payment_intent ?? ""} />
    </div>
  );
}
