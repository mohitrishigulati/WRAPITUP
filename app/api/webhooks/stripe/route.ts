import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import {
  fulfillPaidOrder,
  orderEmailPayload,
} from "@/lib/checkout/checkout";
import { sendOrderConfirmationEmail } from "@/lib/mail-order";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    console.error("[stripe:webhook] signature verification failed", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    try {
      const order = await fulfillPaidOrder(paymentIntent.id);
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
      console.error("[stripe:webhook] fulfillment failed", error);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
