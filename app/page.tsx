import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CollectionCarousel } from "@/components/home/CollectionCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ThemeGrid } from "@/components/home/ThemeGrid";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ReviewsStrip } from "@/components/home/ReviewsStrip";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { WhatsAppWidget } from "@/components/storefront/WhatsAppWidget";
import { getHomePageData } from "@/lib/catalog/home";
import { getLatestReviews } from "@/lib/catalog/reviews-home";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gifts, Return Favors & Party Picks",
  description:
    "Shop curated return gifts, new arrivals, and trending picks — a gift-store experience inspired by the best online shops.",
};

export default async function Home() {
  const data = await getHomePageData();
  let reviews: Awaited<ReturnType<typeof getLatestReviews>> = [];
  try {
    reviews = await getLatestReviews(12);
  } catch {
    reviews = [];
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <HeroBanner />
      {data ? (
        <>
          {data.collections.map((col) => {
            const products = data.collectionProducts[col.slug] ?? [];
            if (!products.length) return null;
            return (
              <CollectionCarousel
                key={col.slug}
                title={col.title}
                emoji={col.slug.includes("return") ? "🎉" : undefined}
                products={products}
                viewAllHref={`/collections/${col.slug}`}
              />
            );
          })}
          {data.videoProducts.length > 0 ? (
            <CollectionCarousel
              title="Shop by video"
              products={data.videoProducts}
              viewAllHref="/products"
              variant="video"
            />
          ) : null}
          {data.newArrivals.length > 0 ? (
            <CollectionCarousel
              title="New arrivals"
              emoji="🎉"
              products={data.newArrivals}
              viewAllHref="/products?tags=new-arrival"
            />
          ) : null}
          <CategoryGrid categories={data.categories} />
          <ThemeGrid />
        </>
      ) : (
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-lg text-zinc-700">
            Connect a database and run{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">npm run catalog:seed</code>{" "}
            to load products, themes, and collections.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse catalog
          </Link>
        </section>
      )}
      <ReviewsStrip reviews={reviews} />
      <TrustStrip />
      <NewsletterSignup />
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  );
}
