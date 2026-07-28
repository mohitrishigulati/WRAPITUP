const PLACEHOLDER = "https://placehold.co/800x800/f4f4f5/71717a?text=WrapItUp";

export function productImageUrl(url: string | null | undefined) {
  if (url && url.trim().length > 0) return url;
  return PLACEHOLDER;
}

export const PRODUCT_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

export const PRODUCT_DETAIL_IMAGE_SIZES =
  "(max-width: 1024px) 100vw, 50vw";
