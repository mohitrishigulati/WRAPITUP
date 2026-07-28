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
  title: "India's Birthday Return Gifts Online Store",
  description:
    "Return gifts, new arrivals, personalization, and trending picks — storefront inspired by giftoo.in.",
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
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <HeroBanner />
      <HomePageSections sections={sections} />
      <TrustStrip />
      <ReviewsStrip reviews={reviews} />
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  );
}
