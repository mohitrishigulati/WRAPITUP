import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/catalog/params";
import { getCategoryDescendantIds } from "@/lib/catalog/categories";
import { decimalToNumber } from "@/lib/catalog/money";
import type { CatalogProductListItem, CatalogSort, ProductDetailView } from "@/types/catalog";

type ListProductsInput = {
  q?: string;
  page: number;
  sort: CatalogSort;
  categoryIds?: string[];
  tagSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  pageSize?: number;
};

type ListRow = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  createdAt: Date;
  category_name: string;
  category_slug: string;
  min_price: Prisma.Decimal | null;
  max_price: Prisma.Decimal | null;
  max_compare_at: Prisma.Decimal | null;
  avg_rating: number | null;
  review_count: bigint;
  total_stock: bigint;
  relevance: number;
};

function orderClause(sort: CatalogSort, hasQuery: boolean): Prisma.Sql {
  switch (sort) {
    case "price_asc":
      return Prisma.sql`min_price ASC NULLS LAST, p."createdAt" DESC`;
    case "price_desc":
      return Prisma.sql`min_price DESC NULLS LAST, p."createdAt" DESC`;
    case "popularity":
      return Prisma.sql`sales_count DESC, p."createdAt" DESC`;
    case "rating":
      return Prisma.sql`avg_rating DESC NULLS LAST, review_count DESC, p."createdAt" DESC`;
    case "relevance":
      return hasQuery
        ? Prisma.sql`relevance DESC, p."createdAt" DESC`
        : Prisma.sql`p."createdAt" DESC`;
    case "newest":
    default:
      return Prisma.sql`p."createdAt" DESC`;
  }
}

