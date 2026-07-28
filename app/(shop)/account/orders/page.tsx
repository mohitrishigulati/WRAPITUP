import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-user";
import { listOrdersForUser } from "@/lib/account/queries";
import { AccountNav, AccountShell } from "@/components/account/AccountNav";
import { OrderHistoryList } from "@/components/account/OrderHistoryList";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await listOrdersForUser(user.id);

  const summaries = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    itemCount: order.items.length,
  }));

  return (
    <AccountShell
      title="Order history"
      description="Track statuses from placed through delivery."
      nav={<AccountNav current="orders" />}
    >
      <OrderHistoryList orders={summaries} />
    </AccountShell>
  );
}
