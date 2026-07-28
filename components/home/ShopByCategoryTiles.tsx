import Link from "next/link";
import { HOME_SHOP_TILES } from "@/lib/store/home-sections";

export function ShopByCategoryTiles() {
  return (
    <section className="border-t border-neutral-border bg-neutral-surface py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 font-display text-xl font-semibold text-neutral-text sm:text-2xl">
          Shop by category
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {HOME_SHOP_TILES.map((tile) => (
            <li key={tile.href}>
              <Link
                href={tile.href}
                className="flex min-h-[4.5rem] items-center justify-center rounded-2xl border border-neutral-border bg-neutral-bg px-3 py-4 text-center text-xs font-semibold text-neutral-text transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md sm:text-sm"
              >
                {tile.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