function buildListQuery(input: ListProductsInput, countOnly: boolean) {
  const conditions: Prisma.Sql[] = [Prisma.sql`p."isPublished" = true`];

  if (input.categoryIds?.length) {
    conditions.push(
      Prisma.sql`p."categoryId" IN (${Prisma.join(input.categoryIds)})`,
    );
  }

  if (input.tagSlugs?.length) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "ProductTag" pt
      INNER JOIN "Tag" t ON t."id" = pt."tagId"
      WHERE pt."productId" = p."id"
      AND t."slug" IN (${Prisma.join(input.tagSlugs)})
    )`);
  }

  if (input.inStockOnly) {
    conditions.push(Prisma.sql`COALESCE(st.total_stock, 0) > 0`);
  }

  const minPrice = input.minPrice;
  const maxPrice = input.maxPrice;
  if (minPrice !== undefined) {
    conditions.push(Prisma.sql`COALESCE(pr.min_price, p."basePrice") >= ${minPrice}`);
  }
  if (maxPrice !== undefined) {
    conditions.push(Prisma.sql`COALESCE(pr.max_price, p."basePrice") <= ${maxPrice}`);
  }

  const q = input.q?.trim();
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(
      Prisma.sql`(
        p."name" ILIKE ${pattern}
        OR p."description" ILIKE ${pattern}
        OR c."name" ILIKE ${pattern}
      )`,
    );
  }

  const whereSql =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;

  const relevanceSql = q
    ? Prisma.sql`CASE
        WHEN lower(p."name") = lower(${q}) THEN 4
        WHEN p."name" ILIKE ${`${q}%`} THEN 3
        WHEN p."name" ILIKE ${`%${q}%`} THEN 2
        ELSE 1
      END`
    : Prisma.sql`0`;

  const baseFrom = Prisma.sql`
    FROM "Product" p
    INNER JOIN "Category" c ON c."id" = p."categoryId"
    LEFT JOIN LATERAL (
      SELECT
        MIN(COALESCE(v."price", p."basePrice")) AS min_price,
        MAX(COALESCE(v."price", p."basePrice")) AS max_price,
        MAX(v."compareAtPrice") AS max_compare_at
      FROM "ProductVariant" v
      WHERE v."productId" = p."id"
    ) pr ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(v."stock"), 0) AS total_stock
      FROM "ProductVariant" v
      WHERE v."productId" = p."id"
    ) st ON true
    LEFT JOIN LATERAL (
      SELECT AVG(r."rating")::float AS avg_rating, COUNT(*)::bigint AS review_count
      FROM "Review" r
      WHERE r."productId" = p."id"
    ) rv ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(oi."id")::bigint AS sales_count
      FROM "ProductVariant" v
      INNER JOIN "OrderItem" oi ON oi."productVariantId" = v."id"
      WHERE v."productId" = p."id"
    ) sl ON true
    ${whereSql}
  `;

  if (countOnly) {
    return Prisma.sql`SELECT COUNT(*)::int AS count ${baseFrom}`;
  }

  const pageSize = input.pageSize ?? PAGE_SIZE;
  const offset = (input.page - 1) * pageSize;
  const order = orderClause(input.sort, Boolean(q));

  return Prisma.sql`
    SELECT
      p."id",
      p."name",
      p."slug",
      p."images",
      p."createdAt",
      c."name" AS category_name,
      c."slug" AS category_slug,
      COALESCE(pr.min_price, p."basePrice") AS min_price,
      COALESCE(pr.max_price, p."basePrice") AS max_price,
      pr.max_compare_at,
      rv.avg_rating,
      COALESCE(rv.review_count, 0) AS review_count,
      COALESCE(st.total_stock, 0) AS total_stock,
      ${relevanceSql} AS relevance
    ${baseFrom}
    ORDER BY ${order}
    LIMIT ${pageSize} OFFSET ${offset}
  `;
}

function mapListRow(row: ListRow): CatalogProductListItem {
  const minPrice = decimalToNumber(row.min_price);
  const maxPrice = decimalToNumber(row.max_price);
  const maxCompareAt = row.max_compare_at ? decimalToNumber(row.max_compare_at) : null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.images[0] ?? null,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    minPrice,
    maxPrice,
    maxCompareAtPrice:
      maxCompareAt != null && maxCompareAt > minPrice ? maxCompareAt : null,
    averageRating: row.avg_rating,
    reviewCount: Number(row.review_count),
    inStock: Number(row.total_stock) > 0,
    createdAt: row.createdAt,
  };
}

export async function listProducts(input: ListProductsInput) {
  const [rows, countResult] = await Promise.all([
    db.$queryRaw<ListRow[]>(buildListQuery(input, false)),
    db.$queryRaw<{ count: number }[]>(buildListQuery(input, true)),
  ]);

  const total = countResult[0]?.count ?? 0;
  const pageSize = input.pageSize ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    products: rows.map(mapListRow),
    total,
    totalPages,
    page: input.page,
    pageSize,
  };
}

export async function listProductsForCategorySlug(
  categorySlug: string,
  input: Omit<ListProductsInput, "categoryIds">,
) {
  const category = await db.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return null;

  const categoryIds = await getCategoryDescendantIds(category.id);
  return listProducts({ ...input, categoryIds });
}

export async function getAllTagSlugs() {
  return db.tag.findMany({ orderBy: { name: "asc" } });
}

export async function getProductBySlug(slug: string): Promise<ProductDetailView | null> {
  const product = await db.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      category: { include: { parent: { select: { slug: true, name: true } } } },
      variants: { orderBy: { name: "asc" } },
      reviews: { select: { rating: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!product) return null;

  const prices = product.variants.map((v) =>
    decimalToNumber(v.price ?? product.basePrice),
  );
  const minPrice = prices.length ? Math.min(...prices) : decimalToNumber(product.basePrice);
  const maxPrice = prices.length ? Math.max(...prices) : decimalToNumber(product.basePrice);
  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    images: product.images.length ? product.images : [],
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
      parentSlug: product.category.parent?.slug ?? null,
      parentName: product.category.parent?.name ?? null,
    },
    tags: product.tags.map(({ tag }) => ({ name: tag.name, slug: tag.slug })),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      attributes: parseVariantAttributes(v.attributes),
      price: decimalToNumber(v.price ?? product.basePrice),
      compareAtPrice: v.compareAtPrice ? decimalToNumber(v.compareAtPrice) : null,
      stock: v.stock,
    })),
    minPrice,
    maxPrice,
    averageRating,
    reviewCount,
    inStock: totalStock > 0,
  };
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
): Promise<CatalogProductListItem[]> {
  const categoryIds = await getCategoryDescendantIds(categoryId);
  const result = await listProducts({
    page: 1,
    sort: "popularity",
    categoryIds,
  });

  return result.products.filter((p) => p.id !== productId).slice(0, limit);
}

function parseVariantAttributes(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === "string") out[key] = val;
    else if (val != null) out[key] = String(val);
  }
  return out;
}
