import "server-only";

import { CouponType, type Coupon } from "@prisma/client";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/catalog/money";

export type CouponResult =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; message: string };

export async function validateCoupon(
  code: string | undefined,
  subtotal: number,
): Promise<CouponResult> {
  if (!code?.trim()) {
    return { ok: false, message: "No coupon applied" };
  }

  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return { ok: false, message: "Invalid coupon code" };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, message: "Coupon is not active yet" };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { ok: false, message: "Coupon has expired" };
  }
  if (
    coupon.maxRedemptions !== null &&
    coupon.redemptionCount >= coupon.maxRedemptions
  ) {
    return { ok: false, message: "Coupon redemption limit reached" };
  }

  const minOrder = coupon.minOrderAmount
    ? decimalToNumber(coupon.minOrderAmount)
    : 0;
  if (subtotal < minOrder) {
    return {
      ok: false,
      message: `Minimum order of $${minOrder.toFixed(2)} required for this coupon`,
    };
  }

  const value = decimalToNumber(coupon.discountValue);
  let discount = 0;
  if (coupon.discountType === CouponType.PERCENT) {
    discount = Math.min(subtotal, (subtotal * value) / 100);
  } else {
    discount = Math.min(subtotal, value);
  }

  if (discount <= 0) {
    return { ok: false, message: "Coupon does not apply to this order" };
  }

  return { ok: true, coupon, discount: roundMoney(discount) };
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}
