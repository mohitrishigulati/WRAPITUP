import "server-only";

import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { orderAccessFilter } from "@/lib/account/order-access";

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
    case "PAID":
      return "Placed";
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "REFUNDED":
      return "Refunded";
    default:
      return status;
  }
}

export async function listOrdersForUser(userId: string) {
  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true } },
    },
  });
}

/** Returns null if the order does not exist or belongs to another user. */
export async function getOrderForUser(userId: string, orderId: string) {
  return db.order.findFirst({
    where: orderAccessFilter(userId, orderId),
    include: {
      items: true,
      shippingAddress: true,
      billingAddress: true,
      coupon: { select: { code: true } },
    },
  });
}

export async function listAddressesForUser(userId: string) {
  return db.address.findMany({
    where: { userId },
    orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAddressForUser(userId: string, addressId: string) {
  return db.address.findFirst({
    where: { id: addressId, userId },
  });
}

export async function listWishlistForUser(userId: string) {
  return db.wishlistItem.findMany({
    where: { userId, product: { isPublished: true } },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          category: { select: { name: true } },
          variants: { select: { stock: true, price: true } },
        },
      },
    },
  });
}

export async function isProductInWishlist(userId: string, productId: string) {
  const item = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return Boolean(item);
}

export async function getWishlistProductIds(userId: string, productIds: string[]) {
  if (!productIds.length) return new Set<string>();
  const items = await db.wishlistItem.findMany({
    where: { userId, productId: { in: productIds } },
    select: { productId: true },
  });
  return new Set(items.map((item) => item.productId));
}
