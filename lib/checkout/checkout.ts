import "server-only";

import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import type { CheckoutPendingPayload } from "@/lib/validators/checkout";
import { priceCartLines, totalsToCents } from "@/lib/checkout/pricing";
import { getCheckoutCurrency, getPaymentProvider, type PaymentProvider } from "@/lib/payments/config";
import { getRazorpay, verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { getStripe } from "@/lib/stripe";

const PENDING_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_CHARGE_MINOR = 100;

type PreparedCheckout = {
  priced: Awaited<ReturnType<typeof priceCartLines>>;
  amountCents: number;
};

async function prepareCheckout(input: {
  userId?: string;
  guestEmail?: string;
  payload: CheckoutPendingPayload;
}): Promise<PreparedCheckout> {
  const priced = await priceCartLines(input.payload.items, input.payload.couponCode);

  if (priced.couponError) {
    throw new Error(priced.couponError);
  }

  if (!input.userId && !input.payload.guestEmail) {
    throw new Error("Email is required for guest checkout");
  }

  const amountCents = totalsToCents(priced.totals);
  if (amountCents < MIN_CHARGE_MINOR) {
    throw new Error("Order total is too small to charge");
  }

  return { priced, amountCents };
}

export async function createCheckoutPaymentIntent(input: {
  userId?: string;
  guestEmail?: string;
  payload: CheckoutPendingPayload;
}) {
  const { priced, amountCents } = await prepareCheckout(input);

  const stripe = getStripe();
  const currency = getCheckoutCurrency();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: input.userId ?? "",
      guestEmail: input.payload.guestEmail ?? input.guestEmail ?? "",
    },
  });

  await db.checkoutPending.create({
    data: {
      paymentIntentId: paymentIntent.id,
      provider: "stripe",
      userId: input.userId,
      guestEmail: input.payload.guestEmail ?? input.guestEmail,
      payload: input.payload,
      amountCents,
      expiresAt: new Date(Date.now() + PENDING_TTL_MS),
    },
  });

  return {
    provider: "stripe" as const,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    priced,
  };
}

export async function createCheckoutRazorpayOrder(input: {
  userId?: string;
  guestEmail?: string;
  payload: CheckoutPendingPayload;
}) {
  const { priced, amountCents } = await prepareCheckout(input);

  const razorpay = getRazorpay();
  const currency = getCheckoutCurrency().toUpperCase();
  const receipt = `wu_${Date.now().toString(36)}`.slice(0, 40);

  const order = await razorpay.orders.create({
    amount: amountCents,
    currency,
    receipt,
    notes: {
      userId: input.userId ?? "",
      guestEmail: input.payload.guestEmail ?? input.guestEmail ?? "",
    },
  });

  await db.checkoutPending.create({
    data: {
      paymentIntentId: order.id,
      provider: "razorpay",
      userId: input.userId,
      guestEmail: input.payload.guestEmail ?? input.guestEmail,
      payload: input.payload,
      amountCents,
      expiresAt: new Date(Date.now() + PENDING_TTL_MS),
    },
  });

  return {
    provider: "razorpay" as const,
    razorpayOrderId: order.id,
    amount: amountCents,
    currency,
    priced,
  };
}

export async function createCheckoutSession(input: {
  userId?: string;
  guestEmail?: string;
  payload: CheckoutPendingPayload;
}) {
  const provider = getPaymentProvider();
  if (provider === "razorpay") {
    return createCheckoutRazorpayOrder(input);
  }
  return createCheckoutPaymentIntent(input);
}

