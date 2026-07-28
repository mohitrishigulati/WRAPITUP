import Link from "next/link";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-rose-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Birthday return gifts &amp; more
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Gifts kids love.
            <span className="block text-brand-600">Wrapped &amp; ready to go.</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-zinc-600">
            Curated picks for parties, school events, and everyday surprises — just like your
            favorite online gift store.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products?tags=gift-idea"
              className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
            >
              Shop return gifts 🎉
            </Link>
            <Link
              href="/products?tags=new-arrival"
              className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:border-brand-300 hover:text-brand-700"
            >
              New arrivals
            </Link>
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <HeroTile
              href="/products?tags=best-seller"
              label="#Trending"
              emoji="🔥"
              className="col-span-2 bg-brand-100"
            />
            <HeroTile href="/categories/gift-sets" label="Gift hampers" emoji="🎁" />
            <HeroTile href="/categories/gifts-wrap" label="Wrap & ribbons" emoji="🎀" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroTile({
  href,
  label,
  emoji,
  className = "",
}: {
  href: string;
  label: string;
  emoji: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-[7rem] flex-col items-center justify-center rounded-2xl border border-white/80 p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[8rem] ${className} bg-white`}
    >
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <span className="mt-2 text-sm font-semibold text-zinc-800">{label}</span>
    </Link>
  );
}
