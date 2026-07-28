import "server-only";

export function getShippingConfig() {
  const flatRate = Number.parseFloat(process.env.SHIPPING_FLAT_RATE ?? "5.99");
  const freeThreshold = Number.parseFloat(
    process.env.SHIPPING_FREE_THRESHOLD ?? "75",
  );

  return {
    flatRate: Number.isFinite(flatRate) ? flatRate : 5.99,
    freeThreshold: Number.isFinite(freeThreshold) ? freeThreshold : 75,
  };
}

export function calculateShipping(subtotalAfterDiscount: number) {
  const { flatRate, freeThreshold } = getShippingConfig();
  if (subtotalAfterDiscount >= freeThreshold) {
    return 0;
  }
  return flatRate;
}
