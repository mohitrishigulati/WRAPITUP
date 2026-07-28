"use client";

import Link from "next/link";
import { useRef } from "react";
import type { CatalogProductListItem } from "@/types/catalog";
import { formatUsd } from "@/lib/catalog/money";
import { StarRating } from "@/components/catalog/StarRating";

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
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-brand-200 hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-zinc-100"
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
        <span className="absolute left-2 top-2 rounded-full bg-zinc-900/75 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
          Video
        </span>
        {onSale ? (
          <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Sale
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/products/${product.slug}`}>
          <h2 className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-brand-700">
            {product.name}
          </h2>
        </Link>
        <StarRating rating={product.averageRating} reviewCount={product.reviewCount} size="sm" />
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
