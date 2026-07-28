import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.productTag.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.tag.deleteMany();
  await db.category.deleteMany();

  await db.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off your order",
      discountType: "PERCENT",
      discountValue: 10,
      isActive: true,
    },
  });

  const demoUser = await ensureDemoUser();
  await ensureAdminUser();

  const tags = await Promise.all(
    [
      { name: "New arrival", slug: "new-arrival" },
      { name: "Best seller", slug: "best-seller" },
      { name: "Eco-friendly", slug: "eco-friendly" },
      { name: "Gift idea", slug: "gift-idea" },
    ].map((tag) => db.tag.create({ data: tag })),
  );

  const apparel = await db.category.create({
    data: {
      name: "Apparel",
      slug: "apparel",
      description: "Everyday wear and layers.",
    },
  });

  const home = await db.category.create({
    data: {
      name: "Home",
      slug: "home",
      description: "Objects for calm spaces.",
    },
  });

  const tees = await db.category.create({
    data: {
      name: "T-Shirts",
      slug: "t-shirts",
      description: "Soft cotton tees in core colors.",
      parentId: apparel.id,
    },
  });

  const mugs = await db.category.create({
    data: {
      name: "Mugs",
      slug: "mugs",
      description: "Ceramic mugs for slow mornings.",
      parentId: home.id,
    },
  });

  const products = [
    {
      name: "Essential Cotton Tee",
      slug: "essential-cotton-tee",
      categoryId: tees.id,
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
      categoryId: apparel.id,
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
      categoryId: mugs.id,
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
      categoryId: home.id,
      description: "Merino blend throw with a tight herringbone weave.",
      basePrice: 120,
      images: [UNSPLASH("photo-1631889992176-680b89341ed4")],
      tagSlugs: ["eco-friendly", "gift-idea"],
      variants: [
        { sku: "THROW-CHAR", name: "Charcoal", attributes: { color: "Charcoal" }, stock: 8 },
        { sku: "THROW-IVR", name: "Ivory", attributes: { color: "Ivory" }, stock: 5 },
      ],
    },
  ];

  for (const item of products) {
    const product = await db.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        categoryId: item.categoryId,
        description: item.description,
        basePrice: item.basePrice,
        images: item.images,
        isPublished: true,
        variants: {
          create: item.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            attributes: v.attributes,
            stock: v.stock,
          })),
        },
        tags: {
          create: item.tagSlugs.map((slug) => ({
            tag: { connect: { slug } },
          })),
        },
      },
    });

  }

  console.info("Seed complete:", { tags: tags.length, products: products.length });
}

async function ensureAdminUser() {
  const { hash } = await import("bcryptjs");
  const email = "admin@wrapitup.local";
  const passwordHash = await hash("Admin12345", 12);
  return db.user.upsert({
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

async function ensureDemoUser() {
  const email = "demo@wrapitup.local";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;
  return db.user.create({
    data: {
      email,
      name: "Demo Shopper",
      role: "CUSTOMER",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
