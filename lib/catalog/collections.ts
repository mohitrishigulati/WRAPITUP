import { db } from "@/lib/db";
import { mapListRow } from "@/lib/catalog/products";
import type { CatalogProductListItem } from "@/types/catalog";
import { Prisma } from "@prisma/client";

type CollectionRow = {
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
  video_url: string | null;
  default_variant_id: string | null;
};

const productSelectSql = Prisma.sql`
  p."id",
  p."name",
  p."slug",
  p."images",
  p."createdAt",
  p."videoUrl" AS video_url,
  c."name" AS category_name,
  c."slug" AS category_slug,
  COALESCE(pr.min_price, p."basePrice") AS min_price,
  COALESCE(pr.max_price, p."basePrice") AS max_price,
  pr.max_compare_at,
  rv.avg_rating,
  COALESCE(rv.review_count, 0) AS review_count,
  COALESCE(st.total_stock, 0) AS total_stock,
  dv.default_variant_id,
  0 AS relevance
`;

const productJoinsSql = Prisma.sql`
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
    SELECT v."id" AS default_variant_id
    FROM "ProductVariant" v
    WHERE v."productId" = p."id"
    ORDER BY (v."stock" > 0) DESC, v."price" ASC
    LIMIT 1
  ) dv ON true
`;

function mapCollectionRow(row: CollectionRow): CatalogProductListItem & { videoUrl: string | null } {
  const { video_url, ...rest } = row;
  return { ...mapListRow(rest), videoUrl: video_url };
}

export async function getCollectionBySlug(slug: string) {
  return db.collection.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { position: "asc" },
        include: {
          product: {
            select: { id: true, name: true, slug: true, isPublished: true },
          },
        },
      },
    },
  });
}

export async function getCollectionProducts(slug: string, limit = 24) {
  const collection = await db.collection.findFirst({
    where: { slug, isActive: true },
    select: { id: true, title: true, displayType: true, slug: true },
  });
  if (!collection) return null;

  const rows = await db.$queryRaw<CollectionRow[]>`
    SELECT ${productSelectSql}
    ${productJoinsSql}
    INNER JOIN "CollectionProduct" cp ON cp."productId" = p."id"
    WHERE cp."collectionId" = ${collection.id}
      AND p."isPublished" = true
    ORDER BY cp."position" ASC, p."createdAt" DESC
    LIMIT ${limit}
  `;

  return {
    collection,
    products: rows.map(mapCollectionRow),
  };
}

export async function getActiveHomeCollections() {
  return db.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true, displayType: true },
  });
}

export async function listProductsWithVideo(limit = 12) {
  const rows = await db.$queryRaw<CollectionRow[]>`
    SELECT ${productSelectSql}
    ${productJoinsSql}
    WHERE p."isPublished" = true
      AND p."videoUrl" IS NOT NULL
      AND TRIM(p."videoUrl") <> ''
    ORDER BY p."createdAt" DESC
    LIMIT ${limit}
  `;
  return rows.map(mapCollectionRow);
}

export async function listAllCollectionsForAdmin() {
  return db.collection.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });
}
