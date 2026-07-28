import type { Metadata } from "next";
import { OrderConfirmationClient } from "@/components/checkout/OrderConfirmationClient";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

type ConfirmationPageProps = {
  searchParams: { payment_intent?: string; payment_ref?: string };
};

export default function CheckoutConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const paymentReference = searchParams.payment_ref ?? searchParams.payment_intent ?? "";
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <OrderConfirmationClient paymentReference={paymentReference} />
    </div>
  );
}
