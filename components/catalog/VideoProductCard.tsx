"use client";

import Link from "next/link";
import { useRef } from "react";
import type { CatalogProductListItem } from "@/types/catalog";
import { formatUsd } from "@/lib/catalog/money";
import { StarRating } from "@/components/catalog/StarRating";
import { Badge } from "@/components/ui/Badge";

type VideoProductCardProps = {
  product: CatalogProductListItem;
  videoUrl: string;
  priority?: boolean;
};

export function VideoProductCard({ product, videoUrl, priority }: VideoProductCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const onSale =
    product.maxCompareAtPrice != null && product.maxCompareAtPrice > product.minPrice;
  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatUsd(product.minPrice)
      : `From ${formatUsd(product.minPrice)}`;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-border bg-neutral-surface p-3 transition hover:border-brand-300 hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden rounded-xl bg-brand-50"
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
          className="h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2">
          <Badge variant="theme">Video</Badge>
        </span>
        {onSale ? (
          <span className="absolute right-2 top-2">
            <Badge variant="sale">Sale</Badge>
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 pt-3">
        <Link href={`/products/${product.slug}`}>
          <h2 className="line-clamp-2 text-sm font-medium text-neutral-text group-hover:text-brand-600">
            {product.name}
          </h2>
        </Link>
        <StarRating rating={product.averageRating} reviewCount={product.reviewCount} size="sm" />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <p className="font-bold text-sale-price">{priceLabel}</p>
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
