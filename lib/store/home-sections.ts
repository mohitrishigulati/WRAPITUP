/**
 * Homepage section order — mirrors giftoo.in flow (collections, video, category carousels, grids).
 * Titles/link targets are config; products come from DB at runtime.
 */

export type HomeSectionConfig =
  | { type: "collection"; slug: string; titleOverride?: string }
  | { type: "video" }
  | {
      type: "category";
      categorySlug: string;
      title: string;
      subtitle?: string;
      viewAllLabel?: string;
    }
  | { type: "shop-tiles" }
  | { type: "themes" };

/** Giftoo-style long homepage (see docs/GIFTOO-PARITY.md). */
export const HOME_SECTIONS: HomeSectionConfig[] = [
  { type: "collection", slug: "return-gifts" },
  { type: "video" },
  { type: "collection", slug: "new-arrivals" },
  { type: "category", categorySlug: "mini-fans", title: "MINI FANS" },
  { type: "shop-tiles" },
  { type: "category", categorySlug: "kids-gadgets", title: "Kids Gadgets" },
  {
    type: "collection",
    slug: "trending",
    titleOverride: "Trending on Reel",
  },
  {
    type: "category",
    categorySlug: "diy-craft-kits",
    title: "DIY Products",
    subtitle: "Unlock the Builder in You!",
  },
  {
    type: "collection",
    slug: "personalization-picks",
    titleOverride: "Personalised Gift Sets",
  },
  { type: "themes" },
  {
    type: "category",
    categorySlug: "water-bottles-sippers",
    title: "Bottle & Sippers",
  },
  { type: "category", categorySlug: "led-lamps", title: "LED Lamps" },
  {
    type: "category",
    categorySlug: "educational-toys",
    title: "Educational Toys",
  },
  {
    type: "category",
    categorySlug: "keychains-luggage-tags",
    title: "Keychain",
    viewAllLabel: "View more",
  },
  { type: "category", categorySlug: "lunch-boxes", title: "Lunch Box" },
  { type: "category", categorySlug: "school-bags", title: "School Bags" },
];

export type ShopTileConfig = {
  label: string;
  href: string;
};

/** Giftoo “Shop By Category” tile strip (marketing labels → routes). */
export const HOME_SHOP_TILES: ShopTileConfig[] = [
  { label: "Return Gifts", href: "/collections/return-gifts" },
  { label: "Personalization", href: "/collections/personalization-picks" },
  { label: "Fancy Stationery", href: "/categories/stationery-school" },
  { label: "Trendy on Reels", href: "/collections/trending" },
  { label: "LED Lamps", href: "/categories/led-lamps" },
  { label: "MINI FANS", href: "/categories/mini-fans" },
  { label: "Lunch Boxes", href: "/categories/lunch-boxes" },
  { label: "Keychains", href: "/categories/keychains-luggage-tags" },
  { label: "Pouches & Cases", href: "/categories/pouches-pencil-cases" },
  { label: "School Bags", href: "/categories/school-bags" },
  { label: "Highlighters & Markers", href: "/categories/highlighters-markers" },
  { label: "Bottle & Sippers", href: "/categories/water-bottles-sippers" },
  { label: "Handbags / Tote Bags", href: "/categories/handbags-tote-bags" },
  { label: "Gift Hampers", href: "/categories/birthday-gift-hampers" },
  { label: "Kids Gadgets", href: "/categories/kids-gadgets" },
];

export type NavShortcut = { label: string; href: string };

/** Top-nav shortcuts like giftoo.in (flat links beside mega-menu). */
export const GIFTOO_NAV_SHORTCUTS: NavShortcut[] = [
  { label: "Personalized Stickers", href: "/categories/stickers-washi-tapes" },
  { label: "LED Lamps", href: "/categories/led-lamps" },
  { label: "Handbags / Tote Bags", href: "/categories/handbags-tote-bags" },
  { label: "Gift Hampers", href: "/categories/birthday-gift-hampers" },
  { label: "Toys & Games", href: "/categories/toys-games" },
  { label: "Kids Gadgets", href: "/categories/kids-gadgets" },
  { label: "School Bags", href: "/categories/school-bags" },
  { label: "Lunch Box", href: "/categories/lunch-boxes" },
  { label: "Water Bottle & Sippers", href: "/categories/water-bottles-sippers" },
  { label: "Keychains", href: "/categories/keychains-luggage-tags" },
  { label: "Mini Fans", href: "/categories/mini-fans" },
  { label: "Miniatures", href: "/categories/miniatures" },
  { label: "Plushies - Soft Toys", href: "/categories/plushies-soft-toys" },
];
