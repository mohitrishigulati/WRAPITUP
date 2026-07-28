import "server-only";

export type PaymentProvider = "stripe" | "razorpay";

export function getPaymentProvider(): PaymentProvider {
  const explicit = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (explicit === "stripe" || explicit === "razorpay") {
    return explicit;
  }
  if (process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim()) {
    return "razorpay";
  }
  return "stripe";
}

export function getCheckoutCurrency(): string {
  const c = process.env.NEXT_PUBLIC_STORE_CURRENCY?.trim().toUpperCase();
  if (c === "USD") return "usd";
  return "inr";
}
