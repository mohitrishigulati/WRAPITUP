import type { CarouselProduct } from "@/components/home/CollectionCarousel";
import { getCollectionProducts } from "@/lib/catalog/collections";
import { listProductsWithVideo } from "@/lib/catalog/collections";
import { listProductsForCategorySlug } from "@/lib/catalog/products";
import { getAllThemesWithCounts } from "@/lib/catalog/themes";
import { HOME_SECTION_SIZE } from "@/lib/catalog/params";
import { safeCatalogQuery } from "@/lib/catalog/safe-query";
import { isDatabaseReachable } from "@/lib/db/connectivity";
import { db } from "@/lib/db";
import {
  HOME_SECTIONS,
  HOME_SHOP_TILES,
  type HomeSectionConfig,
} from "@/lib/store/home-sections";

export type RenderableHomeSection =
  | {
      type: "collection";
      title: string;
      slug: string;
      products: CarouselProduct[];
    }
  | { type: "video"; products: CarouselProduct[] }
  | {
      type: "category";
      title: string;
      subtitle?: string;
      categorySlug: string;
      products: CarouselProduct[];
      viewAllLabel?: string;
    }
  | { type: "shop-tiles" }
  | { type: "themes"; themes: Awaited<ReturnType<typeof getAllThemesWithCounts>> };

async function loadCollectionSection(
  slug: string,
  titleOverride?: string,
): Promise<RenderableHomeSection | null> {
  return safeCatalogQuery(async () => {
    const col = await db.collection.findFirst({
      where: { slug, isActive: true },
      select: { slug: true, title: true },
    });
    if (!col) return null;
    const result = await getCollectionProducts(slug, HOME_SECTION_SIZE);
    if (!result?.products.length) return null;
    return {
      type: "collection" as const,
      slug,
      title: titleOverride ?? col.title,
      products: result.products,
    };
  }, null);
}

async function loadCategorySection(
  config: Extract<HomeSectionConfig, { type: "category" }>,
): Promise<RenderableHomeSection | null> {
  return safeCatalogQuery(async () => {
    const listing = await listProductsForCategorySlug(config.categorySlug, {
      page: 1,
      sort: "newest",
      pageSize: HOME_SECTION_SIZE,
    });
    if (!listing?.products.length) return null;
    return {
      type: "category" as const,
      title: config.title,
      subtitle: config.subtitle,
      categorySlug: config.categorySlug,
      products: listing.products,
      viewAllLabel: config.viewAllLabel,
    };
  }, null);
}

export async function buildHomeSections(): Promise<RenderableHomeSection[]> {
  if (!(await isDatabaseReachable())) {
    const hasShopTiles = HOME_SECTIONS.some((s) => s.type === "shop-tiles");
    return hasShopTiles ? [{ type: "shop-tiles" }] : [];
  }

  const sections: RenderableHomeSection[] = [];

  for (const config of HOME_SECTIONS) {
    if (config.type === "collection") {
      const row = await loadCollectionSection(config.slug, config.titleOverride);
      if (row) sections.push(row);
    } else if (config.type === "video") {
      const products = await safeCatalogQuery(
        () => listProductsWithVideo(HOME_SECTION_SIZE),
        [] as CarouselProduct[],
      );
      if (products.length) sections.push({ type: "video", products });
    } else if (config.type === "category") {
      const row = await loadCategorySection(config);
      if (row) sections.push(row);
    } else if (config.type === "shop-tiles") {
      sections.push({ type: "shop-tiles" });
    } else if (config.type === "themes") {
      const themes = await safeCatalogQuery(() => getAllThemesWithCounts(), []);
      if (themes.length) sections.push({ type: "themes", themes });
    }
  }

  return sections;
}

export { HOME_SHOP_TILES };
