import { HomeProductSection } from "@/components/home/HomeProductSection";
import { HomePromoBanner } from "@/components/home/HomePromoBanner";
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
            <HomeProductSection
              key={`col-${section.slug}`}
              title={section.title}
              products={section.products}
              viewAllHref={`/collections/${section.slug}`}
            />
          );
        }
        if (section.type === "video") {
          return (
            <HomeProductSection
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
            <HomeProductSection
              key={`cat-${section.categorySlug}-${index}`}
              title={section.title}
              subtitle={section.subtitle}
              products={section.products}
              viewAllHref={`/categories/${section.categorySlug}`}
              viewAllLabel={section.viewAllLabel ?? "View all"}
            />
          );
        }
        if (section.type === "promo") {
          return (
            <HomePromoBanner
              key={`promo-${section.title}`}
              title={section.title}
              subtitle={section.subtitle}
              href={section.href}
              imageUrl={section.imageUrl}
            />
          );
        }
        if (section.type === "shop-tiles") {
          return <ShopByCategoryTiles key="shop-tiles" />;
        }
        if (section.type === "themes") {
          return <ThemeGrid key="themes" themes={section.themes} />;
        }
        return null;
      })}
    </>
  );
}
