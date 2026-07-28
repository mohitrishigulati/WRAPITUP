import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CatalogUnavailable } from "@/components/catalog/CatalogUnavailable";
import { getCollectionProducts } from "@/lib/catalog/collections";
import { safeCatalogQuery } from "@/lib/catalog/safe-query";
import { getDatabaseConfigStatus } from "@/lib/db/database-status";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dbStatus = await getDatabaseConfigStatus();
  if (!dbStatus.reachable) return { title: "Collection" };
  const data = await safeCatalogQuery(() => getCollectionProducts(params.slug, 1), null);
  if (!data) return { title: "Collection" };
  return { title: data.collection.title };
}

export default async function CollectionPage({ params }: Props) {
  const dbStatus = await getDatabaseConfigStatus();
  if (!dbStatus.reachable) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <CatalogUnavailable hint={dbStatus.hint} looksLikeLocalDevUrl={dbStatus.looksLikeLocalDevUrl} />
      </div>
    );
  }

  const data = await safeCatalogQuery(() => getCollectionProducts(params.slug, 48), null);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900">{data.collection.title}</h1>
      <div className="mt-8">
        <ProductGrid products={data.products} />
      </div>
      <p className="mt-8">
        <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
