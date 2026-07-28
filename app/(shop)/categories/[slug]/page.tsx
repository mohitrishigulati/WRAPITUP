import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CatalogSortSelect } from "@/components/catalog/CatalogSortSelect";
import { CatalogToolbarSuspense } from "@/components/catalog/CatalogToolbarSuspense";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import {
  getCategoryBySlug,
  getFilterCategories,
} from "@/lib/catalog/categories";
import { parseCatalogParams } from "@/lib/catalog/params";
import { getAllTagSlugs, listProductsForCategorySlug } from "@/lib/catalog/products";
import { CatalogUnavailable } from "@/components/catalog/CatalogUnavailable";
import { getDatabaseConfigStatus } from "@/lib/db/database-status";
import { safeCatalogQuery } from "@/lib/catalog/safe-query";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const dbStatus = await getDatabaseConfigStatus();
  if (!dbStatus.reachable) {
    return { title: "Category" };
  }
  const category = await safeCatalogQuery(() => getCategoryBySlug(params.slug), null);
  if (!category) {
    return { title: "Category not found" };
  }
  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name} at WrapItUp — browse products, filters, and deals.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const dbStatus = await getDatabaseConfigStatus();
  if (!dbStatus.reachable) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <CatalogUnavailable hint={dbStatus.hint} looksLikeLocalDevUrl={dbStatus.looksLikeLocalDevUrl} />
      </div>
    );
  }

  const category = await safeCatalogQuery(() => getCategoryBySlug(params.slug), null);
  if (!category) notFound();

  const parsed = parseCatalogParams(searchParams);
  const [tags, categories, listing] = await Promise.all([
    safeCatalogQuery(() => getAllTagSlugs(), []),
    safeCatalogQuery(() => getFilterCategories(), []),
    safeCatalogQuery(
      () =>
        listProductsForCategorySlug(params.slug, {
          q: parsed.q,
          page: parsed.page,
          sort: parsed.sort,
          tagSlugs: parsed.tagSlugs,
          minPrice: parsed.minPrice,
          maxPrice: parsed.maxPrice,
          inStockOnly: parsed.inStockOnly,
        }),
      null,
    ),
  ]);

  if (!listing) notFound();

  const breadcrumbItems = [
    { label: "Products", href: "/products" },
    ...(category.parent
      ? [{ label: category.parent.name, href: `/categories/${category.parent.slug}` }]
      : []),
    { label: category.name },
  ];

  const queryForPagination = {
    q: parsed.q,
    sort: parsed.sort,
    tags: parsed.tagSlugs,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    inStock: parsed.inStockOnly ? "1" : undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-4 mb-8 space-y-3">
        <h1 className="text-3xl font-semibold text-zinc-900">{category.name}</h1>
        {category.description ? (
          <p className="max-w-2xl text-zinc-600">{category.description}</p>
        ) : null}
        {category.children.length > 0 ? (
          <ul className="flex flex-wrap gap-2 pt-2">
            {category.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/categories/${child.slug}`}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-800 hover:border-zinc-400"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-sm text-zinc-500">{listing.total} products</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside>
          <CatalogFilters
            actionPath={`/categories/${category.slug}`}
            categories={categories}
            tags={tags}
            hideCategorySelect
            values={{
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
            basePath={`/categories/${category.slug}`}
            query={queryForPagination}
          />
        </section>
      </div>
    </div>
  );
}
