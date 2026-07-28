import { z } from "zod";
import type { CatalogSort } from "@/types/catalog";

const sortSchema = z.enum([
  "newest",
  "price_asc",
  "price_desc",
  "popularity",
  "rating",
  "relevance",
]);

export const PAGE_SIZE = 12;
export const HOME_SECTION_SIZE = 12;

export function parseCatalogParams(searchParams: Record<string, string | string[] | undefined>) {
  const raw = {
    q: pickString(searchParams.q),
    page: pickString(searchParams.page),
    sort: pickString(searchParams.sort),
    category: pickString(searchParams.category),
    tags: pickString(searchParams.tags),
    minPrice: pickString(searchParams.minPrice),
    maxPrice: pickString(searchParams.maxPrice),
    inStock: pickString(searchParams.inStock),
  };

  const page = Math.max(1, Number.parseInt(raw.page ?? "1", 10) || 1);
  const minPrice = raw.minPrice ? Number.parseFloat(raw.minPrice) : undefined;
  const maxPrice = raw.maxPrice ? Number.parseFloat(raw.maxPrice) : undefined;
  const tagSlugs = pickTags(searchParams.tags, searchParams.tag);

  let sort: CatalogSort = sortSchema.safeParse(raw.sort).success
    ? (raw.sort as CatalogSort)
    : "newest";

  if (raw.q && sort === "newest") {
    sort = "relevance";
  }

  return {
    q: raw.q?.trim() || undefined,
    page,
    sort,
    categorySlug: raw.category?.trim() || undefined,
    tagSlugs,
    minPrice: minPrice !== undefined && !Number.isNaN(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice !== undefined && !Number.isNaN(maxPrice) ? maxPrice : undefined,
    inStockOnly: raw.inStock === "1" || raw.inStock === "true",
  };
}

export function catalogQueryString(
  base: Record<string, string | number | boolean | undefined | string[]>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(base)) {
    if (value === undefined || value === "" || value === false) continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

function pickString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function pickTags(
  tags: string | string[] | undefined,
  tag: string | string[] | undefined,
) {
  const combined: string[] = [];
  if (typeof tags === "string") {
    combined.push(...tags.split(",").map((t) => t.trim()).filter(Boolean));
  } else if (Array.isArray(tags)) {
    combined.push(...tags.map((t) => t.trim()).filter(Boolean));
  }
  if (typeof tag === "string") combined.push(tag.trim());
  else if (Array.isArray(tag)) combined.push(...tag.map((t) => t.trim()).filter(Boolean));
  return Array.from(new Set(combined.filter(Boolean)));
}
