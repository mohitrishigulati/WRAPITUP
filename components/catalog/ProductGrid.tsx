import type { CatalogProductListItem } from "@/types/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";

type ProductGridProps = {
  products: CatalogProductListItem[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-border bg-neutral-surface px-6 py-16 text-center">
        <p className="text-lg font-medium text-neutral-text">No products found</p>
        <p className="mt-2 text-sm text-neutral-muted">Try adjusting filters or search terms.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < 4} showQuickAdd />
        </li>
      ))}
    </ul>
  );
}
