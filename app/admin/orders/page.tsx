import Link from "next/link";
import { listAdminOrders } from "@/lib/admin/queries";
import { orderStatusLabel } from "@/lib/account/queries";
import { formatUsd } from "@/lib/catalog/money";

export const metadata = { title: "Admin orders | WrapItUp" };

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-zinc-900">Orders</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {order.user?.email ?? order.guestEmail ?? "Guest"}
                </td>
                <td className="px-4 py-3">{orderStatusLabel(order.status)}</td>
                <td className="px-4 py-3">{formatUsd(Number(order.total.toString()))}</td>
                <td className="px-4 py-3">{order.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
