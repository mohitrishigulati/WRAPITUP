import Link from "next/link";
import { catalogQueryString } from "@/lib/catalog/params";

type TagOption = { slug: string; name: string };

type CatalogFiltersProps = {
  actionPath: string;
  categories: { slug: string; name: string; parentId: string | null }[];
  tags: TagOption[];
  hideCategorySelect?: boolean;
  values: {
    categorySlug?: string;
    tagSlugs: string[];
    minPrice?: number;
    maxPrice?: number;
    inStockOnly: boolean;
    q?: string;
    sort: string;
  };
};

export function CatalogFilters({
  actionPath,
  categories,
  tags,
  hideCategorySelect,
  values,
}: CatalogFiltersProps) {
  const resetHref = catalogQueryString({
    q: values.q,
    sort: values.sort,
  });

  return (
    <form action={actionPath} method="get" className="space-y-6 rounded-xl border border-zinc-200 bg-white p-4">
      {values.q ? <input type="hidden" name="q" value={values.q} /> : null}
      <input type="hidden" name="sort" value={values.sort} />

      <div>
        {!hideCategorySelect ? (
          <>
            <h2 className="text-sm font-semibold text-zinc-900">Category</h2>
            <select
              name="category"
              defaultValue={values.categorySlug ?? ""}
              className="mt-2 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.parentId ? `— ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          </>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <fieldset>
          <legend className="text-sm font-semibold text-zinc-900">Tags</legend>
          <ul className="mt-2 space-y-2">
            {tags.map((tag) => (
              <li key={tag.slug}>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag.slug}
                    defaultChecked={values.tagSlugs.includes(tag.slug)}
                    className="rounded border-zinc-300"
                  />
                  {tag.name}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="minPrice" className="text-sm font-semibold text-zinc-900">
            Min price
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={values.minPrice ?? ""}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="text-sm font-semibold text-zinc-900">
            Max price
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={values.maxPrice ?? ""}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="inStock"
          value="1"
          defaultChecked={values.inStockOnly}
          className="rounded border-zinc-300"
        />
        In stock only
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Apply filters
        </button>
        <Link
          href={`${actionPath}${resetHref}`}
          className="text-center text-sm text-zinc-600 hover:text-zinc-900"
        >
          Reset filters
        </Link>
      </div>
    </form>
  );
}
