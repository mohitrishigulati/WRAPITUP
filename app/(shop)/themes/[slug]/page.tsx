import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CatalogUnavailable } from "@/components/catalog/CatalogUnavailable";
import { getThemeBySlug, listProductsForThemeSlug } from "@/lib/catalog/themes";
import { safeCatalogQuery } from "@/lib/catalog/safe-query";
import { getDatabaseConfigStatus } from "@/lib/db/database-status";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dbStatus = await getDatabaseConfigStatus();
  if (!dbStatus.reachable) return { title: "Theme" };
  const theme = await safeCatalogQuery(() => getThemeBySlug(params.slug), null);
  if (!theme) return { title: "Theme" };
  return { title: `${theme.name} theme gifts` };
}

export default async function ThemePage({ params }: Props) {
  const dbStatus = await getDatabaseConfigStatus();
  if (!dbStatus.reachable) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <CatalogUnavailable hint={dbStatus.hint} looksLikeLocalDevUrl={dbStatus.looksLikeLocalDevUrl} />
      </div>
    );
  }

  const theme = await safeCatalogQuery(() => getThemeBySlug(params.slug), null);
  if (!theme) notFound();

  const result = await safeCatalogQuery(
    () => listProductsForThemeSlug(params.slug, 1, 48),
    null,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900">{theme.name}</h1>
      <p className="mt-2 text-zinc-600">Themed return gifts and party picks.</p>
      <div className="mt-8">
        <ProductGrid products={result?.products ?? []} />
      </div>
      <p className="mt-8">
        <Link href="/themes" className="text-sm font-medium text-brand-600 hover:underline">
          ← All themes
        </Link>
      </p>
    </div>
  );
}
