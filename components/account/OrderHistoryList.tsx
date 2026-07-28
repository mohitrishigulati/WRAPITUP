import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { orderStatusLabel } from "@/lib/account/queries";
import { formatUsd } from "@/lib/catalog/money";

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: { toString(): string };
  createdAt: Date;
  itemCount: number;
};

export function OrderHistoryList({ orders }: { orders: OrderSummary[] }) {
  if (!orders.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <p className="text-zinc-700">You have not placed any orders yet.</p>
        <Link href="/products" className="mt-3 inline-block text-sm font-medium hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/account/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 hover:bg-zinc-50"
          >
            <div>
              <p className="font-medium text-zinc-900">{order.orderNumber}</p>
              <p className="text-sm text-zinc-600">
                {order.createdAt.toLocaleDateString()} · {order.itemCount} item
                {order.itemCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">
                {formatUsd(Number(order.total.toString()))}
              </p>
              <p className="text-sm text-zinc-600">{orderStatusLabel(order.status)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
