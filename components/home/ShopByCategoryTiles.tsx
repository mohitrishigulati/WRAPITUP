import Link from "next/link";
import Image from "next/image";
import { HOME_SHOP_TILES } from "@/lib/store/home-sections";

function tileImage(label: string, imageUrl?: string) {
  return (
    imageUrl ??
    `https://placehold.co/200x200/f5f5f5/666?text=${encodeURIComponent(label.slice(0, 8))}`
  );
}

export function ShopByCategoryTiles() {
  return (
    <section className="border-t border-zinc-200 bg-white py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-center font-display text-lg font-semibold text-neutral-text sm:text-xl">
          Shop by category
        </h2>
        <ul className="grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {HOME_SHOP_TILES.map((tile) => (
            <li key={tile.href}>
              <Link href={tile.href} className="group flex flex-col items-center text-center">
                <span className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 shadow-sm transition group-hover:border-accent-pink group-hover:shadow-md sm:h-20 sm:w-20">
                  <Image
                    src={tileImage(tile.label, tile.imageUrl)}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-110"
                    sizes="80px"
                  />
                </span>
                <span className="mt-2 line-clamp-2 text-[10px] font-medium leading-snug text-neutral-text sm:text-xs">
                  {tile.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
