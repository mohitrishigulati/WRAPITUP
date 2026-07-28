import Link from "next/link";
import { listAdminCoupons } from "@/lib/admin/queries";
import { decimalToNumber } from "@/lib/catalog/money";
import { deactivateCouponByIdAction } from "@/actions/admin/coupons";

export const metadata = { title: "Coupons | Admin" };

export default async function AdminCouponsPage() {
  const coupons = await listAdminCoupons();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-zinc-900">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New coupon
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Redemptions</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium">{coupon.code}</td>
                <td className="px-4 py-3">{coupon.discountType}</td>
                <td className="px-4 py-3">{decimalToNumber(coupon.discountValue)}</td>
                <td className="px-4 py-3">
                  {coupon.redemptionCount}
                  {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                </td>
                <td className="px-4 py-3">{coupon.isActive ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link href={`/admin/coupons/${coupon.id}/edit`} className="hover:underline">
                    Edit
                  </Link>
                  {coupon.isActive ? (
                    <form action={deactivateCouponByIdAction.bind(null, coupon.id)} className="inline">
                      <button type="submit" className="text-amber-700 hover:underline">
                        Deactivate
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
