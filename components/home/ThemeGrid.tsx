import Link from "next/link";
import { getAllThemesWithCounts } from "@/lib/catalog/themes";
import { safeCatalogQuery } from "@/lib/catalog/safe-query";

type ThemeGridProps = {
  themes?: Awaited<ReturnType<typeof getAllThemesWithCounts>>;
};

export async function ThemeGrid({ themes: themesProp }: ThemeGridProps) {
  const themes =
    themesProp ??
    (await safeCatalogQuery(() => getAllThemesWithCounts(), [] as Awaited<
      ReturnType<typeof getAllThemesWithCounts>
    >));
  if (themes.length === 0) return null;

  return (
    <section className="bg-neutral-surface py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 font-display text-xl font-semibold text-neutral-text sm:text-2xl">
          Shop by theme
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {themes.map((theme) => (
            <li key={theme.id}>
              <Link
                href={`/themes/${theme.slug}`}
                className="flex flex-col items-center rounded-2xl border border-neutral-border bg-gradient-to-br from-brand-50 to-neutral-surface p-6 text-center transition hover:border-accent-pink hover:shadow-md"
              >
                <span className="font-display text-2xl font-bold text-brand-600">{theme.name}</span>
                <span className="mt-2 text-xs text-neutral-muted">
                  {theme.productCount} product{theme.productCount === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
