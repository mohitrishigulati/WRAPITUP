import Link from "next/link";
import type { ReactNode } from "react";
import { ProductImage } from "@/components/catalog/ProductImage";

type ProductCardMediaProps = {
  slug: string;
  name: string;
  imageUrl: string | null;
  hoverImageUrl?: string | null;
  priority?: boolean;
  badge?: ReactNode;
  soldOut?: boolean;
  mediaSlot?: ReactNode;
};

export function ProductCardMedia({
  slug,
  name,
  imageUrl,
  hoverImageUrl,
  priority,
  badge,
  soldOut,
  mediaSlot,
}: ProductCardMediaProps) {
  const showHoverSwap = Boolean(hoverImageUrl && hoverImageUrl !== imageUrl);

  return (
    <Link
      href={`/products/${slug}`}
      className="card__media relative block aspect-square overflow-hidden rounded-lg bg-[#f7f7f7]"
    >
      {mediaSlot ? (
        mediaSlot
      ) : (
        <>
          <ProductImage
            src={imageUrl}
            alt={name}
            priority={priority}
            className={`h-full w-full object-cover transition duration-500 ${
              showHoverSwap ? "group-hover/card:opacity-0" : "group-hover/card:scale-105"
            }`}
          />
          {showHoverSwap ? (
            <ProductImage
              src={hoverImageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover/card:scale-105 group-hover/card:opacity-100"
            />
          ) : null}
        </>
      )}
      {badge ? <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">{badge}</div> : null}
      {soldOut ? (
        <span className="absolute right-2 top-2 z-10 rounded-sm bg-neutral-text/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Sold out
        </span>
      ) : null}
    </Link>
  );
}
