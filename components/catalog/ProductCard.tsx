import Link from "next/link";
import type { CatalogProductListItem } from "@/types/catalog";
import { formatUsd } from "@/lib/catalog/money";
import { ProductImage } from "@/components/catalog/ProductImage";
import { StarRating } from "@/components/catalog/StarRating";
import { Badge } from "@/components/ui/Badge";

type ProductCardProps = {
  product: CatalogProductListItem;
  priority?: boolean;
  compact?: boolean;
};

const NEW_DAYS = 30;

function isNewProduct(createdAt: Date) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < NEW_DAYS * 24 * 60 * 60 * 1000;
}

export function ProductCard({ product, priority, compact }: ProductCardProps) {
  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatUsd(product.minPrice)
      : `From ${formatUsd(product.minPrice)}`;

  const onSale =
    product.maxCompareAtPrice != null && product.maxCompareAtPrice > product.minPrice;
  const showNew = isNewProduct(product.createdAt);

  return (
    <article
      className={`group flex h-full flex-col rounded-2xl border border-neutral-border bg-neutral-surface p-3 transition hover:border-brand-300 hover:shadow-md ${
        compact ? "text-sm" : ""
      }`}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden rounded-xl bg-brand-50"
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          priority={priority}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {onSale ? <Badge variant="sale">Sale</Badge> : null}
          {showNew && !onSale ? <Badge variant="new">New</Badge> : null}
        </div>
        {!product.inStock ? (
          <span className="absolute right-2 top-2 rounded-full bg-neutral-text/80 px-2 py-0.5 text-xs font-medium text-white">
            Sold out
          </span>
        ) : null}
      </Link>
      <div className={`flex flex-1 flex-col gap-2 pt-3 ${compact ? "" : ""}`}>
        {!compact ? (
          <Badge variant="theme" className="w-fit normal-case tracking-normal">
            {product.categoryName}
          </Badge>
        ) : null}
        <Link href={`/products/${product.slug}`}>
          <h2
            className={`line-clamp-2 font-sans font-medium text-neutral-text group-hover:text-brand-600 ${
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
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-base font-bold text-sale-price">{priceLabel}</p>
          {onSale ? (
            <p className="text-sm text-sale-strike line-through">
              {formatUsd(product.maxCompareAtPrice!)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
