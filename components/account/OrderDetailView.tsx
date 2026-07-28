import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { orderStatusLabel } from "@/lib/account/queries";
import { formatUsd } from "@/lib/catalog/money";

type OrderDetailProps = {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    createdAt: Date;
    subtotal: { toString(): string };
    discountTotal: { toString(): string };
    shippingTotal: { toString(): string };
    taxTotal: { toString(): string };
    total: { toString(): string };
    coupon: { code: string } | null;
    shippingAddress: {
      fullName: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string | null;
      postalCode: string;
      country: string;
    } | null;
    items: {
      id: string;
      productName: string;
      variantName: string;
      sku: string;
      quantity: number;
      unitPrice: { toString(): string };
      lineTotal: { toString(): string };
    }[];
  };
};

function money(value: { toString(): string }) {
  return formatUsd(Number(value.toString()));
}

export function OrderDetailView({ order }: OrderDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/account/orders" className="text-sm text-zinc-600 hover:text-zinc-900">
            ← Back to orders
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-900">{order.orderNumber}</h2>
          <p className="text-sm text-zinc-600">
            Placed {order.createdAt.toLocaleString()} · {orderStatusLabel(order.status)}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-medium text-zinc-900">Items</h3>
        <ul className="mt-3 divide-y divide-zinc-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium text-zinc-900">{item.productName}</p>
                <p className="text-zinc-600">
                  {item.variantName} · SKU {item.sku} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-medium text-zinc-900">{money(item.lineTotal)}</p>
            </li>
          ))}
        </ul>
      </section>

      {order.shippingAddress ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
          <h3 className="font-medium text-zinc-900">Shipping address</h3>
          <p className="mt-2">{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
          <p>
            {order.shippingAddress.city}
            {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
            {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-zinc-600">Subtotal</dt>
            <dd>{money(order.subtotal)}</dd>
          </div>
          {Number(order.discountTotal.toString()) > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <dt>Discount {order.coupon ? `(${order.coupon.code})` : ""}</dt>
              <dd>-{money(order.discountTotal)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-zinc-600">Shipping</dt>
            <dd>{money(order.shippingTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-600">Tax</dt>
            <dd>{money(order.taxTotal)}</dd>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
            <dt>Total</dt>
            <dd>{money(order.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
