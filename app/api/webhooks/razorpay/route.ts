import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import {
  fulfillPaidRazorpayOrder,
  orderEmailPayload,
} from "@/lib/checkout/checkout";
import { sendOrderConfirmationEmail } from "@/lib/mail-order";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type RazorpayWebhookPayload = {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
};

function verifyWebhookSignature(body: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Invalid webhook signature");
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("x-razorpay-signature");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  try {
    verifyWebhookSignature(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    console.error("[razorpay:webhook] signature verification failed", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(body) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "payment.authorized") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;
    if (!orderId || !paymentId) {
      return NextResponse.json({ received: true });
    }

    try {
      const order = await fulfillPaidRazorpayOrder({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
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
    } catch (error) {
      console.error("[razorpay:webhook] fulfillment failed", error);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
