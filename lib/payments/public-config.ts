export type PublicPaymentProvider = "stripe" | "razorpay";

/** Client-safe: which checkout UI to show. */
export function getPublicPaymentProvider(): PublicPaymentProvider {
  const explicit = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER?.trim().toLowerCase();
  if (explicit === "stripe" || explicit === "razorpay") {
    return explicit;
  }
  if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim()) {
    return "razorpay";
  }
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) {
    return "stripe";
  }
  return "razorpay";
}
