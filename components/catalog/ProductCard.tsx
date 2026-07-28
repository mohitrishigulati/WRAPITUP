import Link from "next/link";
import type { CatalogProductListItem } from "@/types/catalog";
import { formatUsd } from "@/lib/catalog/money";
import { ProductImage } from "@/components/catalog/ProductImage";
import { StarRating } from "@/components/catalog/StarRating";

type ProductCardProps = {
  product: CatalogProductListItem;
  priority?: boolean;
  compact?: boolean;
};

export function ProductCard({ product, priority, compact }: ProductCardProps) {
  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatUsd(product.minPrice)
      : `From ${formatUsd(product.minPrice)}`;

  const onSale =
    product.maxCompareAtPrice != null && product.maxCompareAtPrice > product.minPrice;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-brand-200 hover:shadow-md ${
        compact ? "text-sm" : ""
      }`}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-zinc-100"
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          priority={priority}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {onSale ? (
          <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Sale
          </span>
        ) : null}
        {!product.inStock ? (
          <span className="absolute right-2 top-2 rounded bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Sold out
          </span>
        ) : null}
      </Link>
      <div className={`flex flex-1 flex-col gap-1.5 ${compact ? "p-3" : "gap-2 p-4"}`}>
        {!compact ? (
          <p className="text-xs uppercase tracking-wide text-zinc-500">{product.categoryName}</p>
        ) : null}
        <Link href={`/products/${product.slug}`}>
          <h2
            className={`line-clamp-2 font-medium text-zinc-900 group-hover:text-brand-700 ${
              compact ? "text-sm leading-snug" : "text-base"
            }`}
          >
            {product.name}
          </h2>
        </Link>
        <StarRating
          rating={product.averageRating}
          reviewCount={product.reviewCount}
          size={compact ? "sm" : "md"}
        />
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          <p className="font-semibold text-brand-700">{priceLabel}</p>
          {onSale ? (
            <p className="text-xs text-zinc-400 line-through">
              {formatUsd(product.maxCompareAtPrice!)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
