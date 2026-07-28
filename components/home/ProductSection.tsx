import Link from "next/link";
import type { CatalogProductListItem } from "@/types/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";

type ProductSectionProps = {
  title: string;
  emoji?: string;
  products: CatalogProductListItem[];
  viewAllHref: string;
};

export function ProductSection({ title, emoji, products, viewAllHref }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-zinc-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-zinc-900">
            {title}
            {emoji ? <span className="ml-2">{emoji}</span> : null}
          </h2>
          <Link
            href={viewAllHref}
            className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
          >
            View all
          </Link>
        </div>
        <ul className="-mx-2 flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin]">
          {products.map((product, index) => (
            <li
              key={product.id}
              className="w-[11.5rem] shrink-0 snap-start sm:w-[14rem]"
            >
              <ProductCard product={product} priority={index < 4} compact />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
