# Fix “Catalog unavailable” on Vercel

Your production site shows this because **`DATABASE_URL` on Vercel is still a local Prisma Dev URL**. Vercel cannot reach your laptop.

## Fast path (≈10 minutes)

### 1. Create hosted Postgres (Neon — free)

1. Open [https://neon.tech](https://neon.tech) and sign in.
2. **New project** → name e.g. `wrapitup` → region close to your users.
3. Dashboard → **Connection details** → copy the ** pooled** connection string.  
   It should look like:
   ```text
   postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Push schema, seed catalog, update Vercel (one command)

From the project folder, paste your Neon URL:

```bash
node scripts/setup-production-catalog.mjs "postgresql://USER:PASS@ep-....neon.tech/neondb?sslmode=require"
```

This runs `prisma db push`, `catalog:seed` (10 products), and updates `DATABASE_URL` on Vercel for Production, Preview, and Development.

### 3. Redeploy

```bash
npx vercel deploy --prod
```

Or: Vercel dashboard → **Deployments** → **Redeploy** latest.

### 4. Verify

| URL | Expected |
|-----|----------|
| [ /api/health ](https://wrapitup-two.vercel.app/api/health) | `"ok": true`, `"database": { "reachable": true }` |
| [ /products ](https://wrapitup-two.vercel.app/products) | Product grid |

Admin after seed: `admin@wrapitup.local` / `Admin12345`

---

## Alternative: Vercel dashboard only

1. Neon (or Supabase) → copy **postgresql://** URL.
2. [Vercel → wrapitup → Settings → Environment Variables](https://vercel.com/mohitrishigulatis-projects/wrapitup/settings/environment-variables)
3. **Edit** `DATABASE_URL` for Production + Preview → paste hosted URL → Save.
4. Locally:
   ```bash
   set DATABASE_URL=postgresql://...
   npx prisma db push
   npm run catalog:seed
   ```
5. **Redeploy** on Vercel.

---

## Do not use on Vercel

- `localhost` / `127.0.0.1`
- `prisma+postgres://localhost:...` (Prisma Dev)

Local dev can keep Prisma Dev in `.env`; production must use a **cloud** URL.
