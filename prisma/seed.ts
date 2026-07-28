import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

type VariantSeed = {
  sku: string;
  name: string;
  attributes: Record<string, string>;
  stock: number;
  price?: number;
  compareAtPrice?: number;
};

function saleCompareAt(price: number) {
  return Math.ceil(price * 1.35);
}

type ProductSeed = {
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  basePrice: number;
  images: string[];
  tagSlugs: string[];
  variants: VariantSeed[];
};

const TAGS = [
  { name: "New arrival", slug: "new-arrival" },
  { name: "Best seller", slug: "best-seller" },
  { name: "Eco-friendly", slug: "eco-friendly" },
  { name: "Gift idea", slug: "gift-idea" },
  { name: "Limited", slug: "limited" },
];

const CATEGORIES = [
  {
    name: "Apparel",
    slug: "apparel",
    description: "Everyday wear and layers.",
    parentSlug: null as string | null,
  },
  {
    name: "Home",
    slug: "home",
    description: "Objects for calm spaces.",
    parentSlug: null,
  },
  {
    name: "Gifts & wrap",
    slug: "gifts-wrap",
    description: "Return gifts, paper, ribbons, and ready-to-give sets.",
    parentSlug: null,
  },
  {
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Soft cotton tees in core colors.",
    parentSlug: "apparel",
  },
  {
    name: "Mugs",
    slug: "mugs",
    description: "Ceramic mugs for slow mornings.",
    parentSlug: "home",
  },
  {
    name: "Candles",
    slug: "candles",
    description: "Soy candles with cotton wicks.",
    parentSlug: "home",
  },
  {
    name: "Gift sets",
    slug: "gift-sets",
    description: "Curated bundles for any occasion.",
    parentSlug: "gifts-wrap",
  },
];

