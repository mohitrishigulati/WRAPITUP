import type { CatalogProductListItem } from "@/types/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { VideoProductCard } from "@/components/catalog/VideoProductCard";
import { ViewAllButton } from "@/components/home/ViewAllButton";

export type HomeSectionProduct = CatalogProductListItem & { videoUrl?: string | null };

type HomeProductSectionProps = {
  title: string;
  subtitle?: string;
  products: HomeSectionProduct[];
  viewAllHref: string;
  viewAllLabel?: string;
  variant?: "default" | "video";
};

export function HomeProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel,
  variant = "default",
}: HomeProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-zinc-200 bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-6 text-center sm:mb-8">
          <h2 className="font-display text-lg font-semibold tracking-tight text-neutral-text sm:text-xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm font-medium text-brand-600">{subtitle}</p>
          ) : null}
        </header>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
          {products.map((product, index) => (
            <li key={product.id}>
              {variant === "video" && product.videoUrl ? (
                <VideoProductCard product={product} videoUrl={product.videoUrl} priority={index < 4} />
              ) : (
                <ProductCard product={product} priority={index < 4} compact />
              )}
            </li>
          ))}
        </ul>
        <ViewAllButton href={viewAllHref} label={viewAllLabel ?? "View all"} />
      </div>
    </section>
  );
}
