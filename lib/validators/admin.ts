import { z } from "zod";
import { CouponType } from "@prisma/client";

export const productFormSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  categoryId: z.string().min(1),
  description: z.string().trim().optional(),
  basePrice: z.coerce.number().min(0),
  isPublished: z.boolean(),
  images: z.string().trim().optional(),
  defaultSku: z.string().trim().min(2),
  defaultVariantName: z.string().trim().min(1).default("Default"),
  stock: z.coerce.number().int().min(0),
});

export const productUpdateSchema = productFormSchema.extend({
  productId: z.string().min(1),
});

export const orderUpdateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  trackingNumber: z.string().trim().optional(),
});

export const couponFormSchema = z.object({
  code: z.string().trim().min(2),
  description: z.string().trim().optional(),
  discountType: z.nativeEnum(CouponType),
  discountValue: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxRedemptions: z.coerce.number().int().positive().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

export const couponUpdateSchema = couponFormSchema.extend({
  couponId: z.string().min(1),
});

export function parseImageList(raw: string | undefined) {
  if (!raw?.trim()) return [] as string[];
  return raw
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}
