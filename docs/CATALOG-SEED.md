# Catalog seed

Creates the WrapItUp demo catalog: categories, tags, **10 published products**, variants/stock, coupon `WELCOME10`, admin + demo users.

## Local (Prisma Dev)

```bash
npx prisma dev -d          # if not already running
npx prisma db push
npm run catalog:seed
npm run dev
```

Browse: [http://localhost:3000/products](http://localhost:3000/products)

## Production (Vercel / Neon / Supabase)

`DATABASE_URL` must be a **hosted** Postgres URL (not `localhost` or `prisma+postgres://`).

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

`catalog:seed` **clears** existing products, categories, tags, orders, and reviews, then recreates catalog data. Users and coupons are upserted.

## Catalog contents

- **Categories:** Apparel, Home, Gifts & wrap (+ T-Shirts, Mugs, Candles, Gift sets)
- **Tags:** new-arrival, best-seller, eco-friendly, gift-idea, limited
- **Products:** tees, overshirt, hoodie, mugs, throw, napkins, candle, wrap, gift box, tumbler
