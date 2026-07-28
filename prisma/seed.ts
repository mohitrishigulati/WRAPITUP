import { PrismaClient } from "@prisma/client";
import { seedCatalog } from "./seed.catalog";

const db = new PrismaClient();

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

async function seedUsersAndCoupon(dbClient: PrismaClient) {
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
}

export { seedCatalog, clearCatalog } from "./seed.catalog";

async function main() {
  const catalog = await seedCatalog(db);
  await seedUsersAndCoupon(db);
  console.info("Seed complete:", catalog);
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
