import { db } from "@/lib/db";
import { getActiveHomeCollections, getCollectionProducts } from "@/lib/catalog/collections";
import { listProductsWithVideo } from "@/lib/catalog/collections";
import { listProducts } from "@/lib/catalog/products";
import { HOME_SECTION_SIZE } from "@/lib/catalog/params";
import type { CatalogProductListItem } from "@/types/catalog";
import type { CarouselProduct } from "@/components/home/CollectionCarousel";

export type HomeCategoryTile = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export type HomePageData = {
  collections: Awaited<ReturnType<typeof getActiveHomeCollections>>;
  collectionProducts: Record<string, CarouselProduct[]>;
  videoProducts: CarouselProduct[];
  newArrivals: CatalogProductListItem[];
  categories: HomeCategoryTile[];
};

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

export async function getHomePageData(): Promise<HomePageData | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;

  try {
    const [collections, videoProducts, newArrivals, categories] = await Promise.all([
      getActiveHomeCollections(),
      listProductsWithVideo(HOME_SECTION_SIZE),
      listProducts({ page: 1, sort: "newest", pageSize: HOME_SECTION_SIZE }),
      loadCategoryTiles(),
    ]);

    const collectionProducts: HomePageData["collectionProducts"] = {};
    await Promise.all(
      collections.map(async (col) => {
        const result = await getCollectionProducts(col.slug, HOME_SECTION_SIZE);
        if (result) {
          collectionProducts[col.slug] = result.products;
        }
      }),
    );

    return {
      collections,
      collectionProducts,
      videoProducts,
      newArrivals: newArrivals.products,
      categories,
    };
  } catch {
    return null;
  }
}
