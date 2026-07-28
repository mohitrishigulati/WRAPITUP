import Link from "next/link";
import Image from "next/image";
import { getHeroConfig } from "@/lib/store/storefront-config";

export function HeroBanner() {
  const hero = getHeroConfig();

  return (
    <section className="relative overflow-hidden bg-zinc-900 text-white">
      <Link href={hero.href} className="group block">
        <div className="relative mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center px-4 py-12 sm:px-6 lg:py-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">
              WrapItUp
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{hero.title}</h1>
            <p className="mt-3 max-w-md text-zinc-200">{hero.subtitle}</p>
            <span className="mt-6 inline-flex w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition group-hover:bg-brand-100">
              Shop now →
            </span>
          </div>
          <div className="relative h-56 lg:h-auto lg:min-h-[280px]">
            <Image
              src={hero.imageUrl}
              alt=""
              fill
              className="object-cover opacity-90 transition group-hover:opacity-100"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 via-zinc-900/40 to-transparent lg:from-zinc-900/70" />
          </div>
        </div>
      </Link>
    </section>
  );
}
