# Local catalog images (`E:\wrapitup\images`)

~27k product/media files live in **`/images`** (not committed to git). The app serves them at **`/catalog/<filename>`**.

## One-time setup

```powershell
npm run catalog:images
```

This:

1. Junctions `public/catalog` → `images` (`scripts/link-catalog-images.mjs`)
2. Builds `prisma/data/product-images.json` (maps each of 205 SKUs to up to 12 local files) and `prisma/data/storefront-images.json` (hero, promo, shop tiles)

Then re-seed:

```powershell
npm run catalog:seed
npm run dev
```

## Production (Vercel)

Vercel builds **do not** include the `images` folder. Options:

- Upload assets to **S3** (existing admin upload / `S3_PUBLIC_URL`) and re-point URLs, or
- Run seed against Neon from a machine that has `images` + junction, then sync files to CDN.

Commit **`product-images.json`** and **`storefront-images.json`** so seeds use `/catalog/...` paths wherever those files exist at runtime.

## Regenerate mapping

After changing `catalog-products.json`:

```powershell
npm run catalog:attach-images
npm run catalog:seed
```
