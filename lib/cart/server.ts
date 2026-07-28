import "server-only";

import { db } from "@/lib/db";
import type { CartLine } from "@/types/cart";
import { cartLineKey } from "@/types/cart";

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
    personalization:
      item.personalization && typeof item.personalization === "object"
        ? (item.personalization as Record<string, string>)
        : undefined,
  }));
}

function lineIdentity(line: CartLine) {
  return cartLineKey(line);
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
          personalization: line.personalization ?? undefined,
        })),
      });
    }
  });
}

export async function mergeGuestCartIntoUser(userId: string, guestLines: CartLine[]) {
  const cart = await getOrCreateCart(userId);
  const existingLines: CartLine[] = cart.items.map((item) => ({
    variantId: item.productVariantId,
    quantity: item.quantity,
    personalization:
      item.personalization && typeof item.personalization === "object"
        ? (item.personalization as Record<string, string>)
        : undefined,
  }));

  const mergedMap = new Map<string, CartLine>();
  for (const line of [...existingLines, ...guestLines]) {
    const key = lineIdentity(line);
    const current = mergedMap.get(key);
    if (current) {
      current.quantity = Math.min(99, current.quantity + line.quantity);
    } else {
      mergedMap.set(key, { ...line });
    }
  }

  const merged = Array.from(mergedMap.values());
  await replaceUserCart(userId, merged);
  return merged;
}
