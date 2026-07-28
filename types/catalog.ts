export type CatalogSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "popularity"
  | "rating"
  | "relevance";

export type CatalogProductListItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  hoverImageUrl: string | null;
  defaultVariantId: string | null;
  categoryName: string;
  categorySlug: string;
  minPrice: number;
  maxPrice: number;
  maxCompareAtPrice: number | null;
  averageRating: number | null;
  reviewCount: number;
  inStock: boolean;
  createdAt: Date;
};

export type CatalogSearchParams = {
  q?: string;
  page?: string;
  sort?: string;
  category?: string;
  tags?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
};

export type ProductVariantView = {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stock: number;
};

import type { PersonalizationFieldDef } from "@/lib/store/storefront-config";

export type ProductDetailView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
    parentSlug: string | null;
    parentName: string | null;
  };
  tags: { name: string; slug: string }[];
  variants: ProductVariantView[];
  minPrice: number;
  maxPrice: number;
  averageRating: number | null;
  reviewCount: number;
  inStock: boolean;
  isPersonalizable: boolean;
  personalizationFields: PersonalizationFieldDef[];
  videoUrl: string | null;
  minOrderQty: number;
  isBulkOnly: boolean;
};
