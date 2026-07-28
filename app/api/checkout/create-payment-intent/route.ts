import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createCheckoutPaymentIntent,
} from "@/lib/checkout/checkout";
import { CheckoutValidationError, priceCartLines } from "@/lib/checkout/pricing";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import {
  addressSchema,
  cartLinesSchema,
  checkoutSchema,
} from "@/lib/validators/checkout";

const bodySchema = z.object({
  lines: cartLinesSchema,
  checkout: checkoutSchema,
});

export async function POST(request: Request) {
  const ip = await getClientIp();
  if (!checkRateLimit(rateLimitKey("checkout-pi", ip), { limit: 30, windowMs: 15 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many checkout attempts" }, { status: 429 });
  }

  const session = await auth();
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout data" }, { status: 400 });
  }

  const userId = session?.user?.id;
  if (!userId && !parsed.data.checkout.guestEmail) {
    return NextResponse.json(
      { error: "Guest email is required" },
      { status: 400 },
    );
  }

  const billing = parsed.data.checkout.billing;
  const billingParsed = billing ? addressSchema.safeParse(billing) : null;
  if (parsed.data.checkout.billingSameAsShipping === false && !billingParsed?.success) {
    return NextResponse.json({ error: "Invalid billing address" }, { status: 400 });
  }

  try {
    await priceCartLines(parsed.data.lines, parsed.data.checkout.couponCode);

    const shippingAddress = addressSchema.parse(parsed.data.checkout.shipping);
    const billingAddress =
      parsed.data.checkout.billingSameAsShipping === false
        ? addressSchema.parse(billing)
        : shippingAddress;

    const result = await createCheckoutPaymentIntent({
      userId,
      guestEmail: parsed.data.checkout.guestEmail,
      payload: {
        items: parsed.data.lines,
        couponCode: parsed.data.checkout.couponCode,
        guestEmail: parsed.data.checkout.guestEmail,
        shipping: shippingAddress,
        billing: billingAddress,
        billingSameAsShipping: parsed.data.checkout.billingSameAsShipping,
        saveAddress: parsed.data.checkout.saveAddress,
      },
    });

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      totals: result.priced.totals,
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
