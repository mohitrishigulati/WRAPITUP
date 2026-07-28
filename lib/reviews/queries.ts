import "server-only";

import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { sanitizeReviewText } from "@/lib/sanitize";
import { isSafeReviewPhotoPath } from "@/lib/uploads/safe-image";

/** Orders eligible for verified-purchase reviews. */
export const REVIEW_ELIGIBLE_ORDER_STATUSES: OrderStatus[] = ["DELIVERED"];

export async function findVerifiedOrderForProduct(userId: string, productId: string) {
  return db.order.findFirst({
    where: {
      userId,
      status: { in: REVIEW_ELIGIBLE_ORDER_STATUSES },
      items: {
        some: {
          productVariant: { productId },
        },
      },
    },
    select: { id: true, orderNumber: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function userCanReviewProduct(userId: string, productId: string) {
  const existing = await db.review.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  if (existing) {
    return { ok: false as const, reason: "already_reviewed" as const };
  }

  const order = await findVerifiedOrderForProduct(userId, productId);
  if (!order) {
    return { ok: false as const, reason: "no_eligible_order" as const };
  }

  return { ok: true as const, orderId: order.id, orderNumber: order.orderNumber };
}

export async function listProductReviews(productId: string) {
  const rows = await db.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
  });

  return rows.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: sanitizeReviewText(review.title),
    body: sanitizeReviewText(review.body),
    photoUrl:
      review.photoUrl && isSafeReviewPhotoPath(review.photoUrl) ? review.photoUrl : null,
    createdAt: review.createdAt.toISOString(),
    authorName: sanitizeReviewText(review.user.name) ?? "Verified buyer",
  }));
}

export function computeAverageRating(ratings: number[]) {
  if (!ratings.length) return { averageRating: null as number | null, reviewCount: 0 };
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return {
    averageRating: Math.round((sum / ratings.length) * 10) / 10,
    reviewCount: ratings.length,
  };
}