const PRODUCTS: ProductSeed[] = [
  {
    name: "Essential Cotton Tee",
    slug: "essential-cotton-tee",
    categorySlug: "t-shirts",
    description:
      "A mid-weight organic cotton tee with a relaxed fit. Pre-washed for softness.",
    basePrice: 28,
    images: [UNSPLASH("photo-1521572163474-6864f9cf17ab")],
    tagSlugs: ["new-arrival", "eco-friendly"],
    variants: [
      { sku: "TEE-BLK-S", name: "Black / S", attributes: { color: "Black", size: "S" }, stock: 12 },
      { sku: "TEE-BLK-M", name: "Black / M", attributes: { color: "Black", size: "M" }, stock: 18 },
      { sku: "TEE-WHT-M", name: "White / M", attributes: { color: "White", size: "M" }, stock: 0 },
      { sku: "TEE-WHT-L", name: "White / L", attributes: { color: "White", size: "L" }, stock: 9 },
    ],
  },
  {
    name: "Weekend Overshirt",
    slug: "weekend-overshirt",
    categorySlug: "apparel",
    description: "Lightweight overshirt with corozo buttons and patch pockets.",
    basePrice: 78,
    images: [UNSPLASH("photo-1594938298603-c8148c4dae35")],
    tagSlugs: ["best-seller"],
    variants: [
      { sku: "SHIRT-OLV-M", name: "Olive / M", attributes: { color: "Olive", size: "M" }, stock: 6 },
      { sku: "SHIRT-OLV-L", name: "Olive / L", attributes: { color: "Olive", size: "L" }, stock: 4 },
    ],
  },
  {
    name: "Stoneware Morning Mug",
    slug: "stoneware-morning-mug",
    categorySlug: "mugs",
    description: "350ml stoneware mug with a matte glaze. Dishwasher safe.",
    basePrice: 24,
    images: [UNSPLASH("photo-1514228742587-6b1558fcca3d")],
    tagSlugs: ["gift-idea", "best-seller"],
    variants: [
      { sku: "MUG-SAND", name: "Sand", attributes: { color: "Sand" }, stock: 30 },
      { sku: "MUG-SAGE", name: "Sage", attributes: { color: "Sage" }, stock: 22 },
    ],
  },
  {
    name: "Wool Throw Blanket",
    slug: "wool-throw-blanket",
    categorySlug: "home",
    description: "Merino blend throw with a tight herringbone weave.",
    basePrice: 120,
    images: [UNSPLASH("photo-1631889992176-680b89341ed4")],
    tagSlugs: ["eco-friendly", "gift-idea"],
    variants: [
      { sku: "THROW-CHAR", name: "Charcoal", attributes: { color: "Charcoal" }, stock: 8 },
      { sku: "THROW-IVR", name: "Ivory", attributes: { color: "Ivory" }, stock: 5 },
    ],
  },
  {
    name: "Linen Table Napkin Set",
    slug: "linen-table-napkin-set",
    categorySlug: "home",
    description: "Set of four washed linen napkins with mitered corners.",
    basePrice: 42,
    images: [UNSPLASH("photo-1615529328331-f8917597711f")],
    tagSlugs: ["new-arrival", "eco-friendly"],
    variants: [
      { sku: "NAP-NAT-4", name: "Natural / 4-pack", attributes: { color: "Natural" }, stock: 25 },
      { sku: "NAP-SLG-4", name: "Slate / 4-pack", attributes: { color: "Slate" }, stock: 15 },
    ],
  },
  {
    name: "Cedarwood Soy Candle",
    slug: "cedarwood-soy-candle",
    categorySlug: "candles",
    description: "45-hour burn. Notes of cedar, vetiver, and bergamot.",
    basePrice: 32,
    images: [UNSPLASH("photo-1602607890834-0a8c4a7e0a8a")],
    tagSlugs: ["best-seller", "gift-idea"],
    variants: [
      { sku: "CND-CED-8OZ", name: "8 oz jar", attributes: { size: "8oz" }, stock: 40 },
      { sku: "CND-CED-16OZ", name: "16 oz jar", attributes: { size: "16oz" }, stock: 18, price: 48 },
    ],
  },
  {
    name: "Minimal Gift Wrap Roll",
    slug: "minimal-gift-wrap-roll",
    categorySlug: "gifts-wrap",
    description: "Kraft paper roll with grid print. 10m × 70cm.",
    basePrice: 14,
    images: [UNSPLASH("photo-1513885535751-8b9238bd345a")],
    tagSlugs: ["eco-friendly"],
    variants: [
      { sku: "WRAP-KRAFT", name: "Kraft grid", attributes: { style: "Kraft" }, stock: 60 },
      { sku: "WRAP-SAGE", name: "Sage dots", attributes: { style: "Sage" }, stock: 45 },
    ],
  },
  {
    name: "Cozy Night Gift Box",
    slug: "cozy-night-gift-box",
    categorySlug: "gift-sets",
    description: "Mug, candle, and throw sampler — ready to gift in a reusable box.",
    basePrice: 89,
    images: [UNSPLASH("photo-1549465220-1a8b9238cd41")],
    tagSlugs: ["gift-idea", "limited"],
    variants: [
      { sku: "BOX-COZY-1", name: "Standard box", attributes: { edition: "Standard" }, stock: 12 },
    ],
  },
  {
    name: "Organic Hoodie",
    slug: "organic-hoodie",
    categorySlug: "apparel",
    description: "Brushed fleece interior, double-layer hood, kangaroo pocket.",
    basePrice: 68,
    images: [UNSPLASH("photo-1556821840-3a63f95609a7")],
    tagSlugs: ["new-arrival", "best-seller"],
    variants: [
      { sku: "HD-GRY-M", name: "Heather grey / M", attributes: { color: "Grey", size: "M" }, stock: 10 },
      { sku: "HD-GRY-L", name: "Heather grey / L", attributes: { color: "Grey", size: "L" }, stock: 14 },
      { sku: "HD-NVY-M", name: "Navy / M", attributes: { color: "Navy", size: "M" }, stock: 7 },
    ],
  },
  {
    name: "Ripple Glass Tumbler",
    slug: "ripple-glass-tumbler",
    categorySlug: "mugs",
    description: "Textured borosilicate glass. Holds 12oz hot or cold.",
    basePrice: 18,
    images: [UNSPLASH("photo-1578749552338-2fccc5b0d45f")],
    tagSlugs: ["new-arrival"],
    variants: [
      { sku: "TUMB-CLEAR", name: "Clear", attributes: { color: "Clear" }, stock: 35 },
      { sku: "TUMB-SMOKE", name: "Smoke", attributes: { color: "Smoke" }, stock: 28 },
    ],
  },
];