export function generateOrderNumber() {
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `WU-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export async function getOrderByPaymentReference(paymentReference: string) {
  return db.order.findFirst({
    where: {
      OR: [
        { stripePaymentIntentId: paymentReference },
        { razorpayOrderId: paymentReference },
      ],
    },
    include: {
      items: true,
      shippingAddress: true,
      user: { select: { email: true } },
    },
  });
}

/** @deprecated Use getOrderByPaymentReference */
export async function getOrderByPaymentIntent(paymentIntentId: string) {
  return getOrderByPaymentReference(paymentIntentId);
}

async function createPaidOrderFromPending(
  pending: {
    id: string;
    userId: string | null;
    guestEmail: string | null;
    amountCents: number;
    payload: unknown;
  },
  payment: {
    provider: PaymentProvider;
    referenceId: string;
    razorpayPaymentId?: string;
  },
) {
  const payload = pending.payload as CheckoutPendingPayload;
  const priced = await priceCartLines(payload.items, payload.couponCode);

  const repricedCents = totalsToCents(priced.totals);
  if (repricedCents !== pending.amountCents) {
    throw new Error("Checkout total changed since payment was initiated");
  }

  const billing = payload.billingSameAsShipping ? payload.shipping : payload.billing!;

  const order = await db.$transaction(async (tx) => {
    const coupon = priced.couponCode
      ? await tx.coupon.findUnique({ where: { code: priced.couponCode } })
      : null;

    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { redemptionCount: { increment: 1 } },
      });
    }

    for (const line of priced.lines) {
      const updated = await tx.productVariant.updateMany({
        where: {
          id: line.variantId,
          stock: { gte: line.quantity },
        },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.count !== 1) {
        throw new Error(`Insufficient stock for ${line.productName}`);
      }
    }

    const shippingAddress = await tx.address.create({
      data: {
        userId: pending.userId ?? null,
        ...payload.shipping,
        line2: payload.shipping.line2 ?? null,
        state: payload.shipping.state ?? null,
        phone: payload.shipping.phone ?? null,
      },
    });

    const billingAddress = payload.billingSameAsShipping
      ? shippingAddress
      : await tx.address.create({
          data: {
            userId: pending.userId ?? null,
            ...billing,
            line2: billing.line2 ?? null,
            state: billing.state ?? null,
            phone: billing.phone ?? null,
          },
        });

    const created = await tx.order.create({
      data: {
        userId: pending.userId,
        guestEmail: pending.guestEmail,
        orderNumber: generateOrderNumber(),
        status: "PAID",
        subtotal: priced.totals.subtotal,
        discountTotal: priced.totals.discount,
        shippingTotal: priced.totals.shipping,
        taxTotal: priced.totals.tax,
        total: priced.totals.total,
        couponId: coupon?.id,
        paymentProvider: payment.provider,
        stripePaymentIntentId:
          payment.provider === "stripe" ? payment.referenceId : null,
        razorpayOrderId: payment.provider === "razorpay" ? payment.referenceId : null,
        razorpayPaymentId: payment.razorpayPaymentId ?? null,
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        items: {
          create: priced.lines.map((line) => ({
            productVariantId: line.variantId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
            productName: line.productName,
            variantName: line.variantName,
            sku: line.sku,
            personalization: line.personalization ?? undefined,
          })),
        },
      },
      include: { items: true, shippingAddress: true },
    });

    if (pending.userId) {
      const cart = await tx.cart.findUnique({ where: { userId: pending.userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    await tx.checkoutPending.delete({ where: { id: pending.id } });

    if (payload.saveAddress && pending.userId) {
      await tx.address.create({
        data: {
          userId: pending.userId,
          ...payload.shipping,
          line2: payload.shipping.line2 ?? null,
          state: payload.shipping.state ?? null,
          phone: payload.shipping.phone ?? null,
          isDefaultShipping: true,
        },
      });
    }

    return created;
  });

  return order;
}

export async function fulfillPaidOrder(paymentIntentId: string) {
  const existing = await db.order.findFirst({
    where: {
      OR: [
        { stripePaymentIntentId: paymentIntentId },
        { razorpayOrderId: paymentIntentId },
      ],
    },
  });
  if (existing) {
    return existing;
  }

  const pending = await db.checkoutPending.findUnique({
    where: { paymentIntentId },
  });
  if (!pending) {
    throw new Error(`No pending checkout for payment ${paymentIntentId}`);
  }

  if (pending.provider === "razorpay") {
    throw new Error("Use fulfillPaidRazorpayOrder for Razorpay checkouts");
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") {
    throw new Error(`Payment intent ${paymentIntentId} is not succeeded`);
  }
  if (intent.amount !== pending.amountCents) {
    throw new Error("Payment amount mismatch");
  }

  return createPaidOrderFromPending(pending, {
    provider: "stripe",
    referenceId: paymentIntentId,
  });
}

export async function fulfillPaidRazorpayOrder(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}) {
  if (input.razorpaySignature) {
    verifyRazorpayPaymentSignature({
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
    });
  }

  const existing = await db.order.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
  });
  if (existing) {
    return existing;
  }

  const pending = await db.checkoutPending.findUnique({
    where: { paymentIntentId: input.razorpayOrderId },
  });
  if (!pending || pending.provider !== "razorpay") {
    throw new Error(`No pending Razorpay checkout for order ${input.razorpayOrderId}`);
  }

  const razorpay = getRazorpay();
  const payment = await razorpay.payments.fetch(input.razorpayPaymentId);
  if (payment.order_id !== input.razorpayOrderId) {
    throw new Error("Payment does not match order");
  }
  if (payment.status !== "captured" && payment.status !== "authorized") {
    throw new Error("Payment is not completed");
  }
  if (Number(payment.amount) !== pending.amountCents) {
    throw new Error("Payment amount mismatch");
  }

  return createPaidOrderFromPending(pending, {
    provider: "razorpay",
    referenceId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
  });
}

export type FulfilledOrderEmail = {
  to: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number; lineTotal: number }[];
};

export function orderEmailPayload(order: {
  orderNumber: string;
  guestEmail: string | null;
  total: { toString(): string };
  user: { email: string } | null;
  items: {
    productName: string;
    variantName: string;
    quantity: number;
    lineTotal: { toString(): string };
  }[];
}): FulfilledOrderEmail {
  const to = order.user?.email ?? order.guestEmail;
  if (!to) {
    throw new Error("Order has no recipient email");
  }

  return {
    to,
    orderNumber: order.orderNumber,
    total: Number(order.total.toString()),
    items: order.items.map((item) => ({
      name: `${item.productName} (${item.variantName})`,
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal.toString()),
    })),
  };
}
