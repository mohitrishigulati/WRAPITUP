import { listProducts } from "@/lib/catalog/products";
import { PRICE_BANDS } from "@/lib/store/storefront-config";

export function getPriceBandBySlug(slug: string) {
  return PRICE_BANDS.find((b) => b.slug === slug);
}

export async function listProductsForPriceBand(slug: string, page = 1) {
  const band = getPriceBandBySlug(slug);
  if (!band) return null;

  return listProducts({
    page,
    sort: "price_asc",
    minPrice: band.min,
    maxPrice: band.max ?? undefined,
  });
}

export { PRICE_BANDS };
