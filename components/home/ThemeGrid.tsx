import Link from "next/link";
import { HOME_THEME_TILES } from "@/lib/store/home-sections";

type ThemeRow = {
  id: string;
  slug: string;
  name: string;
  productCount?: number;
};

type ThemeGridProps = {
  themes?: ThemeRow[];
};

function emojiForTheme(slug: string) {
  const hit = HOME_THEME_TILES.find((t) => t.slug === slug);
  return hit?.emoji ?? "🎁";
}

export function ThemeGrid({ themes: themesProp }: ThemeGridProps) {
  const fromDb = themesProp ?? [];
  const tiles =
    fromDb.length > 0
      ? fromDb.map((t) => ({
          slug: t.slug,
          name: t.name.toUpperCase() === t.name ? t.name : t.name,
          emoji: emojiForTheme(t.slug),
          count: t.productCount,
        }))
      : HOME_THEME_TILES.map((t) => ({
          slug: t.slug,
          name: t.name,
          emoji: t.emoji,
          count: undefined as number | undefined,
        }));

  if (tiles.length === 0) return null;

  return (
    <section className="border-t border-zinc-200 bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-center font-display text-lg font-semibold text-neutral-text sm:text-xl">
          Shop by theme
        </h2>
        <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
          {tiles.map((theme) => (
            <li key={theme.slug}>
              <Link
                href={`/themes/${theme.slug}`}
                className="group flex w-[5.5rem] flex-col items-center text-center sm:w-24"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 to-accent-lilac/30 text-3xl shadow-sm ring-1 ring-zinc-200 transition group-hover:-translate-y-0.5 group-hover:ring-accent-pink sm:h-20 sm:w-20 sm:text-4xl">
                  {theme.emoji}
                </span>
                <span className="mt-2 text-[10px] font-semibold uppercase leading-tight text-neutral-text sm:text-xs">
                  {theme.name}
                </span>
                {theme.count != null ? (
                  <span className="mt-0.5 text-[10px] text-neutral-muted">
                    {theme.count} products
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
