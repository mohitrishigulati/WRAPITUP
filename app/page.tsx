import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroBanner } from "@/components/home/HeroBanner";
import { HomePageSections } from "@/components/home/HomePageSections";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ReviewsStrip } from "@/components/home/ReviewsStrip";
import { WhatsAppWidget } from "@/components/storefront/WhatsAppWidget";
import { buildHomeSections } from "@/lib/catalog/home-sections";
import { getLatestReviews } from "@/lib/catalog/reviews-home";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "India's Birthday Return Gifts & Party Picks",
  description:
    "Shop return gifts, new arrivals, personalization, and trending picks — a gift-store experience inspired by giftoo.in.",
};

export default async function Home() {
  const sections = await buildHomeSections();
  let reviews: Awaited<ReturnType<typeof getLatestReviews>> = [];
  try {
    reviews = await getLatestReviews(12);
  } catch {
    reviews = [];
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <SiteHeader />
      <HeroBanner />
      {sections.length > 0 ? (
        <HomePageSections sections={sections} />
      ) : (
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-lg text-neutral-muted">
            Connect a database and run{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">npm run catalog:seed</code>{" "}
            to load products, themes, and collections.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Browse catalog
          </Link>
        </section>
      )}
      <ReviewsStrip reviews={reviews} />
      <TrustStrip />
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  );
}
