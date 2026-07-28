/** Prisma `where` clause — always pair order id with the owning user id. */
export function orderAccessFilter(userId: string, orderId: string) {
  return { id: orderId, userId };
}
