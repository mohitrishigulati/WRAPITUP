import Link from "next/link";
import type { CatalogProductListItem } from "@/types/catalog";
import { formatUsd } from "@/lib/catalog/money";
import { ProductImage } from "@/components/catalog/ProductImage";
import { StarRating } from "@/components/catalog/StarRating";

type ProductCardProps = {
  product: CatalogProductListItem;
  priority?: boolean;
};

export function ProductCard({ product, priority }: ProductCardProps) {
  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatUsd(product.minPrice)
      : `${formatUsd(product.minPrice)} – ${formatUsd(product.maxPrice)}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-sm">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-zinc-100">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          priority={priority}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {!product.inStock ? (
          <span className="absolute left-2 top-2 rounded bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{product.categoryName}</p>
        <Link href={`/products/${product.slug}`}>
          <h2 className="line-clamp-2 text-base font-medium text-zinc-900 group-hover:underline">
            {product.name}
          </h2>
        </Link>
        <StarRating rating={product.averageRating} reviewCount={product.reviewCount} />
        <p className="mt-auto text-sm font-semibold text-zinc-900">{priceLabel}</p>
      </div>
    </article>
  );
}
