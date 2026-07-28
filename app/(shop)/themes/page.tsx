import Link from "next/link";
import type { Metadata } from "next";
import { getAllThemesWithCounts } from "@/lib/catalog/themes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop by theme",
};

export default async function ThemesIndexPage() {
  const themes = await getAllThemesWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-zinc-900">Shop by theme</h1>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {themes.map((theme) => (
            <li key={theme.id}>
              <Link
                href={`/themes/${theme.slug}`}
                className="block rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md"
              >
                <p className="text-xl font-semibold text-brand-700">{theme.name}</p>
                <p className="mt-1 text-sm text-zinc-600">{theme.productCount} products</p>
              </Link>
            </li>
          ))}
        </ul>
    </div>
  );
}
