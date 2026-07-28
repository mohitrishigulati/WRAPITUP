export const CART_STORAGE_KEY = "wrapitup-cart-v1";

export type CartLine = {
  variantId: string;
  quantity: number;
};

export type CartLineView = CartLine & {
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
