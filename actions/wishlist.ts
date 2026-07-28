"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export async function toggleWishlistAction(productId: string) {
  const user = await requireUser();

  const product = await db.product.findFirst({
    where: { id: productId, isPublished: true },
    select: { id: true },
  });
  if (!product) {
    return { ok: false as const, message: "Product not found" };
  }

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    revalidatePath(`/products/${productId}`);
    return { ok: true as const, saved: false };
  }

  await db.wishlistItem.create({
    data: { userId: user.id, productId },
  });
  revalidatePath("/account/wishlist");
  return { ok: true as const, saved: true };
}

export async function removeWishlistItemAction(productId: string) {
  const user = await requireUser("/account/wishlist");

  await db.wishlistItem.deleteMany({
    where: { userId: user.id, productId },
  });

  revalidatePath("/account/wishlist");
  return { ok: true as const };
}
