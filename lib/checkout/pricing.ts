import "server-only";

import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/catalog/money";
import { productImageUrl } from "@/lib/catalog/images";
import { validateCoupon } from "@/lib/checkout/coupons";
import { calculateShipping } from "@/lib/checkout/shipping";
import type { CartLine, CartTotals, PricedCart } from "@/types/cart";

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

export async function priceCartLines(
  lines: CartLine[],
  couponCode?: string,
): Promise<PricedCart> {
  if (!lines.length) {
    throw new CheckoutValidationError("Your cart is empty");
  }

  const variantIds = lines.map((line) => line.variantId);
  const variants = await db.productVariant.findMany({
    where: {
      id: { in: variantIds },
      product: { isPublished: true },
    },
    include: {
      product: { select: { name: true, images: true, basePrice: true, isPublished: true } },
    },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  const pricedLines = [];
  let subtotal = 0;

  for (const line of lines) {
    const variant = variantMap.get(line.variantId);
    if (!variant) {
      throw new CheckoutValidationError("A cart item is no longer available");
    }
    if (line.quantity > variant.stock) {
      throw new CheckoutValidationError(
        `Only ${variant.stock} left in stock for ${variant.product.name}`,
      );
    }

    const unitPrice = decimalToNumber(variant.price ?? variant.product.basePrice);
    const lineTotal = roundMoney(unitPrice * line.quantity);
    subtotal += lineTotal;

    pricedLines.push({
      variantId: variant.id,
      quantity: line.quantity,
      productName: variant.product.name,
      variantName: variant.name,
      sku: variant.sku,
      imageUrl: productImageUrl(variant.product.images[0] ?? null),
      unitPrice,
      lineTotal,
      inStock: variant.stock > 0,
      maxQuantity: variant.stock,
    });
  }

  subtotal = roundMoney(subtotal);

  let discount = 0;
  let couponError: string | null = null;
  let appliedCouponCode: string | null = null;

  if (couponCode?.trim()) {
    const couponResult = await validateCoupon(couponCode, subtotal);
    if (couponResult.ok) {
      discount = couponResult.discount;
      appliedCouponCode = couponResult.coupon.code;
    } else if (couponResult.message !== "No coupon applied") {
      couponError = couponResult.message;
    }
  }

  const subtotalAfterDiscount = roundMoney(Math.max(0, subtotal - discount));
  const shipping = roundMoney(calculateShipping(subtotalAfterDiscount));
  const tax = 0;
  const total = roundMoney(subtotalAfterDiscount + shipping + tax);

  const totals: CartTotals = {
    subtotal,
    discount,
    shipping,
    tax,
    total,
  };

  return {
    lines: pricedLines,
    totals,
    couponCode: appliedCouponCode,
    couponError,
  };
}

export function totalsToCents(totals: CartTotals) {
  return Math.round(totals.total * 100);
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}
