import { formatStorePrice } from "@/lib/catalog/money";
import type { CatalogProductListItem } from "@/types/catalog";

export type ProductCardPricing = {
  onSale: boolean;
  saleLabel: string;
  compareLabel: string | null;
  discountPercent: number | null;
};

export function getProductCardPricing(
  product: Pick<CatalogProductListItem, "minPrice" | "maxPrice" | "maxCompareAtPrice">,
): ProductCardPricing {
  const onSale =
    product.maxCompareAtPrice != null && product.maxCompareAtPrice > product.minPrice;
  const hasVariantRange = product.minPrice !== product.maxPrice;
  const saleLabel = formatStorePrice(product.minPrice, { from: hasVariantRange });
  const compareLabel = onSale ? formatStorePrice(product.maxCompareAtPrice!) : null;
  const discountPercent =
    onSale && product.maxCompareAtPrice
      ? Math.round((1 - product.minPrice / product.maxCompareAtPrice) * 100)
      : null;

  return { onSale, saleLabel, compareLabel, discountPercent };
}
