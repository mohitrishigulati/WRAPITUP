import type { Metadata } from "next";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CatalogSortSelect } from "@/components/catalog/CatalogSortSelect";
import { CatalogToolbarSuspense } from "@/components/catalog/CatalogToolbarSuspense";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getCategoryBySlug, getFilterCategories, getCategoryDescendantIds } from "@/lib/catalog/categories";
import { parseCatalogParams } from "@/lib/catalog/params";
import { getAllTagSlugs, listProducts } from "@/lib/catalog/products";
import { CatalogUnavailable } from "@/components/catalog/CatalogUnavailable";
import { getDatabaseConfigStatus } from "@/lib/db/database-status";

export const metadata: Metadata = {
  title: "All products",
  description: "Browse our full catalog with filters, search, and sorting.",
};

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const parsed = parseCatalogParams(searchParams);

  let tags: Awaited<ReturnType<typeof getAllTagSlugs>>;
  let categories: Awaited<ReturnType<typeof getFilterCategories>>;
  let listing: Awaited<ReturnType<typeof listProducts>>;

  try {
    [tags, categories] = await Promise.all([getAllTagSlugs(), getFilterCategories()]);

    let categoryIds: string[] | undefined;
    if (parsed.categorySlug) {
      const category = await getCategoryBySlug(parsed.categorySlug);
      if (category) {
        categoryIds = await getCategoryDescendantIds(category.id);
      }
    }

    listing = await listProducts({
      q: parsed.q,
      page: parsed.page,
      sort: parsed.sort,
      categoryIds,
      tagSlugs: parsed.tagSlugs,
      minPrice: parsed.minPrice,
      maxPrice: parsed.maxPrice,
      inStockOnly: parsed.inStockOnly,
    });
  } catch {
    const dbStatus = await getDatabaseConfigStatus();
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <CatalogUnavailable
          hint={dbStatus.hint}
          looksLikeLocalDevUrl={dbStatus.looksLikeLocalDevUrl}
        />
      </div>
    );
  }

  const queryForPagination = {
    q: parsed.q,
    sort: parsed.sort,
    category: parsed.categorySlug,
    tags: parsed.tagSlugs,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    inStock: parsed.inStockOnly ? "1" : undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-900">All products</h1>
        <p className="text-zinc-600">{listing.total} products</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside>
          <CatalogFilters
            actionPath="/products"
            categories={categories}
            tags={tags}
            values={{
              categorySlug: parsed.categorySlug,
              tagSlugs: parsed.tagSlugs,
              minPrice: parsed.minPrice,
              maxPrice: parsed.maxPrice,
              inStockOnly: parsed.inStockOnly,
              q: parsed.q,
              sort: parsed.sort,
            }}
          />
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <CatalogToolbarSuspense>
                <CatalogSearch defaultValue={parsed.q ?? ""} />
              </CatalogToolbarSuspense>
            </div>
            <CatalogToolbarSuspense>
              <CatalogSortSelect value={parsed.sort} showRelevance={Boolean(parsed.q)} />
            </CatalogToolbarSuspense>
          </div>

          <ProductGrid products={listing.products} />
          <Pagination
            page={listing.page}
            totalPages={listing.totalPages}
            basePath="/products"
            query={queryForPagination}
          />
        </section>
      </div>
    </div>
  );
}
