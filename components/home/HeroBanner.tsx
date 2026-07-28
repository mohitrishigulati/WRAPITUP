import Link from "next/link";
import Image from "next/image";
import { getHeroConfig } from "@/lib/store/storefront-config";
import { getStorefrontImages } from "@/lib/store/storefront-images";

export function HeroBanner() {
  const hero = getHeroConfig();
  const storefront = getStorefrontImages();
  const imageUrl = storefront?.hero ?? hero.imageUrl;

  return (
    <section className="border-b border-zinc-200 bg-[#7ec8c8]">
      <Link href={hero.href} className="group mx-auto block max-w-7xl">
        <div className="relative grid min-h-[200px] overflow-hidden sm:min-h-[260px] lg:grid-cols-2 lg:min-h-[320px]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-10 text-center lg:px-10 lg:text-left">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-white/90 sm:text-sm">
              WrapItUp
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              {hero.title}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/95 sm:text-base lg:mx-0">
              {hero.subtitle}
            </p>
            <span className="mx-auto mt-6 inline-flex w-fit rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-[#2a8a8a] shadow-sm transition group-hover:bg-zinc-50 lg:mx-0">
              Shop now
            </span>
          </div>
          <div className="relative h-48 lg:h-auto lg:min-h-[320px]">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover object-center transition duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </Link>
    </section>
  );
}
