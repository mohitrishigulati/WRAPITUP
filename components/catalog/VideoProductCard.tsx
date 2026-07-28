"use client";

import Link from "next/link";
import { useRef } from "react";
import type { CatalogProductListItem } from "@/types/catalog";
import { getProductCardPricing } from "@/lib/catalog/product-card-display";
import { ProductCardMedia } from "@/components/catalog/ProductCardMedia";
import { ProductCardPrice } from "@/components/catalog/ProductCardPrice";
import { ProductQuickAdd } from "@/components/catalog/ProductQuickAdd";
import { StarRating } from "@/components/catalog/StarRating";
import { Badge } from "@/components/ui/Badge";

type VideoProductCardProps = {
  product: CatalogProductListItem;
  videoUrl: string;
  priority?: boolean;
};

export function VideoProductCard({ product, videoUrl, priority }: VideoProductCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pricing = getProductCardPricing(product);

  return (
    <article className="card-wrapper group/card flex h-full flex-col">
      <ProductCardMedia
        slug={product.slug}
        name={product.name}
        imageUrl={product.imageUrl}
        priority={priority}
        badge={
          <>
            <Badge variant="theme">Trending 🔥</Badge>
            {pricing.discountPercent && pricing.discountPercent > 0 ? (
              <Badge variant="sale">-{pricing.discountPercent}%</Badge>
            ) : null}
          </>
        }
        soldOut={!product.inStock}
        mediaSlot={
          <div
            className="h-full w-full"
            onMouseEnter={() => {
              void videoRef.current?.play().catch(() => undefined);
            }}
            onMouseLeave={() => {
              videoRef.current?.pause();
            }}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              preload={priority ? "auto" : "metadata"}
              poster={product.imageUrl ?? undefined}
              className="h-full w-full object-cover"
            />
          </div>
        }
      />
      <div className="card__content flex flex-1 flex-col pt-3">
        <Link href={`/products/${product.slug}`} className="card__heading block">
          <h3 className="line-clamp-2 text-sm font-normal leading-snug text-neutral-text group-hover/card:text-brand-600">
            {product.name}
          </h3>
        </Link>
        <StarRating
          rating={product.averageRating}
          reviewCount={product.reviewCount}
          size="sm"
          variant="giftoo"
          className="mt-1.5"
        />
        <div className="mt-auto pt-2">
          <ProductCardPrice pricing={pricing} compact />
          <ProductQuickAdd variantId={product.defaultVariantId} inStock={product.inStock} />
        </div>
      </div>
    </article>
  );
}
