/**
 * WrapItUp catalog seed — single-hierarchy categories, themes, tags, collections,
 * and 24 sample products. See docs/WRAPITUP-CATEGORY-TAXONOMY.md.
 *
 * Run: npx tsx prisma/seed.catalog.ts
 * Full seed (catalog + admin + coupon): npm run db:seed
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_JSON = join(__dirname, "data", "catalog-products.json");
const PRODUCT_IMAGES_JSON = join(__dirname, "data", "product-images.json");

const DEFAULT_PERSONALIZATION: Prisma.InputJsonValue = [
  { key: "name", label: "Name to print", maxLength: 20 },
];

const categoryTree = [
  {
    name: "Stationery & School",
    slug: "stationery-school",
    children: [
      { name: "Stationery Kits", slug: "stationery-kits" },
      { name: "Pens & Pencils", slug: "pens-pencils" },
      { name: "Erasers & Sharpeners", slug: "erasers-sharpeners" },
      { name: "Notebooks & Diaries", slug: "notebooks-diaries" },
      { name: "Files & Folders", slug: "files-folders" },
      { name: "Highlighters & Markers", slug: "highlighters-markers" },
      { name: "Geometry Tools & Rulers", slug: "geometry-tools-rulers" },
      { name: "Sticky Notes & Glue Sticks", slug: "sticky-notes-glue" },
    ],
  },
  {
    name: "Bags & Accessories",
    slug: "bags-accessories",
    children: [
      { name: "Handbags & Tote Bags", slug: "handbags-tote-bags" },
      { name: "Sling & Waist Bags", slug: "sling-waist-bags" },
      { name: "Pouches & Pencil Cases", slug: "pouches-pencil-cases" },
      { name: "School Bags", slug: "school-bags" },
      { name: "Keychains & Luggage Tags", slug: "keychains-luggage-tags" },
    ],
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    children: [
      { name: "Fun Toys & Games", slug: "fun-toys-games" },
      { name: "Educational Toys", slug: "educational-toys" },
      { name: "Puzzles & Brain Teasers", slug: "puzzles-brain-teasers" },
      { name: "DIY & Craft Kits", slug: "diy-craft-kits" },
    ],
  },
  {
    name: "Art & Craft",
    slug: "art-craft",
    children: [
      { name: "Art Books", slug: "art-books" },
      { name: "Coloring Supplies", slug: "coloring-supplies" },
      { name: "Painting Supplies", slug: "painting-supplies" },
      { name: "Stickers & Washi Tapes", slug: "stickers-washi-tapes" },
    ],
  },
  {
    name: "Gadgets & Lighting",
    slug: "gadgets-lighting",
    children: [
      { name: "Kids Gadgets", slug: "kids-gadgets" },
      { name: "Mini Fans", slug: "mini-fans" },
      { name: "LED Lamps", slug: "led-lamps" },
    ],
  },
  {
    name: "Drinkware & Lunch",
    slug: "drinkware-lunch",
    children: [
      { name: "Water Bottles & Sippers", slug: "water-bottles-sippers" },
      { name: "Lunch Boxes", slug: "lunch-boxes" },
    ],
  },
  {
    name: "Gift Sets & Hampers",
    slug: "gift-sets-hampers",
    children: [
      { name: "Birthday Gift Hampers", slug: "birthday-gift-hampers" },
      { name: "Personalized Gift Sets", slug: "personalized-gift-sets" },
      { name: "Corporate Gift Sets", slug: "corporate-gift-sets" },
    ],
  },
  {
    name: "Party & Decor",
    slug: "party-decor",
    children: [
      { name: "Paper Bags & Gift Boxes", slug: "paper-bags-gift-boxes" },
      { name: "Miniatures", slug: "miniatures" },
      { name: "Plushies & Soft Toys", slug: "plushies-soft-toys" },
    ],
  },
];

const themes = [
  { name: "Unicorn", slug: "unicorn" },
  { name: "Dino", slug: "dino" },
  { name: "Space", slug: "space" },
  { name: "Mermaid", slug: "mermaid" },
  { name: "Jungle", slug: "jungle" },
  { name: "Panda", slug: "panda" },
  { name: "Dessert", slug: "dessert" },
];

const tags = [
  { name: "Boys", slug: "gender-boys" },
  { name: "Girls", slug: "gender-girls" },
  { name: "Unisex", slug: "gender-unisex" },
  { name: "Age 0–3", slug: "age-0-3" },
  { name: "Age 3–6", slug: "age-3-6" },
  { name: "Age 6–9", slug: "age-6-9" },
  { name: "Age 9+", slug: "age-9-plus" },
  { name: "Gift Idea", slug: "gift-idea" },
  { name: "New Arrival", slug: "new-arrival" },
  { name: "Best Seller", slug: "best-seller" },
  { name: "Personalization", slug: "personalization" },
];

const collections = [
  { title: "Return Gifts 🎉", slug: "return-gifts", displayType: "carousel", sortOrder: 1 },
  { title: "New Arrivals 🎉", slug: "new-arrivals", displayType: "carousel", sortOrder: 2 },
  { title: "Trending 🔥", slug: "trending", displayType: "carousel", sortOrder: 3 },
  { title: "Personalization ✨", slug: "personalization-picks", displayType: "carousel", sortOrder: 4 },
];

type SeedProduct = {
  name: string;
  slug: string;
  sku?: string;
  categorySlug: string;
  themeSlugs?: string[];
  tagSlugs?: string[];
  priceRupees: number;
  compareAtRupees?: number;
  stock: number;
  isPersonalizable?: boolean;
  collectionSlugs?: string[];
  videoUrl?: string;
  imagePaths?: string[];
};

type ProductImagesFile = {
  publicBase?: string;
  bySlug?: Record<string, string[]>;
};

let productImagesBySlug: Record<string, string[]> | null = null;

function loadProductImagesBySlug(): Record<string, string[]> {
  if (productImagesBySlug) return productImagesBySlug;
  productImagesBySlug = {};
  if (!existsSync(PRODUCT_IMAGES_JSON)) return productImagesBySlug;
  try {
    const raw = JSON.parse(readFileSync(PRODUCT_IMAGES_JSON, "utf8")) as ProductImagesFile;
    const base =
      process.env.CATALOG_PUBLIC_BASE_URL?.trim()?.replace(/\/$/, "") ||
      raw.publicBase?.replace(/\/$/, "") ||
      "/catalog";
    for (const [slug, files] of Object.entries(raw.bySlug ?? {})) {
      productImagesBySlug[slug] = files.map((f) =>
        f.startsWith("http") ? f : `${base}/${f.replace(/^\//, "")}`,
      );
    }
  } catch {
    productImagesBySlug = {};
  }
  return productImagesBySlug;
}

function imagesForProduct(p: SeedProduct): string[] {
  const fromMap = loadProductImagesBySlug()[p.slug];
  if (fromMap?.length) return fromMap;
  if (p.imagePaths?.length) {
    return p.imagePaths.map((f) => (f.startsWith("/") ? f : `/catalog/${f}`));
  }
  return [placeholderImageUrl(p.name)];
}

function placeholderImageUrl(name: string) {
  return `https://placehold.co/600x600?text=${encodeURIComponent(name.slice(0, 40))}`;
}

function loadCatalogProducts(): SeedProduct[] {
  if (existsSync(CATALOG_JSON)) {
    const raw = JSON.parse(readFileSync(CATALOG_JSON, "utf8")) as {
      products: SeedProduct[];
    };
    const list = raw.products ?? [];
    if (list.length > 0) {
      const videoSlug = list.find((p) =>
        /usb.*fan|handheld fan/i.test(p.name),
      )?.slug;
      return list.map((p) => ({
        ...p,
        ...(p.slug === videoSlug && !p.videoUrl
          ? {
              videoUrl:
                "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            }
          : {}),
      }));
    }
  }
  return FALLBACK_PRODUCTS;
}

const FALLBACK_PRODUCTS: SeedProduct[] = [
  { name: "Unicorn Print Insulated Lunch Bag", slug: "unicorn-insulated-lunch-bag", categorySlug: "lunch-boxes", themeSlugs: ["unicorn"], tagSlugs: ["gender-girls", "age-3-6", "gift-idea"], priceRupees: 349, compareAtRupees: 449, stock: 40, collectionSlugs: ["return-gifts"] },
  { name: "Dino Explorer Sling Bag", slug: "dino-explorer-sling-bag", categorySlug: "sling-waist-bags", themeSlugs: ["dino"], tagSlugs: ["gender-boys", "age-3-6"], priceRupees: 199, compareAtRupees: 299, stock: 60, collectionSlugs: ["return-gifts", "trending"] },
  { name: "Personalized Name Keychain — Round", slug: "personalized-name-keychain-round", categorySlug: "keychains-luggage-tags", tagSlugs: ["gender-unisex", "personalization", "best-seller"], priceRupees: 99, compareAtRupees: 149, stock: 200, isPersonalizable: true, collectionSlugs: ["personalization-picks", "trending"] },
  { name: "Space Mission USB Handheld Fan", slug: "space-mission-usb-fan", categorySlug: "mini-fans", themeSlugs: ["space"], tagSlugs: ["gender-unisex", "age-6-9"], priceRupees: 149, compareAtRupees: 199, stock: 75, collectionSlugs: ["new-arrivals"], videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { name: "Mermaid Scale Water Bottle 500ml", slug: "mermaid-scale-water-bottle", categorySlug: "water-bottles-sippers", themeSlugs: ["mermaid"], tagSlugs: ["gender-girls", "age-3-6"], priceRupees: 299, compareAtRupees: 399, stock: 55, collectionSlugs: ["return-gifts"] },
  { name: "Jungle Friends Stationery Kit", slug: "jungle-friends-stationery-kit", categorySlug: "stationery-kits", themeSlugs: ["jungle"], tagSlugs: ["gender-unisex", "age-3-6", "gift-idea"], priceRupees: 199, compareAtRupees: 299, stock: 80, collectionSlugs: ["return-gifts", "new-arrivals"] },
  { name: "Panda Face LED Night Light", slug: "panda-face-led-night-light", categorySlug: "led-lamps", themeSlugs: ["panda"], tagSlugs: ["gender-unisex", "age-0-3"], priceRupees: 135, compareAtRupees: 199, stock: 90, collectionSlugs: ["new-arrivals"] },
  { name: "Dessert Party Eraser Set (6pc)", slug: "dessert-party-eraser-set", categorySlug: "erasers-sharpeners", themeSlugs: ["dessert"], tagSlugs: ["gender-unisex", "age-3-6"], priceRupees: 139, compareAtRupees: 199, stock: 100, collectionSlugs: ["trending"] },
  { name: "Unicorn Sticker Roll — 500 Stickers", slug: "unicorn-sticker-roll-500", categorySlug: "stickers-washi-tapes", themeSlugs: ["unicorn"], tagSlugs: ["gender-girls", "age-3-6", "gift-idea"], priceRupees: 149, compareAtRupees: 199, stock: 70, collectionSlugs: ["return-gifts"] },
  { name: "Dino Duffle Bag for Kids", slug: "dino-duffle-bag", categorySlug: "handbags-tote-bags", themeSlugs: ["dino"], tagSlugs: ["gender-boys", "age-6-9"], priceRupees: 399, compareAtRupees: 499, stock: 35, collectionSlugs: ["trending"] },
  { name: "Personalized Metal Pen with Name Engraving", slug: "personalized-metal-pen", categorySlug: "pens-pencils", tagSlugs: ["gender-unisex", "personalization"], priceRupees: 129, compareAtRupees: 179, stock: 150, isPersonalizable: true, collectionSlugs: ["personalization-picks"] },
  { name: "Space Rocket 3D Puzzle Kit", slug: "space-rocket-3d-puzzle", categorySlug: "puzzles-brain-teasers", themeSlugs: ["space"], tagSlugs: ["gender-unisex", "age-6-9"], priceRupees: 175, compareAtRupees: 249, stock: 65, collectionSlugs: ["new-arrivals"] },
  { name: "Jungle Animal Pencil Pouch", slug: "jungle-animal-pencil-pouch", categorySlug: "pouches-pencil-cases", themeSlugs: ["jungle"], tagSlugs: ["gender-unisex", "age-3-6"], priceRupees: 249, compareAtRupees: 349, stock: 60, collectionSlugs: ["return-gifts"] },
  { name: "Mermaid Tail Sequin Pouch", slug: "mermaid-tail-sequin-pouch", categorySlug: "pouches-pencil-cases", themeSlugs: ["mermaid"], tagSlugs: ["gender-girls", "age-6-9"], priceRupees: 299, compareAtRupees: 399, stock: 45, collectionSlugs: ["trending"] },
  { name: "Panda DIY Sewing Craft Kit", slug: "panda-diy-sewing-kit", categorySlug: "diy-craft-kits", themeSlugs: ["panda"], tagSlugs: ["gender-unisex", "age-6-9"], priceRupees: 199, compareAtRupees: 299, stock: 50, collectionSlugs: ["new-arrivals"] },
  { name: "Dessert Themed Erasable Gel Pens (Pack of 12)", slug: "dessert-erasable-gel-pens", categorySlug: "highlighters-markers", themeSlugs: ["dessert"], tagSlugs: ["gender-unisex", "age-6-9"], priceRupees: 299, compareAtRupees: 349, stock: 55, collectionSlugs: ["trending"] },
  { name: "Unicorn Print A4 File Folder", slug: "unicorn-a4-file-folder", categorySlug: "files-folders", themeSlugs: ["unicorn"], tagSlugs: ["gender-girls", "age-6-9"], priceRupees: 265, compareAtRupees: 399, stock: 40, collectionSlugs: ["return-gifts"] },
  { name: "Dino Print School Bag", slug: "dino-print-school-bag", categorySlug: "school-bags", themeSlugs: ["dino"], tagSlugs: ["gender-boys", "age-3-6"], priceRupees: 1099, compareAtRupees: 1399, stock: 20, collectionSlugs: ["new-arrivals"] },
  { name: "Space Theme Lunch Box 700ml", slug: "space-theme-lunch-box", categorySlug: "lunch-boxes", themeSlugs: ["space"], tagSlugs: ["gender-unisex", "age-6-9"], priceRupees: 649, compareAtRupees: 799, stock: 30, collectionSlugs: ["trending"] },
  { name: "Personalized House-Shape Keychain", slug: "personalized-house-keychain", categorySlug: "keychains-luggage-tags", tagSlugs: ["gender-unisex", "personalization"], priceRupees: 99, compareAtRupees: 149, stock: 180, isPersonalizable: true, collectionSlugs: ["personalization-picks"] },
  { name: "Jungle Safari Return Gift Hamper", slug: "jungle-safari-gift-hamper", categorySlug: "birthday-gift-hampers", themeSlugs: ["jungle"], tagSlugs: ["gender-unisex", "age-3-6", "gift-idea"], priceRupees: 499, compareAtRupees: 699, stock: 25, collectionSlugs: ["return-gifts"] },
  { name: "Mermaid Waterproof Cartoon Bandages", slug: "mermaid-waterproof-bandages", categorySlug: "art-books", themeSlugs: ["mermaid"], tagSlugs: ["gender-girls", "age-3-6"], priceRupees: 25, compareAtRupees: 49, stock: 120, collectionSlugs: ["return-gifts"] },
  { name: "Panda Plush Soft Toy Keyring", slug: "panda-plush-soft-toy-keyring", categorySlug: "plushies-soft-toys", themeSlugs: ["panda"], tagSlugs: ["gender-unisex", "age-0-3", "gift-idea"], priceRupees: 149, compareAtRupees: 199, stock: 85, collectionSlugs: ["return-gifts"] },
  { name: "Corporate 3-in-1 Gift Set (Diary, Pen, Bottle)", slug: "corporate-3in1-gift-set", categorySlug: "corporate-gift-sets", tagSlugs: ["gender-unisex", "personalization"], priceRupees: 899, compareAtRupees: 999, stock: 40, isPersonalizable: true, collectionSlugs: ["personalization-picks"] },
];

const products = loadCatalogProducts();

export async function clearCatalog(dbClient: PrismaClient) {
  await dbClient.cartItem.deleteMany();
  await dbClient.orderItem.deleteMany();
  await dbClient.order.deleteMany();
  await dbClient.review.deleteMany();
  await dbClient.wishlistItem.deleteMany();
  await dbClient.collectionProduct.deleteMany();
  await dbClient.collection.deleteMany();
  await dbClient.productTheme.deleteMany();
  await dbClient.theme.deleteMany();
  await dbClient.newsletterSubscriber.deleteMany();
  await dbClient.productTag.deleteMany();
  await dbClient.productVariant.deleteMany();
  await dbClient.product.deleteMany();
  await dbClient.tag.deleteMany();
  await dbClient.category.deleteMany();
}

export async function seedCatalog(dbClient: PrismaClient) {
  await clearCatalog(dbClient);

  const categoryIdBySlug = new Map<string, string>();
  let leafCategoryCount = 0;

  for (const parent of categoryTree) {
    const parentRow = await dbClient.category.create({
      data: { name: parent.name, slug: parent.slug },
    });
    categoryIdBySlug.set(parent.slug, parentRow.id);
    for (const child of parent.children) {
      const childRow = await dbClient.category.create({
        data: { name: child.name, slug: child.slug, parentId: parentRow.id },
      });
      categoryIdBySlug.set(child.slug, childRow.id);
      leafCategoryCount++;
    }
  }

  for (const t of tags) {
    await dbClient.tag.create({ data: t });
  }

  const themeIdBySlug = new Map<string, string>();
  for (const t of themes) {
    const row = await dbClient.theme.create({ data: t });
    themeIdBySlug.set(t.slug, row.id);
  }

  const collectionIdBySlug = new Map<string, string>();
  for (const c of collections) {
    const row = await dbClient.collection.create({
      data: { ...c, isActive: true },
    });
    collectionIdBySlug.set(c.slug, row.id);
  }

  const collectionNextPosition = new Map<string, number>();

  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${p.categorySlug}`);
    }

    const compareAt = p.compareAtRupees ?? Math.ceil(p.priceRupees * 1.35);

    const product = await dbClient.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        categoryId,
        description: `${p.name} — sample catalog item for WrapItUp.`,
        basePrice: p.priceRupees,
        images: imagesForProduct(p),
        isPublished: true,
        isPersonalizable: !!p.isPersonalizable,
        ...(p.isPersonalizable ? { personalizationFields: DEFAULT_PERSONALIZATION } : {}),
        ...(p.videoUrl ? { videoUrl: p.videoUrl } : {}),
        variants: {
          create: {
            sku: p.sku ?? `${p.slug}-default`,
            name: "Default",
            attributes: {},
            stock: p.stock,
            compareAtPrice: compareAt,
          },
        },
        tags: {
          create: (p.tagSlugs ?? []).map((slug) => ({
            tag: { connect: { slug } },
          })),
        },
        themes: {
          create: (p.themeSlugs ?? []).flatMap((themeSlug) => {
            const themeId = themeIdBySlug.get(themeSlug);
            if (!themeId) return [];
            return [{ themeId }];
          }),
        },
      },
    });

    for (const collectionSlug of p.collectionSlugs ?? []) {
      const collectionId = collectionIdBySlug.get(collectionSlug);
      if (!collectionId) continue;
      const position = collectionNextPosition.get(collectionSlug) ?? 0;
      await dbClient.collectionProduct.create({
        data: { collectionId, productId: product.id, position },
      });
      collectionNextPosition.set(collectionSlug, position + 1);
    }
  }

  return {
    parentCategories: categoryTree.length,
    leafCategories: leafCategoryCount,
    themes: themes.length,
    tags: tags.length,
    collections: collections.length,
    products: products.length,
  };
}

const isDirectRun =
  typeof process.argv[1] === "string" && process.argv[1].includes("seed.catalog");

if (isDirectRun) {
  const prisma = new PrismaClient();
  seedCatalog(prisma)
    .then((result) => {
      console.info("Catalog seed complete:", result);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
