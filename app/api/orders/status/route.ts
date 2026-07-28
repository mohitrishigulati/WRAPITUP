import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrderByPaymentIntent } from "@/lib/checkout/checkout";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export async function GET(request: Request) {
  const ip = await getClientIp();
  if (!checkRateLimit(rateLimitKey("order-status", ip), { limit: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get("payment_intent");
  if (!paymentIntentId || !/^pi_[a-zA-Z0-9]+$/.test(paymentIntentId)) {
    return NextResponse.json({ error: "Missing or invalid payment_intent" }, { status: 400 });
  }

  const session = await auth();
  const order = await getOrderByPaymentIntent(paymentIntentId);
  if (!order) {
    return NextResponse.json({ status: "pending" });
  }

  if (order.userId) {
    if (!session?.user?.id || session.user.id !== order.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({
    status: "paid",
    order: {
      orderNumber: order.orderNumber,
      total: order.total.toString(),
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.length,
    },
  });
}
