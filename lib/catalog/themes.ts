import { db } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/catalog/params";
import { listProducts } from "@/lib/catalog/products";

export async function getThemeBySlug(slug: string) {
  return db.theme.findUnique({ where: { slug } });
}

export async function getAllThemesWithCounts() {
  const themes = await db.theme.findMany({ orderBy: { name: "asc" } });
  const counts = await db.productTheme.groupBy({
    by: ["themeId"],
    where: { product: { isPublished: true } },
    _count: { productId: true },
  });
  const countByTheme = new Map(counts.map((c) => [c.themeId, c._count.productId]));

  return themes.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    productCount: countByTheme.get(t.id) ?? 0,
  }));
}

export async function listProductsForThemeSlug(
  themeSlug: string,
  page = 1,
  pageSize = PAGE_SIZE,
) {
  const theme = await db.theme.findUnique({
    where: { slug: themeSlug },
    include: {
      products: {
        where: { product: { isPublished: true } },
        select: { productId: true },
      },
    },
  });
  if (!theme) return null;
  const productIds = theme.products.map((p) => p.productId);
  if (!productIds.length) {
    return { products: [], total: 0, totalPages: 1, page, pageSize };
  }
  return listProducts({ page, sort: "newest", productIds, pageSize });
}

export async function listThemesForNav() {
  return db.theme.findMany({ orderBy: { name: "asc" } });
}

export async function listAllThemesForAdmin() {
  return db.theme.findMany({ orderBy: { name: "asc" } });
}