export async function seedCatalog(dbClient: PrismaClient = db) {
  await dbClient.orderItem.deleteMany();
  await dbClient.order.deleteMany();
  await dbClient.review.deleteMany();
  await dbClient.productTag.deleteMany();
  await dbClient.productVariant.deleteMany();
  await dbClient.product.deleteMany();
  await dbClient.tag.deleteMany();
  await dbClient.category.deleteMany();

  await dbClient.coupon.upsert({
    where: { code: "WELCOME10" },
    create: {
      code: "WELCOME10",
      description: "10% off your order",
      discountType: "PERCENT",
      discountValue: 10,
      isActive: true,
    },
    update: {
      description: "10% off your order",
      discountType: "PERCENT",
      discountValue: 10,
      isActive: true,
    },
  });

  await ensureAdminUser(dbClient);
  await ensureDemoUser(dbClient);

  for (const tag of TAGS) {
    await dbClient.tag.create({ data: tag });
  }

  const categoryIdBySlug = new Map<string, string>();
  for (const cat of CATEGORIES.filter((c) => !c.parentSlug)) {
    const row = await dbClient.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    categoryIdBySlug.set(cat.slug, row.id);
  }
  for (const cat of CATEGORIES.filter((c) => c.parentSlug)) {
    const parentId = categoryIdBySlug.get(cat.parentSlug!);
    if (!parentId) continue;
    const row = await dbClient.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId,
      },
    });
    categoryIdBySlug.set(cat.slug, row.id);
  }

  for (const item of PRODUCTS) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${item.categorySlug}`);
    }

    await dbClient.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        categoryId,
        description: item.description,
        basePrice: item.basePrice,
        images: item.images,
        isPublished: true,
        variants: {
          create: item.variants.map((v) => {
            const unitPrice = v.price ?? item.basePrice;
            return {
              sku: v.sku,
              name: v.name,
              attributes: v.attributes,
              stock: v.stock,
              ...(v.price != null ? { price: v.price } : {}),
              compareAtPrice: v.compareAtPrice ?? saleCompareAt(unitPrice),
            };
          }),
        },
        tags: {
          create: item.tagSlugs.map((slug) => ({
            tag: { connect: { slug } },
          })),
        },
      },
    });
  }

  return {
    tags: TAGS.length,
    categories: CATEGORIES.length,
    products: PRODUCTS.length,
  };
}

async function ensureAdminUser(dbClient: PrismaClient) {
  const { hash } = await import("bcryptjs");
  const email = "admin@wrapitup.local";
  const passwordHash = await hash("Admin12345", 12);
  return dbClient.user.upsert({
    where: { email },
    create: {
      email,
      name: "Store Admin",
      role: "ADMIN",
      passwordHash,
    },
    update: {
      role: "ADMIN",
      passwordHash,
      name: "Store Admin",
    },
  });
}

async function ensureDemoUser(dbClient: PrismaClient) {
  const email = "demo@wrapitup.local";
  const existing = await dbClient.user.findUnique({ where: { email } });
  if (existing) return existing;
  return dbClient.user.create({
    data: {
      email,
      name: "Demo Shopper",
      role: "CUSTOMER",
    },
  });
}

async function main() {
  const result = await seedCatalog();
  console.info("Catalog seed complete:", result);
}

if (process.argv[1]?.includes("seed.ts")) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}
