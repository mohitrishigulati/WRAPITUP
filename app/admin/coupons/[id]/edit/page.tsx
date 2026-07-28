import { notFound } from "next/navigation";
import { updateCouponAction } from "@/actions/admin/coupons";
import { getAdminCoupon } from "@/lib/admin/queries";
import { decimalToNumber } from "@/lib/catalog/money";
import { CouponForm } from "@/components/admin/CouponForm";

type EditCouponPageProps = {
  params: { id: string };
};

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const coupon = await getAdminCoupon(params.id);
  if (!coupon) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-zinc-900">Edit coupon</h1>
      <CouponForm
        action={updateCouponAction}
        submitLabel="Save coupon"
        initial={{
          couponId: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: decimalToNumber(coupon.discountValue),
          minOrderAmount: coupon.minOrderAmount
            ? decimalToNumber(coupon.minOrderAmount)
            : null,
          maxRedemptions: coupon.maxRedemptions,
          startsAt: coupon.startsAt?.toISOString(),
          expiresAt: coupon.expiresAt?.toISOString(),
          isActive: coupon.isActive,
        }}
      />
    </div>
  );
}
