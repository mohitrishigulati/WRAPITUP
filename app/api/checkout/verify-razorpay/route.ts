import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  fulfillPaidRazorpayOrder,
  orderEmailPayload,
} from "@/lib/checkout/checkout";
import { sendOrderConfirmationEmail } from "@/lib/mail-order";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { db } from "@/lib/db";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  const ip = await getClientIp();
  if (
    !checkRateLimit(rateLimitKey("checkout-verify-rzp", ip), {
      limit: 40,
      windowMs: 15 * 60 * 1000,
    })
  ) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await auth();
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
  }

  const pending = await db.checkoutPending.findUnique({
    where: { paymentIntentId: parsed.data.razorpay_order_id },
  });
  if (pending?.userId) {
    if (!session?.user?.id || session.user.id !== pending.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const order = await fulfillPaidRazorpayOrder({
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      razorpaySignature: parsed.data.razorpay_signature,
    });

    const fullOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        user: { select: { email: true } },
      },
    });
    if (fullOrder) {
      const emailPayload = orderEmailPayload(fullOrder);
      await sendOrderConfirmationEmail(emailPayload).catch((err) => {
        console.error("[order:email] failed", err);
      });
    }

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      paymentReference: parsed.data.razorpay_order_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    console.error("[razorpay:verify]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
