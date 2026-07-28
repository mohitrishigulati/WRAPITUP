import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/admin/queries";
import { orderStatusLabel } from "@/lib/account/queries";
import { formatUsd } from "@/lib/catalog/money";
import { OrderAdminForm } from "@/components/admin/OrderAdminForm";

type AdminOrderDetailPageProps = {
  params: { id: string };
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const order = await getAdminOrder(params.id);
  if (!order) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {orderStatusLabel(order.status)} · {order.createdAt.toLocaleString()}
          </p>
          <p className="text-sm text-zinc-600">
            Customer: {order.user?.email ?? order.guestEmail ?? "Guest"}
          </p>
        </div>

        <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between px-4 py-3 text-sm">
              <span>
                {item.productName} ({item.variantName}) × {item.quantity}
              </span>
              <span>{formatUsd(Number(item.lineTotal.toString()))}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
          <p className="font-medium text-zinc-900">Total</p>
          <p className="text-xl font-semibold">{formatUsd(Number(order.total.toString()))}</p>
        </div>
        <OrderAdminForm
          orderId={order.id}
          status={order.status}
          trackingNumber={order.trackingNumber}
        />
      </div>
    </div>
  );
}
