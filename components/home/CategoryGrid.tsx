import Link from "next/link";
import type { HomeCategoryTile } from "@/lib/catalog/home";
import { ProductImage } from "@/components/catalog/ProductImage";

type CategoryGridProps = {
  categories: HomeCategoryTile[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-zinc-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold text-zinc-900">Shop by category</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-zinc-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-brand-200"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-brand-50 to-rose-50">
                  {cat.imageUrl ? (
                    <ProductImage
                      src={cat.imageUrl}
                      alt=""
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      className="flex h-full items-center justify-center text-3xl text-brand-400"
                      aria-hidden
                    >
                      🎁
                    </span>
                  )}
                </div>
                <span className="mt-2 line-clamp-2 text-xs font-semibold text-zinc-800 sm:text-sm">
                  {cat.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
