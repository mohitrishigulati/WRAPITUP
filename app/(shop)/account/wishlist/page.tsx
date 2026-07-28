import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-user";
import { listWishlistForUser } from "@/lib/account/queries";
import { AccountNav, AccountShell } from "@/components/account/AccountNav";
import { WishlistGrid } from "@/components/account/WishlistGrid";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const user = await requireUser("/account/wishlist");
  const items = await listWishlistForUser(user.id);

  const mapped = items.map((item) => ({
    productId: item.productId,
    product: item.product,
  }));

  return (
    <AccountShell
      title="Wishlist"
      description="Products you have saved for later."
      nav={<AccountNav current="wishlist" />}
    >
      <WishlistGrid items={mapped} />
    </AccountShell>
  );
}
