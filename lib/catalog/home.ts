import { db } from "@/lib/db";
import { HOME_SECTION_SIZE } from "@/lib/catalog/params";
import { listProducts } from "@/lib/catalog/products";

export type HomeCategoryTile = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export type HomePageData = {
  giftPicks: Awaited<ReturnType<typeof listProducts>>["products"];
  newArrivals: Awaited<ReturnType<typeof listProducts>>["products"];
  trending: Awaited<ReturnType<typeof listProducts>>["products"];
  categories: HomeCategoryTile[];
};

export async function getHomePageData(): Promise<HomePageData | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;

  try {
    const [giftPicks, newArrivals, trending, categories] = await Promise.all([
      listProducts({
        page: 1,
        sort: "popularity",
        tagSlugs: ["gift-idea"],
        pageSize: HOME_SECTION_SIZE,
      }),
      listProducts({
        page: 1,
        sort: "newest",
        tagSlugs: ["new-arrival"],
        pageSize: HOME_SECTION_SIZE,
      }),
      listProducts({
        page: 1,
        sort: "popularity",
        tagSlugs: ["best-seller"],
        pageSize: HOME_SECTION_SIZE,
      }),
      loadCategoryTiles(),
    ]);

    const fallback =
      giftPicks.products.length === 0
        ? (
            await listProducts({
              page: 1,
              sort: "newest",
              pageSize: HOME_SECTION_SIZE,
            })
          ).products
        : giftPicks.products;

    return {
      giftPicks: fallback,
      newArrivals:
        newArrivals.products.length > 0
          ? newArrivals.products
          : fallback.slice(0, HOME_SECTION_SIZE),
      trending:
        trending.products.length > 0
          ? trending.products
          : fallback.slice(0, HOME_SECTION_SIZE),
      categories,
    };
  } catch {
    return null;
  }
}

async function loadCategoryTiles(): Promise<HomeCategoryTile[]> {
  const rows = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    take: 16,
    include: {
      products: {
        where: { isPublished: true },
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { images: true },
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.products[0]?.images[0] ?? null,
  }));
}
