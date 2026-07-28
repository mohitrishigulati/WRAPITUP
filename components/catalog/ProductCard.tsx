import Link from "next/link";
import type { CatalogProductListItem } from "@/types/catalog";
import { getProductCardPricing } from "@/lib/catalog/product-card-display";
import { ProductCardMedia } from "@/components/catalog/ProductCardMedia";
import { ProductCardPrice } from "@/components/catalog/ProductCardPrice";
import { ProductQuickAdd } from "@/components/catalog/ProductQuickAdd";
import { StarRating } from "@/components/catalog/StarRating";
import { Badge } from "@/components/ui/Badge";

type ProductCardProps = {
  product: CatalogProductListItem;
  priority?: boolean;
  /** Carousel / homepage strip — matches giftoo.in card density */
  compact?: boolean;
  showQuickAdd?: boolean;
  showCategory?: boolean;
};

const NEW_DAYS = 30;

function isNewProduct(createdAt: Date) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < NEW_DAYS * 24 * 60 * 60 * 1000;
}

export function ProductCard({
  product,
  priority,
  compact,
  showQuickAdd = true,
  showCategory = !compact,
}: ProductCardProps) {
  const pricing = getProductCardPricing(product);
  const showNew = isNewProduct(product.createdAt);

  const badges = (
    <>
      {pricing.discountPercent && pricing.discountPercent > 0 ? (
        <Badge variant="sale">-{pricing.discountPercent}%</Badge>
      ) : null}
      {showNew && !pricing.onSale ? <Badge variant="new">New</Badge> : null}
    </>
  );

  return (
    <article className="card-wrapper group/card flex h-full flex-col">
      <ProductCardMedia
        slug={product.slug}
        name={product.name}
        imageUrl={product.imageUrl}
        hoverImageUrl={product.hoverImageUrl}
        priority={priority}
        badge={badges}
        soldOut={!product.inStock}
      />
      <div className="card__content flex flex-1 flex-col pt-3">
        {showCategory ? (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-muted">
            {product.categoryName}
          </p>
        ) : null}
        <Link href={`/products/${product.slug}`} className="card__heading block">
          <h3
            className={`line-clamp-2 font-sans font-normal text-neutral-text transition group-hover/card:text-brand-600 ${
              compact ? "text-sm leading-snug" : "text-[15px] leading-snug"
            }`}
          >
            {product.name}
          </h3>
        </Link>
        <StarRating
          rating={product.averageRating}
          reviewCount={product.reviewCount}
          size={compact ? "sm" : "md"}
          variant="giftoo"
          className="mt-1.5"
        />
        <div className="mt-auto pt-2">
          <ProductCardPrice pricing={pricing} compact={compact} />
          {showQuickAdd ? (
            <ProductQuickAdd
              variantId={product.defaultVariantId}
              inStock={product.inStock}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
