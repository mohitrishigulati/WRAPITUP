import Link from "next/link";
import type { CatalogProductListItem } from "@/types/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { VideoProductCard } from "@/components/catalog/VideoProductCard";

export type CarouselProduct = CatalogProductListItem & { videoUrl?: string | null };

type CollectionCarouselProps = {
  title: string;
  subtitle?: string;
  emoji?: string;
  products: CarouselProduct[];
  viewAllHref: string;
  viewAllLabel?: string;
  variant?: "default" | "video";
};

export function CollectionCarousel({
  title,
  subtitle,
  emoji,
  products,
  viewAllHref,
  viewAllLabel = "View all",
  variant = "default",
}: CollectionCarouselProps) {
  if (products.length === 0) return null;

  const heading = emoji ? `${title} ${emoji}` : title;

  return (
    <section className="border-t border-neutral-border bg-neutral-bg py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-neutral-text sm:text-2xl">
              {heading}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm font-medium text-brand-700">{subtitle}</p>
            ) : null}
          </div>
          <Link
            href={viewAllHref}
            className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
          >
            {viewAllLabel}
          </Link>
        </div>
        <ul className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:thin]">
          {products.map((product, index) => (
            <li
              key={product.id}
              className="min-w-[200px] shrink-0 snap-start sm:min-w-[220px] lg:min-w-[240px]"
            >
              {variant === "video" && product.videoUrl ? (
                <VideoProductCard product={product} videoUrl={product.videoUrl} priority={index < 4} />
              ) : (
                <ProductCard product={product} priority={index < 4} compact />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
