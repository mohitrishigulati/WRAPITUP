export const CART_STORAGE_KEY = "wrapitup-cart-v2";

export function cartLineKey(line: Pick<CartLine, "variantId" | "personalization">) {
  return `${line.variantId}:${JSON.stringify(line.personalization ?? {})}`;
}

export type CartLine = {
  variantId: string;
  quantity: number;
  personalization?: Record<string, string>;
};

export type CartLineView = CartLine & {
  lineKey: string;
  productName: string;
  variantName: string;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  lineTotal: number;
  inStock: boolean;
  maxQuantity: number;
};

export type CartTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};

export type PricedCart = {
  lines: CartLineView[];
  totals: CartTotals;
  couponCode: string | null;
  couponError: string | null;
};
