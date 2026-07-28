import Link from "next/link";
import Image from "next/image";

type HomePromoBannerProps = {
  title: string;
  subtitle?: string;
  href: string;
  imageUrl: string;
};

export function HomePromoBanner({ title, subtitle, href, imageUrl }: HomePromoBannerProps) {
  return (
    <section className="border-t border-zinc-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link href={href} className="group relative block overflow-hidden rounded-2xl bg-[#7ec8c8]">
          <div className="relative flex min-h-[140px] items-center sm:min-h-[180px]">
            <div className="relative z-10 flex-1 px-6 py-8 sm:px-10">
              <p className="font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
                {title}
              </p>
              {subtitle ? (
                <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">{subtitle}</p>
              ) : null}
              <span className="mt-4 inline-flex rounded-full bg-white px-5 py-2 text-xs font-bold uppercase tracking-wide text-[#2a8a8a] transition group-hover:bg-zinc-50">
                Shop now
              </span>
            </div>
            <div className="relative hidden h-full w-2/5 sm:block">
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover object-center transition duration-500 group-hover:scale-105"
                sizes="40vw"
              />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
