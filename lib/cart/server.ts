import "server-only";

import { db } from "@/lib/db";
import type { CartLine } from "@/types/cart";

export async function getOrCreateCart(userId: string) {
  return db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { items: true },
  });
}

export async function getCartLinesForUser(userId: string): Promise<CartLine[]> {
  const cart = await db.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!cart) return [];
  return cart.items.map((item) => ({
    variantId: item.productVariantId,
    quantity: item.quantity,
  }));
}

export async function replaceUserCart(userId: string, lines: CartLine[]) {
  const cart = await getOrCreateCart(userId);
  await db.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (lines.length) {
      await tx.cartItem.createMany({
        data: lines.map((line) => ({
          cartId: cart.id,
          productVariantId: line.variantId,
          quantity: line.quantity,
        })),
      });
    }
  });
}

export async function mergeGuestCartIntoUser(userId: string, guestLines: CartLine[]) {
  const cart = await getOrCreateCart(userId);
  const existing = new Map(
    cart.items.map((item) => [item.productVariantId, item.quantity]),
  );

  for (const line of guestLines) {
    const current = existing.get(line.variantId) ?? 0;
    existing.set(line.variantId, Math.min(99, current + line.quantity));
  }

  const merged = Array.from(existing.entries()).map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));

  await replaceUserCart(userId, merged);
  return merged;
}
