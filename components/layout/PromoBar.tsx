import Link from "next/link";

export function PromoBar() {
  return (
    <div className="bg-brand-600 text-center text-sm font-medium text-white">
      <p className="px-4 py-2">
        Free shipping on orders above{" "}
        <span className="font-semibold">₹500</span>
        {" · "}
        <Link href="/products?tags=gift-idea" className="underline underline-offset-2 hover:text-brand-50">
          Shop return gifts
        </Link>
      </p>
    </div>
  );
}
