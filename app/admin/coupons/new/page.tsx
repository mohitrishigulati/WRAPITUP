import { createCouponAction } from "@/actions/admin/coupons";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata = { title: "New coupon | Admin" };

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-zinc-900">New coupon</h1>
      <CouponForm action={createCouponAction} submitLabel="Create coupon" />
    </div>
  );
}
