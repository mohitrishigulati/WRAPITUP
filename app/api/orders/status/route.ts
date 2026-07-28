import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrderByPaymentReference } from "@/lib/checkout/checkout";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const PAYMENT_REF_PATTERN = /^(pi_[a-zA-Z0-9]+|order_[a-zA-Z0-9]+)$/;

export async function GET(request: Request) {
  const ip = await getClientIp();
  if (!checkRateLimit(rateLimitKey("order-status", ip), { limit: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const paymentRef =
    searchParams.get("payment_ref") ?? searchParams.get("payment_intent") ?? "";
  if (!paymentRef || !PAYMENT_REF_PATTERN.test(paymentRef)) {
    return NextResponse.json({ error: "Missing or invalid payment reference" }, { status: 400 });
  }

  const session = await auth();
  const order = await getOrderByPaymentReference(paymentRef);
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
