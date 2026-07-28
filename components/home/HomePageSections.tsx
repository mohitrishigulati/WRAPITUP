import { CollectionCarousel } from "@/components/home/CollectionCarousel";
import { ShopByCategoryTiles } from "@/components/home/ShopByCategoryTiles";
import { ThemeGrid } from "@/components/home/ThemeGrid";
import type { RenderableHomeSection } from "@/lib/catalog/home-sections";

type HomePageSectionsProps = {
  sections: RenderableHomeSection[];
};

export function HomePageSections({ sections }: HomePageSectionsProps) {
  return (
    <>
      {sections.map((section, index) => {
        if (section.type === "collection") {
          return (
            <CollectionCarousel
              key={`col-${section.slug}`}
              title={section.title}
              products={section.products}
              viewAllHref={`/collections/${section.slug}`}
            />
          );
        }
        if (section.type === "video") {
          return (
            <CollectionCarousel
              key="video"
              title="Shop by Video"
              products={section.products}
              viewAllHref="/products"
              variant="video"
            />
          );
        }
        if (section.type === "category") {
          return (
            <CollectionCarousel
              key={`cat-${section.categorySlug}-${index}`}
              title={section.title}
              subtitle={section.subtitle}
              products={section.products}
              viewAllHref={`/categories/${section.categorySlug}`}
              viewAllLabel={section.viewAllLabel}
            />
          );
        }
        if (section.type === "shop-tiles") {
          return <ShopByCategoryTiles key="shop-tiles" />;
        }
        if (section.type === "themes") {
          return <ThemeGrid key="themes" />;
        }
        return null;
      })}
    </>
  );
}
