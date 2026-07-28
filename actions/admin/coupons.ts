"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { couponFormSchema, couponUpdateSchema } from "@/lib/validators/admin";
import type { ActionResult } from "@/types/actions";

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

function parseCouponForm(formData: FormData) {
  return {
    code: String(formData.get("code") ?? "").toUpperCase(),
    description: formData.get("description"),
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minOrderAmount: formData.get("minOrderAmount") || undefined,
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    startsAt: formData.get("startsAt") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
    isActive: formData.get("isActive") === "on",
  };
}

function parseOptionalDate(value: string | undefined) {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createCouponAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin("/admin/coupons/new");
  const parsed = couponFormSchema.safeParse(parseCouponForm(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  await db.coupon.create({
    data: {
      code: parsed.data.code,
      description: parsed.data.description ?? null,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      minOrderAmount: parsed.data.minOrderAmount ?? null,
      maxRedemptions: parsed.data.maxRedemptions ?? null,
      startsAt: parseOptionalDate(parsed.data.startsAt),
      expiresAt: parseOptionalDate(parsed.data.expiresAt),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function updateCouponAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin("/admin/coupons");
  const parsed = couponUpdateSchema.safeParse({
    ...parseCouponForm(formData),
    couponId: formData.get("couponId"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  await db.coupon.update({
    where: { id: parsed.data.couponId },
    data: {
      code: parsed.data.code,
      description: parsed.data.description ?? null,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      minOrderAmount: parsed.data.minOrderAmount ?? null,
      maxRedemptions: parsed.data.maxRedemptions ?? null,
      startsAt: parseOptionalDate(parsed.data.startsAt),
      expiresAt: parseOptionalDate(parsed.data.expiresAt),
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${parsed.data.couponId}/edit`);
  return { ok: true, message: "Coupon updated" };
}

export async function deactivateCouponByIdAction(couponId: string) {
  "use server";
  await requireAdmin("/admin/coupons");
  await db.coupon.update({
    where: { id: couponId },
    data: { isActive: false },
  });
  revalidatePath("/admin/coupons");
}
