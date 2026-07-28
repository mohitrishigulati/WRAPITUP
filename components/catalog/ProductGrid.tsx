import type { CatalogProductListItem } from "@/types/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";

type ProductGridProps = {
  products: CatalogProductListItem[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center">
        <p className="text-lg font-medium text-zinc-900">No products found</p>
        <p className="mt-2 text-sm text-zinc-600">Try adjusting filters or search terms.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < 4} />
        </li>
      ))}
    </ul>
  );
}
