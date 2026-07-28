import "server-only";

import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/catalog/money";

const PAID_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export async function getAdminAnalytics() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [orders, orderItems] = await Promise.all([
    db.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: PAID_STATUSES },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    }),
    db.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: since },
          status: { in: PAID_STATUSES },
        },
      },
      select: {
        productName: true,
        quantity: true,
        lineTotal: true,
      },
    }),
  ]);

  const revenueByDay = new Map<string, number>();
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const amount = decimalToNumber(order.total);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + amount);
  }

  const revenueSeries = Array.from(revenueByDay.entries()).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));

  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const item of orderItems) {
    const current = productMap.get(item.productName) ?? {
      name: item.productName,
      quantity: 0,
      revenue: 0,
    };
    current.quantity += item.quantity;
    current.revenue += decimalToNumber(item.lineTotal);
    productMap.set(item.productName, current);
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)
    .map((p) => ({
      name: p.name,
      quantity: p.quantity,
      revenue: Math.round(p.revenue * 100) / 100,
    }));

  const totalRevenue = orders.reduce(
    (sum, order) => sum + decimalToNumber(order.total),
    0,
  );

  return {
    orderCount: orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    revenueSeries,
    topProducts,
  };
}

export async function listAdminProducts() {
  return db.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      variants: { select: { id: true, sku: true, stock: true } },
    },
  });
}

export async function getAdminProduct(productId: string) {
  return db.product.findUnique({
    where: { id: productId },
    include: { category: true, variants: { orderBy: { name: "asc" } } },
  });
}

export async function listAdminOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      items: { select: { id: true } },
    },
  });
}

export async function getAdminOrder(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, name: true } },
      items: true,
      shippingAddress: true,
      coupon: { select: { code: true } },
    },
  });
}

export async function listAdminCustomers() {
  return db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
}

export async function listAdminCoupons() {
  return db.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminCoupon(couponId: string) {
  return db.coupon.findUnique({ where: { id: couponId } });
}

export async function listCategoriesForAdmin() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export type AdminAnalytics = Awaited<ReturnType<typeof getAdminAnalytics>>;
