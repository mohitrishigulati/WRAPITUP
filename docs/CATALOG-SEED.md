# Catalog seed

Creates the WrapItUp demo catalog from `prisma/seed.catalog.ts`: **8 parent categories**, **26 leaf categories**, **7 themes**, **11 tags**, **4 homepage collections**, **24 published products**, coupon `WELCOME10`, admin + demo users.

Taxonomy reference: [WRAPITUP-CATEGORY-TAXONOMY.md](./WRAPITUP-CATEGORY-TAXONOMY.md).

## Local (Prisma Dev)

```bash
npx prisma dev -d          # if not already running
npx prisma db push
npm run catalog:seed       # catalog + users + coupon
# or catalog only:
npm run catalog:seed:only  # npx tsx prisma/seed.catalog.ts
npm run dev
```

Browse: [http://localhost:3000/products](http://localhost:3000/products)

## Production (Vercel / Neon / Supabase)

`DATABASE_URL` must be a **hosted** Postgres URL (not `localhost` or `prisma+postgres://`).

```bash
node scripts/setup-production-catalog.mjs "postgresql://..."
```

Or manually:

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run catalog:seed
```

Then update `DATABASE_URL` on Vercel to the same URL and redeploy.

## Accounts created

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@wrapitup.local` | `Admin12345` |
| Customer (demo) | `demo@wrapitup.local` | — (OAuth or sign up) |

## What gets reset

`catalog:seed` **clears** cart lines, orders, reviews, collections, themes, products, tags, and categories, then recreates catalog data. **Users and coupons are upserted** (not deleted).

## Product images

Sample products use [placehold.co](https://placehold.co) URLs until real photos are uploaded.

## Nav filter tags

Gender/age mega-menu filters use: `gender-boys`, `gender-girls`, `gender-unisex`, `age-0-3`, `age-3-6`, `age-6-9`, `age-9-plus` (see `lib/store/storefront-config.ts`).
