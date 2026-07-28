"use client";

import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/actions/wishlist";

type WishlistButtonProps = {
  productId: string;
  initialSaved: boolean;
};

export function WishlistButton({ productId, initialSaved }: WishlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleWishlistAction(productId);
          if (result.ok) setSaved(result.saved);
        })
      }
      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
    >
      {saved ? "Remove from wishlist" : "Save to wishlist"}
    </button>
  );
}
