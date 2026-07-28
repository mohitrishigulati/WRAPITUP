import Link from "next/link";
import type { Metadata } from "next";
import { WHATSAPP_INTENTS, whatsAppUrl } from "@/lib/store/storefront-config";

export const metadata: Metadata = {
  title: "Corporate & bulk gifts",
  description: "Bulk return gifts and corporate gifting — quantity orders via WhatsApp.",
};

export default function CorporateGiftsPage() {
  const bulkIntent = WHATSAPP_INTENTS.find((i) => i.id === "bulk");
  const waHref = bulkIntent ? whatsAppUrl(bulkIntent.message) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-zinc-900">Corporate &amp; bulk gifts</h1>
        <p className="mt-4 text-lg text-zinc-600">
          Schools, offices, and event planners — get curated return-gift bundles with quantity
          pricing. Our team handles bulk orders over WhatsApp (same flow as leading Indian gift
          stores).
        </p>
        <ul className="mt-8 list-disc space-y-2 pl-5 text-zinc-700">
          <li>Custom branding on select products</li>
          <li>Mix-and-match hampers by budget per child</li>
          <li>Delivery timelines for party dates</li>
        </ul>
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex rounded-full bg-[#25D366] px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Chat on WhatsApp for bulk orders
          </a>
        ) : (
          <p className="mt-10 text-sm text-zinc-600">
            Set <code className="rounded bg-zinc-200 px-1">NEXT_PUBLIC_WHATSAPP_NUMBER</code> to
            enable WhatsApp CTAs.
          </p>
        )}
        <p className="mt-8">
          <Link href="/products?tags=gift-idea" className="text-brand-600 hover:underline">
            Browse return gifts →
          </Link>
        </p>
    </div>
  );
}
