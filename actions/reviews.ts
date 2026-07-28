"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { sanitizeReviewText } from "@/lib/sanitize";
import {
  REVIEW_ELIGIBLE_ORDER_STATUSES,
  userCanReviewProduct,
} from "@/lib/reviews/queries";
import { reviewFormSchema } from "@/lib/validators/reviews";
import { isReviewPhotoOwnedByUser, isAllowedReviewPhotoSubmission } from "@/lib/uploads/safe-image";
import type { ActionResult } from "@/types/actions";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

export async function submitReviewAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const allowed = checkRateLimit(rateLimitKey("review", user.id), {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return { ok: false, message: "Too many reviews submitted. Try again later." };
  }

  const parsed = reviewFormSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
    photoUrl: formData.get("photoUrl"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const product = await db.product.findFirst({
    where: { id: parsed.data.productId, isPublished: true },
    select: { id: true, slug: true },
  });
  if (!product) {
    return { ok: false, message: "Product not found" };
  }

  const eligibility = await userCanReviewProduct(user.id, product.id);
  if (!eligibility.ok) {
    if (eligibility.reason === "already_reviewed") {
      return { ok: false, message: "You already reviewed this product" };
    }
    return {
      ok: false,
      message: "Reviews require a delivered order that includes this product",
    };
  }

  const verifiedOrder = await db.order.findFirst({
    where: {
      id: eligibility.orderId,
      userId: user.id,
      status: { in: REVIEW_ELIGIBLE_ORDER_STATUSES },
      items: {
        some: {
          productVariant: { productId: product.id },
        },
      },
    },
    select: { id: true },
  });
  if (!verifiedOrder) {
    return {
      ok: false,
      message: "Reviews require a delivered order that includes this product",
    };
  }

  const title = sanitizeReviewText(parsed.data.title ?? null);
  const body = sanitizeReviewText(parsed.data.body ?? null);
  if (!body) {
    return { ok: false, fieldErrors: { body: ["Review text is required"] } };
  }

  const photoUrl = parsed.data.photoUrl?.trim() || null;
  if (photoUrl && (!isReviewPhotoOwnedByUser(photoUrl, user.id) || !isAllowedReviewPhotoSubmission(photoUrl))) {
    return { ok: false, message: "Invalid review photo" };
  }

  try {
    await db.review.create({
      data: {
        userId: user.id,
        productId: product.id,
        orderId: verifiedOrder.id,
        rating: parsed.data.rating,
        title,
        body,
        photoUrl,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, message: "You already reviewed this product" };
    }
    throw error;
  }

  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/products");
  return { ok: true, message: "Thank you for your review" };
}
