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
  | { type: "themes" }
  | {
      type: "promo";
      title: string;
      subtitle?: string;
      href: string;
      imageUrl: string;
    };

/** Giftoo-style long homepage (see docs/GIFTOO-PARITY.md). */
export const HOME_SECTIONS: HomeSectionConfig[] = [
  { type: "collection", slug: "return-gifts" },
  { type: "video" },
  { type: "collection", slug: "new-arrivals" },
  { type: "category", categorySlug: "mini-fans", title: "MINI FANS" },
  {
    type: "promo",
    title: "Hello Summer",
    subtitle: "Mini fans kids love — beat the heat!",
    href: "/categories/mini-fans",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
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
  /** Optional circle image (Giftoo shop-by-category). */
  imageUrl?: string;
};

/** Giftoo “Shop By Category” tile strip (marketing labels → routes). */
export const HOME_SHOP_TILES: ShopTileConfig[] = [
  {
    label: "Return Gifts",
    href: "/collections/return-gifts",
    imageUrl:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Personalization",
    href: "/collections/personalization-picks",
    imageUrl:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Fancy Stationery",
    href: "/categories/stationery-school",
    imageUrl:
      "https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Trendy on Reels",
    href: "/collections/trending",
    imageUrl:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=200&q=80",
  },
  { label: "LED Lamps", href: "/categories/led-lamps", imageUrl: "https://placehold.co/200x200/fef3c7/92400e?text=LED" },
  { label: "MINI FANS", href: "/categories/mini-fans", imageUrl: "https://placehold.co/200x200/dcfce7/166534?text=FAN" },
  { label: "Lunch Boxes", href: "/categories/lunch-boxes", imageUrl: "https://placehold.co/200x200/fce7f3/db2777?text=Lunch" },
  { label: "Keychains", href: "/categories/keychains-luggage-tags", imageUrl: "https://placehold.co/200x200/e0e7ff/4338ca?text=Key" },
  { label: "Pouches & Cases", href: "/categories/pouches-pencil-cases", imageUrl: "https://placehold.co/200x200/ffedd5/9a3412?text=Pouch" },
  { label: "School Bags", href: "/categories/school-bags", imageUrl: "https://placehold.co/200x200/f3e8ff/7e22ce?text=Bag" },
  { label: "Highlighters & Markers", href: "/categories/highlighters-markers", imageUrl: "https://placehold.co/200x200/ecfeff/0e7490?text=Pen" },
  { label: "Bottle & Sippers", href: "/categories/water-bottles-sippers", imageUrl: "https://placehold.co/200x200/dbeafe/1d4ed8?text=Bottle" },
  { label: "Handbags / Tote Bags", href: "/categories/handbags-tote-bags", imageUrl: "https://placehold.co/200x200/fae8ff/a21caf?text=Tote" },
  { label: "Gift Hampers", href: "/categories/birthday-gift-hampers", imageUrl: "https://placehold.co/200x200/fef9c3/a16207?text=Gift" },
  { label: "Kids Gadgets", href: "/categories/kids-gadgets", imageUrl: "https://placehold.co/200x200/f1f5f9/475569?text=Tech" },
];

/** Fallback theme circles when DB is empty (matches seed slugs). */
export const HOME_THEME_TILES = [
  { slug: "dino", name: "DINO", emoji: "🦕" },
  { slug: "unicorn", name: "UNICORN", emoji: "🦄" },
  { slug: "mermaid", name: "Mermaid Theme", emoji: "🧜‍♀️" },
  { slug: "space", name: "Space Theme", emoji: "🚀" },
  { slug: "jungle", name: "Jungle Theme", emoji: "🦁" },
  { slug: "panda", name: "PANDA", emoji: "🐼" },
  { slug: "dessert", name: "Dessert Theme", emoji: "🍰" },
] as const;

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
