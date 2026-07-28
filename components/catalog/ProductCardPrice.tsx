import type { ProductCardPricing } from "@/lib/catalog/product-card-display";

type ProductCardPriceProps = {
  pricing: ProductCardPricing;
  compact?: boolean;
};

/** Giftoo / Shopify-style price block on product cards. */
export function ProductCardPrice({ pricing, compact }: ProductCardPriceProps) {
  const textSize = compact ? "text-sm" : "text-base";

  return (
    <div className={`price flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${textSize}`}>
      <span className="sr-only">Sale price</span>
      <span className={`font-semibold ${pricing.onSale ? "text-sale-price" : "text-neutral-text"}`}>
        {pricing.saleLabel}
      </span>
      {pricing.compareLabel ? (
        <>
          <span className="sr-only">Regular price</span>
          <s className="text-sm font-normal text-sale-strike">{pricing.compareLabel}</s>
        </>
      ) : null}
    </div>
  );
}
