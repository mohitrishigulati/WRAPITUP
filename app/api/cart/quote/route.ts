import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCartLines, CheckoutValidationError } from "@/lib/checkout/pricing";
import { cartLinesSchema } from "@/lib/validators/checkout";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const bodySchema = z.object({
  lines: cartLinesSchema,
  couponCode: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = await getClientIp();
  if (!checkRateLimit(rateLimitKey("cart-quote", ip), { limit: 120, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const priced = await priceCartLines(parsed.data.lines, parsed.data.couponCode);
    return NextResponse.json(priced);
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
