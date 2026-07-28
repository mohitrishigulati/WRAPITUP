import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeHero } from "@/components/home/HomeHero";
import { ProductSection } from "@/components/home/ProductSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { TrustStrip } from "@/components/home/TrustStrip";
import { getHomePageData } from "@/lib/catalog/home";

export const metadata: Metadata = {
  title: "Gifts, Return Favors & Party Picks",
  description:
    "Shop curated return gifts, new arrivals, and trending picks — a gift-store experience inspired by the best online shops.",
};

export default async function Home() {
  const data = await getHomePageData();

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <HomeHero />
      {data ? (
        <>
          <ProductSection
            title="Return gifts"
            emoji="🎉"
            products={data.giftPicks}
            viewAllHref="/products?tags=gift-idea"
          />
          <ProductSection
            title="New arrivals"
            emoji="🎉"
            products={data.newArrivals}
            viewAllHref="/products?tags=new-arrival"
          />
          <ProductSection
            title="Trending"
            emoji="🔥"
            products={data.trending}
            viewAllHref="/products?tags=best-seller"
          />
          <CategoryGrid categories={data.categories} />
        </>
      ) : (
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-lg text-zinc-700">
            Connect a database and run{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">npm run catalog:seed</code>{" "}
            to load products.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse catalog
          </Link>
        </section>
      )}
      <TrustStrip />
      <SiteFooter />
    </div>
  );
}
