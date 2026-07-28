import Link from "next/link";
import { getAllThemesWithCounts } from "@/lib/catalog/themes";

type ThemeGridProps = {
  themes?: Awaited<ReturnType<typeof getAllThemesWithCounts>>;
};

export async function ThemeGrid({ themes: themesProp }: ThemeGridProps) {
  const themes = themesProp ?? (await getAllThemesWithCounts());
  if (themes.length === 0) return null;

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold text-zinc-900">Shop by theme</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {themes.map((theme) => (
            <li key={theme.id}>
              <Link
                href={`/themes/${theme.slug}`}
                className="flex flex-col items-center rounded-xl border border-zinc-200 bg-gradient-to-br from-brand-50 to-white p-6 text-center transition hover:border-brand-300 hover:shadow-md"
              >
                <span className="text-2xl font-bold text-brand-700">{theme.name}</span>
                <span className="mt-2 text-xs text-zinc-600">
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
