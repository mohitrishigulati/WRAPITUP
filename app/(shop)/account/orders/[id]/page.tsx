import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getOrderForUser } from "@/lib/account/queries";
import { AccountNav, AccountShell } from "@/components/account/AccountNav";
import { OrderDetailView } from "@/components/account/OrderDetailView";

type OrderDetailPageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: OrderDetailPageProps) {
  return {
    title: `Order ${params.id.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await requireUser(`/account/orders/${params.id}`);
  const order = await getOrderForUser(user.id, params.id);

  if (!order) {
    // Same response whether missing or owned by another user (no ID enumeration).
    notFound();
  }

  return (
    <AccountShell
      title="Order details"
      nav={<AccountNav current="orders" />}
    >
      <OrderDetailView order={order} />
    </AccountShell>
  );
}
