# WrapItUp — Complete Project Documentation

Full reference for the WrapItUp e-commerce application: architecture, features, security, operations, and verification checklists.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma 6 · PostgreSQL · Auth.js (NextAuth v5) · Stripe · Resend (+ optional SMTP)

**Payments:** Stripe only (Payment Intents + webhook). Razorpay is not integrated.

> ### Before you go live (especially on Vercel)
>
> Set **S3/R2 env vars** so uploads are durable across instances ([Object storage](#object-storage-s3--r2)). Remaining gaps: **Upstash rate limits**, **tax/GST**, CSP hardening — see [§20](#20-production-gaps--remediation).

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Environment variables](#2-environment-variables)
3. [Project structure](#3-project-structure)
4. [Database schema overview](#4-database-schema-overview)
5. [Feature phases (1–6)](#5-feature-phases-16)
6. [Authentication & authorization](#6-authentication--authorization)
7. [Catalog & SEO](#7-catalog--seo)
8. [Cart & checkout](#8-cart--checkout)
9. [Account area](#9-account-area)
10. [Admin panel](#10-admin-panel)
11. [Reviews (verified purchase)](#11-reviews-verified-purchase)
12. [Transactional email](#12-transactional-email)
13. [HTTP API routes](#13-http-api-routes)
14. [Server actions](#14-server-actions)
15. [Security model](#15-security-model)
16. [Security audit fixes (Phase 6 hardening)](#16-security-audit-fixes-phase-6-hardening)
17. [Production checklist](#17-production-checklist)
18. [Testing](#18-testing)
19. [Scripts reference](#19-scripts-reference)
20. [Production gaps & remediation](#20-production-gaps--remediation)
21. [Quick gap summary](#21-quick-gap-summary)

---

## 1. Quick start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (test keys for local dev)
- Optional: Resend (order/shipping/reset emails), Google OAuth credentials

### Setup

```bash
cp .env.example .env
# Edit .env: DATABASE_URL, AUTH_SECRET, AUTH_URL, Stripe keys, etc.

npm install
npm run db:migrate    # or: npx prisma db push
npm run db:seed       # catalog tags/products + admin user

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default admin (from seed)

| Field    | Value                    |
|----------|--------------------------|
| Email    | `admin@wrapitup.local`   |
| Password | `Admin12345`             |

Change these before any shared or production deployment.

---

## 2. Environment variables

Copy from `.env.example`. **Never commit `.env`.**

| Variable | Scope | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `AUTH_SECRET` | Server | JWT/session signing (`openssl rand -base64 32`) |
| `AUTH_URL` | Server | Public site URL, no trailing slash (canonical, sitemap, emails) |
| `NEXTAUTH_URL` | Server | Legacy alias for Auth.js URL |
| `GOOGLE_CLIENT_ID` | Server | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Server | Google OAuth |
| `STRIPE_SECRET_KEY` | Server | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Server | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Client-safe** | Stripe.js / Elements |
| `SHIPPING_FLAT_RATE` | Server | USD flat shipping (default `5.99`) |
| `SHIPPING_FREE_THRESHOLD` | Server | Free shipping subtotal threshold (default `75`) |
| `RESEND_API_KEY` | Server | Transactional email via Resend |
| `EMAIL_FROM` | Server | From address (must be verified in Resend) |
| `SMTP_*` | Server | Optional SMTP fallback |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | Server | **Production uploads** (S3/R2). See [Object storage](#object-storage-s3--r2) |
| `S3_REGION` | Server | Default `auto` (R2-friendly) |
| `S3_ENDPOINT` | Server | Custom endpoint (required for Cloudflare R2) |
| `NODE_ENV` | Both | `development` / `production` |

### Object storage (S3 / R2)

When **`S3_BUCKET`**, **`S3_ACCESS_KEY_ID`**, **`S3_SECRET_ACCESS_KEY`**, and **`S3_PUBLIC_URL`** are all set, uploads use **S3-compatible object storage** instead of `public/uploads/`.

| Variable | Purpose |
|----------|---------|
| `S3_BUCKET` | Bucket name |
| `S3_PUBLIC_URL` | Public CDN/base URL (no trailing slash). Stored URLs look like `{S3_PUBLIC_URL}/reviews/...` or `.../products/...` |
| `S3_ENDPOINT` | For **Cloudflare R2**: `https://<account_id>.r2.cloudflarestorage.com` |
| `S3_REGION` | Use `auto` for R2; AWS region code for S3 |

**Local dev:** leave S3 vars empty → files go to `public/uploads/` (same as before).

**Implementation:** `lib/uploads/persist-image.ts`, `lib/uploads/storage-config.ts`; routes call `persistUploadedImage()`.

**R2 checklist:**

1. Create bucket + API token (Object Read & Write).
2. Enable public access via R2 custom domain or `r2.dev` subdomain → set `S3_PUBLIC_URL`.
3. Set `S3_ENDPOINT` to your account endpoint.
4. Add the same env vars on Vercel.
5. Ensure bucket allows public read for `products/*` and `reviews/*` (or serve via CDN in front).

`next.config.mjs` adds a `remotePatterns` entry from `S3_PUBLIC_URL` at build time for `next/image`.

**Client bundle rule:** Only `NEXT_PUBLIC_*` variables are exposed to the browser. All Stripe secrets, webhook secrets, DB, and mail credentials stay server-only.

---

## 3. Project structure

```
wrapitup/
├── app/
│   ├── layout.tsx              # Root layout, metadataBase, cart/auth providers
│   ├── page.tsx                # Home
│   ├── sitemap.ts              # Dynamic sitemap.xml
│   ├── robots.ts               # robots.txt
│   ├── (auth)/                 # login, signup, forgot/reset password
│   ├── (shop)/                 # products, categories, cart, checkout, account
│   ├── admin/                  # Admin UI (role-gated)
│   └── api/                    # REST routes (cart, checkout, webhooks, admin, reviews)
├── actions/                    # Server Actions (auth, profile, reviews, admin, wishlist)
├── components/                 # UI (catalog, cart, checkout, account, admin, reviews)
├── emails/                     # Email HTML/text templates
├── lib/                        # Domain logic (auth, catalog, checkout, mail, security)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/uploads/             # Local uploads (gitignored): products/, reviews/
├── tests/                      # Node test runner suites
├── middleware.ts               # Admin route protection
├── next.config.mjs             # Images + security headers (CSP, etc.)
└── docs/
    └── WRAPITUP-COMPLETE.md    # This file
```

### Key libraries (`lib/`)

| Path | Role |
|------|------|
| `lib/auth.ts` | Auth.js config (credentials + Google), JWT role |
| `lib/auth/require-user.ts` | Redirect if unauthenticated |
| `lib/auth/require-admin.ts` | Admin API/page guard |
| `lib/auth/admin-access.ts` | Middleware role evaluation |
| `lib/db.ts` | Prisma singleton |
| `lib/catalog/products.ts` | Product listing SQL, detail, related, ratings |
| `lib/checkout/pricing.ts` | Server-side cart pricing, stock, coupons |
| `lib/checkout/checkout.ts` | PaymentIntent + pending checkout + order fulfillment |
| `lib/checkout/shipping.ts` | Flat rate + free threshold |
| `lib/reviews/queries.ts` | Eligibility, list reviews (sanitized) |
| `lib/sanitize.ts` | Review/text HTML stripping |
| `lib/uploads/safe-image.ts` | Magic-byte validation, review photo URL rules |
| `lib/uploads/persist-image.ts` | Local disk or S3 put |
| `lib/uploads/storage-config.ts` | S3 env detection, public URL helpers |
| `lib/rate-limit.ts` | In-memory rate limiting |
| `lib/mail-order.ts` | Order confirmation (Resend) |
| `lib/mail-shipping.ts` | Shipped notification (Resend) |
| `lib/mail-transactional.ts` | Resend → SMTP → dev log |
| `lib/mail.ts` | Password reset wrapper |
| `lib/seo/site-url.ts` | Canonical base URL |

---

## 4. Database schema overview

**Provider:** PostgreSQL via Prisma 6.

### Core entities

- **User** — `CUSTOMER` | `ADMIN`, optional `passwordHash`, OAuth via **Account**
- **Category** — hierarchical (`parentId`)
- **Product** — `slug`, `images[]`, `basePrice`, `isPublished`
- **ProductVariant** — SKU, stock, optional variant `price`
- **Tag** / **ProductTag** — product tagging
- **Cart** / **CartItem** — logged-in cart persistence
- **CheckoutPending** — JSON payload + `amountCents` until Stripe webhook fulfills
- **Order** / **OrderItem** — optional `userId`, guest email, Stripe PI id, statuses
- **Address** — optional `userId` (guest checkout addresses on orders)
- **Coupon** — percent/fixed, redemption limits
- **WishlistItem** — one row per user+product
- **Review** — **requires `orderId`** (verified purchase), `@@unique([userId, productId])`

### Order statuses

`PENDING` → `PAID` → `PROCESSING` → `SHIPPED` → `DELIVERED` (and `CANCELLED`, `REFUNDED`)

**Review eligibility:** only orders in **`DELIVERED`** status where the order line items include the product.

### Migrations

```bash
npm run db:migrate
npx prisma generate   # also runs on postinstall / build
npm run db:studio     # optional GUI
```

If you changed the Review model (required `orderId`, `photoUrl`), apply migrations before using reviews in production.

---

## 5. Feature phases (1–6)

### Phase 1 — Foundation

- App Router layout, Tailwind, TypeScript paths
- Prisma schema + PostgreSQL
- Auth.js: email/password (bcrypt), Google OAuth
- Auth pages under `app/(auth)/`
- `lib/db.ts`, `lib/auth.ts`, `.env.example`

### Phase 2 — Catalog

- Routes: `/products`, `/categories/[slug]`, `/products/[slug]`
- SQL-backed listing: pagination, filters, search, sort (`lib/catalog/products.ts`)
- `generateMetadata` on product and category pages
- **Tag** / **ProductTag** models

### Phase 3 — Cart & checkout

- Guest cart: `localStorage` key `wrapitup-cart-v1`
- Logged-in cart: **Cart** / **CartItem** in DB
- **CheckoutPending** — orders created only after Stripe webhook `payment_intent.succeeded`
- Server pricing: `lib/checkout/pricing.ts`
- Shipping: `SHIPPING_FLAT_RATE` + `SHIPPING_FREE_THRESHOLD`
- Order confirmation email via Resend (`lib/mail-order.ts`)

### Phase 4 — Account

- `/account/profile`, `/account/orders`, `/account/orders/[id]`, `/account/wishlist`
- Owner-scoped orders (`lib/account/order-access.ts`)
- **WishlistItem** model
- `npm run test:account`

### Phase 5 — Admin

- `middleware.ts`: JWT `role === ADMIN` for `/admin` and `/api/admin/*`
- Products CRUD + image upload to `public/uploads/products`
- Orders: status updates, tracking number; shipping email on **SHIPPED**
- Customers list, coupons CRUD, analytics dashboard (Recharts)
- Seed admin user
- `npm run test:admin`

### Phase 6 — Reviews, email polish, SEO, security

- Verified-purchase reviews (DELIVERED orders)
- Star rating + required text + optional photo
- XSS-safe review text (`sanitize-html`)
- Average rating on product cards and detail (existing catalog aggregates)
- `app/sitemap.ts`, `app/robots.ts`, root `metadataBase` + page metadata
- Security headers in `next.config.mjs`
- Auth rate limits, review upload hardening, checkout fulfillment amount re-check
- See [§11](#11-reviews-verified-purchase) and [§15–16](#15-security-model)

---

## 6. Authentication & authorization

### Session model

- Auth.js v5 with **JWT** in httpOnly cookies (see `lib/auth.ts`)
- JWT callback includes **`role`** for admin checks

### Customer routes

- Account pages use `requireUser()` → redirect to `/login?callbackUrl=...`
- `loginAction` validates email with Zod; `callbackUrl` must be same-origin path (no `//`, no `\`)

### Admin routes

| Path pattern | Unauthenticated | Customer | Admin |
|--------------|-----------------|----------|-------|
| `/admin/*` | Redirect login | Redirect `/?admin=forbidden` | Allow |
| `/api/admin/*` | 403 JSON | 403 JSON | Allow |

Implemented in `middleware.ts` + `lib/auth/admin-access.ts`.

### Auth rate limits (per IP, 15 minutes)

| Action | Limit |
|--------|-------|
| Signup | 5 |
| Login | 10 |
| Forgot password | 5 |
| Reset password | 5 |

Implementation: `actions/auth.ts` + `lib/rate-limit.ts` + `lib/request-ip.ts`.

---

## 7. Catalog & SEO

### Public routes

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/products` | Full catalog + filters/search/sort |
| `/categories/[slug]` | Category listing (includes descendants) |
| `/products/[slug]` | PDP, gallery, purchase, reviews |

### Metadata

- **Root** (`app/layout.tsx`): `metadataBase` from `AUTH_URL`, title template `%s | WrapItUp`, Open Graph defaults
- **Product**: title, description, canonical, OG URL/image
- **Category**: dynamic title + description
- **Private flows** (cart, checkout, account, auth): `robots: { index: false }`

### Sitemap & robots

- **`/sitemap.xml`** — home, `/products`, all categories, published products (`app/sitemap.ts`)
- **`/robots.txt`** — allow `/`; disallow `/admin`, `/account`, `/api/`, `/checkout`, `/cart`, `/login`, `/signup`; sitemap URL (`app/robots.ts`)

Set **`AUTH_URL`** in production so canonical and sitemap URLs are correct.

---

## 8. Cart & checkout

### Cart behavior

| User | Storage |
|------|---------|
| Guest | `localStorage` (`wrapitup-cart-v1`) |
| Logged in | DB cart; merge on login via `/api/cart` |

### Pricing rule (critical)

**All monetary totals are computed on the server** from variant IDs and quantities in `priceCartLines()`. Client sends lines `{ variantId, quantity }` only — never unit prices.

Flow:

1. Client POST `/api/cart/quote` or checkout with lines + optional coupon
2. Server loads variants from DB, checks stock, applies coupon + shipping
3. POST `/api/checkout/create-payment-intent` creates Stripe PaymentIntent for **server `amountCents`**
4. **CheckoutPending** stores payload + `amountCents`
5. Stripe webhook `payment_intent.succeeded` → `fulfillPaidOrder()`:
   - Verifies Stripe signature
   - Re-prices cart from pending payload
   - Ensures `intent.amount === pending.amountCents`
   - Ensures **repriced total === pending.amountCents** (prevents price drift)
   - Decrements stock, creates order, sends confirmation email

### Guest checkout

Requires `guestEmail` on checkout payload when no session.

### Confirmation page

Polls `GET /api/orders/status?payment_intent=pi_...` until order exists. Guest access uses high-entropy Payment Intent id as capability; logged-in orders require matching session.

### Rate limits

| Endpoint | Limit |
|----------|-------|
| `/api/cart/quote` | 120 / minute / IP |
| `/api/checkout/create-payment-intent` | 30 / 15 min / IP |
| `/api/orders/status` | 60 / minute / IP |

---

## 9. Account area

| Route | Features |
|-------|----------|
| `/account/profile` | Name, email, saved addresses |
| `/account/orders` | Order history |
| `/account/orders/[id]` | Detail; 404 if not owner (no ID enumeration) |
| `/account/wishlist` | Saved products |

Server actions: `actions/profile.ts`, `actions/addresses.ts`, `actions/wishlist.ts`.

Display names sanitized on signup/profile update to reduce stored markup in names shown in reviews.

---

## 10. Admin panel

Base path: **`/admin`**

| Section | Capabilities |
|---------|----------------|
| Overview | Revenue/orders charts |
| Products | CRUD, publish flag, variants, tags, image upload |
| Orders | Status, tracking; **SHIPPED** triggers shipping email |
| Customers | User list |
| Coupons | Create/edit, discount rules |

Uploads: `POST /api/admin/upload` (admin-only, safe image validation).

---

## 11. Reviews (verified purchase)

### Business rules

1. User must be **signed in**
2. Order must be **`DELIVERED`**
3. Order must **include the product** (via order line → variant → product)
4. **One review per user per product** (`@@unique([userId, productId])`)
5. **Rating** 1–5, **body text required**, title optional, **photo optional**
6. Review stores **`orderId`** for audit trail

### UI

- Component: `components/reviews/ProductReviews.tsx` on product detail
- Shows aggregate stars + list + form when eligible
- Ineligible logged-in users see “after delivery” message

### Server action

`submitReviewAction` (`actions/reviews.ts`):

- Rate limit: 10 reviews / hour / user
- Zod validation (`lib/validators/reviews.ts`)
- Re-checks order eligibility immediately before insert
- Sanitizes title/body; rejects empty body after sanitize
- Photo URL must be **owned by user** (see uploads)
- Handles duplicate race (`P2002`)

### Photo upload

`POST /api/reviews/upload`:

- Requires session
- Rate limit: 20 uploads / hour / user
- Max 3MB
- **Magic-byte** validation; blocks SVG; allowlisted extensions (jpg, png, webp, gif)
- Filename: `{userId}-{timestamp}-{random}.{ext}`
- Public URL: `/uploads/reviews/...`

Submit action verifies path with `isReviewPhotoOwnedByUser()`.

### XSS

- Store: `sanitizeReviewText()` strips all HTML (`lib/sanitize.ts`)
- Read: sanitize again when listing; author name sanitized
- Render: React text nodes only (no `dangerouslySetInnerHTML` for reviews)
- Tests: `npm run test:sanitize`

### Testing reviews locally

Seed does **not** create reviews (they need real delivered orders). To test:

1. Place order → pay (Stripe test) → admin set status to **DELIVERED**
2. Sign in as buyer → open product → submit review

---

## 12. Transactional email

| Email | Trigger | Module |
|-------|---------|--------|
| **Order confirmation** | Webhook after paid order | `lib/mail-order.ts` → Resend |
| **Shipping update** | Admin sets status **SHIPPED** | `lib/mail-shipping.ts` → Resend |
| **Password reset** | Forgot-password action | `lib/mail.ts` → `lib/mail-transactional.ts` |

### Transactional transport order

1. **Resend** (if `RESEND_API_KEY` + `EMAIL_FROM`)
2. **SMTP** (if configured)
3. **Development**: console log `[mail:dev]` / order-shipping dev logs — no throw if unset in dev

### Manual smoke tests

1. Complete test checkout with Resend configured → inbox receives confirmation
2. Admin ship order with tracking → shipping email
3. Forgot password → reset link (Resend or SMTP)

Templates live under `emails/`.

---

## 13. HTTP API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| * | `/api/auth/[...nextauth]` | — | Auth.js handlers |
| GET/POST/PUT | `/api/cart` | User for writes | Sync logged-in cart |
| POST | `/api/cart/quote` | Public | Server-priced cart quote |
| POST | `/api/checkout/create-payment-intent` | Optional | Create PI + pending checkout |
| GET | `/api/orders/status` | PI-based; user orders need session | Confirmation polling |
| POST | `/api/webhooks/stripe` | Stripe signature | Fulfill orders |
| POST | `/api/reviews/upload` | User | Review photo |
| POST | `/api/admin/upload` | Admin | Product images |
| GET | `/api/admin/ping` | Admin | Health |
| GET | `/api/admin/analytics` | Admin | Dashboard data |

Webhook (`app/api/webhooks/stripe/route.ts`):

- Requires `stripe-signature` + `STRIPE_WEBHOOK_SECRET`
- Uses `stripe.webhooks.constructEvent()`
- On `payment_intent.succeeded`: fulfill order + send confirmation email

Local Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 14. Server actions

| File | Purpose |
|------|---------|
| `actions/auth.ts` | signup, login, logout, forgot/reset password |
| `actions/profile.ts` | Update profile |
| `actions/addresses.ts` | CRUD addresses |
| `actions/wishlist.ts` | Toggle/remove wishlist |
| `actions/reviews.ts` | Submit verified review |
| `actions/admin/products.ts` | Admin product CRUD |
| `actions/admin/orders.ts` | Status, tracking, ship email |
| `actions/admin/coupons.ts` | Coupon CRUD |

All mutations should use Zod validators under `lib/validators/`.

---

## 15. Security model

### Security headers (`next.config.mjs`)

Applied to `/:path*`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera/mic/geo disabled)
- **Content-Security-Policy** — allows Stripe scripts/frames/connect; `img-src` includes https/data/blob

Note: CSP includes `'unsafe-inline'` / `'unsafe-eval'` for Next.js 14 compatibility; tighten with nonces when upgrading patterns.

### Input validation

- **Zod** on auth, checkout, profile, reviews, admin forms
- Checkout API returns generic 400 (no Zod leak to client)

### Trust boundaries

| Client sends | Server recalculates |
|--------------|---------------------|
| Cart lines (variantId, qty) | Prices, stock, coupons, shipping, tax |
| Coupon code | Discount from DB rules |
| Review photo URL | Must match user-owned upload path |
| Payment amount | Never from client; Stripe amount from server cents |

### Admin & secrets

- Admin enforced in middleware + server actions/API
- No Stripe secret, webhook secret, DB URL, or mail API keys in client bundles

### Rate limiting

In-memory (`lib/rate-limit.ts`). **Resets per server instance** — use Redis/Upstash for horizontal scale.

---

## 16. Security audit fixes (Phase 6 hardening)

Issues found in review pass and fixes applied:

| Issue | Fix |
|-------|-----|
| Review uploads trusted MIME + arbitrary extensions | Magic bytes, block SVG, allowlisted ext (`lib/uploads/safe-image.ts`) |
| Users could attach another user’s upload URL | User-prefixed filenames + ownership check on submit |
| HTML-only review body passed validation | Reject if sanitized body is empty |
| Duplicate review race | Prisma unique + `P2002` handling |
| Price change between PI create and webhook | Recompare repriced total to `pending.amountCents` in `fulfillPaidOrder` |
| `/api/orders/status` leaked orders | Logged-in orders require owner session; strip internal id; validate `pi_` format |
| Review upload abuse | 20/hour/user |
| Checkout/quote abuse | IP rate limits |
| Checkout 400 leaked validation shape | Generic error message |
| Login without email schema | `loginSchema` |
| Open redirect edge on callback | Reject `\` in callbackUrl |
| Stored markup in names | Sanitize on signup/profile/review author |
| Unsafe photo URLs in DB | Only serve paths matching strict regex on list |
| Admin product upload weak validation | Same safe-image pipeline |

---

## 17. Production checklist

### Infrastructure

- [ ] PostgreSQL provisioned; `DATABASE_URL` set
- [ ] `AUTH_SECRET` strong and unique
- [ ] `AUTH_URL` set to production domain (HTTPS)
- [ ] `npm run build` succeeds in CI
- [ ] Migrations applied (`prisma migrate deploy`)

### Stripe

- [ ] Live keys in env (secret server-only, publishable `NEXT_PUBLIC_*`)
- [ ] Webhook endpoint registered for `payment_intent.succeeded`
- [ ] `STRIPE_WEBHOOK_SECRET` matches dashboard
- [ ] Test webhook with Stripe CLI or dashboard replay

### Email

- [ ] Resend domain verified; `EMAIL_FROM` set
- [ ] Order, shipping, and reset flows tested once in staging

### Security walkthrough

- [ ] Non-admin cannot access `/admin` or `/api/admin/*`
- [ ] Rate limit triggers on repeated login (optional manual test)
- [ ] Review blocked without DELIVERED order
- [ ] Review photo rejects forged paths
- [ ] Guest confirmation URL works; another user cannot poll **logged-in** order status without session
- [ ] Response headers include CSP and X-Frame-Options on `/`
- [ ] `/robots.txt` and `/sitemap.xml` correct for production URL

### Operations

- [ ] Seed admin password changed or seed disabled in prod
- [ ] **Rate limiting:** acceptable on one instance; plan Upstash/Redis before scaling Vercel concurrency
- [ ] **Uploads:** move off `public/uploads/` before multi-instance/serverless (S3/R2/Cloudinary)
- [ ] Tax strategy defined for your jurisdiction (see [§20](#20-production-gaps--remediation))
- [ ] `public/uploads` backed or moved to object storage for multi-instance deploys

---

## 18. Testing

```bash
npm run test:account      # Order access scoping
npm run test:admin        # Admin route role matrix
npm run test:sanitize     # Review HTML stripping
npm run test:review-photo # Review photo path ownership rules
npm run lint
npm run build
```

Tests use Node’s built-in test runner via `tsx --test`.

---

## 19. Scripts reference

| Script | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Start production | `npm run start` |
| Lint | `npm run lint` |
| Migrate dev | `npm run db:migrate` |
| Prisma Studio | `npm run db:studio` |
| Seed database | `npm run db:seed` |

---

## 20. Production gaps & remediation

These are **real architectural limits**, not oversights. The codebase is honest about them; treat this section as your pre-launch risk register.

### 20.1 Rate limiting — in-memory only

**What we have:** `lib/rate-limit.ts` stores counters in a process-local `Map` (auth, reviews, checkout, cart quote, order status).

**Why it breaks at scale:** On Vercel (or any horizontal scale), each lambda/instance has **its own memory**. An attacker can spread requests across instances and **multiply effective limits**. Legitimate users may also see inconsistent throttling.

**When it’s fine:** Single long-lived Node process (`npm run start` on one VM, local dev, one Docker replica).

**Remediation (before scaling concurrency):**

| Approach | Notes |
|----------|--------|
| **Upstash Redis** + `@upstash/ratelimit` | Common on Vercel; HTTP-based, no persistent connection required |
| **Redis** (ElastiCache, Redis Cloud) | Shared store; wire `checkRateLimit()` to INCR + EXPIRE |
| **Edge middleware + KV** | Possible for coarse IP limits; auth/review limits often need user id from session |

**Touch points to refactor:** `lib/rate-limit.ts` (single adapter), callers unchanged if API stays the same.

---

### 20.2 Uploads — object storage + local fallback

**Implemented:** Dual backend via `persistUploadedImage()`.

| Mode | When | Storage |
|------|------|---------|
| **Object storage** | All of `S3_BUCKET`, keys, `S3_PUBLIC_URL` set | S3-compatible `PutObject` → keys `products/…`, `reviews/…` |
| **Local** | S3 not configured (default dev) | `public/uploads/products/`, `public/uploads/reviews/` |

Routes: `POST /api/admin/upload`, `POST /api/reviews/upload` (validation unchanged: magic bytes, size limits, user-prefixed review filenames).

**Review photo security with CDN URLs:**

- `parseReviewPhotoFilename()` accepts local paths **or** URLs whose origin matches `S3_PUBLIC_URL` and path `{base}/reviews/{filename}`.
- On submit, `isAllowedReviewPhotoSubmission()` rejects local paths when object storage is enabled (forces CDN URLs only).
- Ownership still enforced via filename prefix `{userId}-…`.

**Why this fixes Vercel:** All instances write to the same bucket; no reliance on ephemeral disk.

**You still need to:**

1. Configure bucket **public read** (or CDN) matching `S3_PUBLIC_URL`.
2. Migrate any existing `/uploads/...` URLs in the DB if moving from local to S3 mid-project.
3. Set env vars on Vercel (and rebuild so `next/image` picks up the CDN hostname).

---

### 20.3 Guest order status — capability URL, not session auth

**What we have:** `GET /api/orders/status?payment_intent=pi_...`

- **Logged-in orders:** session must match `order.userId` (403 otherwise).
- **Guest orders:** access if you know the **Stripe Payment Intent id** (returned on confirmation URL after checkout).

**Threat model:**

- PI ids are **high-entropy** (`pi_` + Stripe-generated). Not practical to brute-force.
- Anyone who has the **confirmation link** (email leak, shared screen, referrer logs) can poll **order number, total, item count** — not full PII beyond what confirmation already shows.

**This is acceptable for most DTC stores** (same class of “secret link” as many order-tracking URLs). It is **not** a hard auth boundary for guests.

**Optional hardening (if you need tighter guest privacy):**

- Issue a **signed, single-use or short-lived token** at checkout success (stored in `CheckoutPending` or cookie) and require it for status polls instead of raw `pi_`.
- Email-only lookup with order number + email (rate-limited, CAPTCHA) — worse UX, stronger privacy.

**Current mitigations already in place:** PI format validation, rate limit per IP, no internal `order.id` in JSON for guests.

---

### 20.4 CSP — `unsafe-inline` and `unsafe-eval`

**What we have:** `next.config.mjs` sets CSP including:

```text
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com
```

**Why:** Next.js 14 App Router and many client bundles still expect inline scripts or eval in dev/production unless you adopt **nonce- or hash-based CSP** end-to-end.

**Risk:** If an attacker ever injects HTML/script (stored or reflected XSS), CSP is **weaker** than a strict nonce-only policy.

**Mitigations already in place:** Review text sanitization, no review `dangerouslySetInnerHTML`, React escaping for most UI.

**Remediation (longer-term):**

- Next 15+ / experimental strict CSP docs: per-request nonces in middleware, `'strict-dynamic'` for scripts.
- Remove `'unsafe-eval'` in production if bundle audit shows it’s unused.
- Keep Stripe domains in `script-src` / `frame-src` / `connect-src`.

---

### 20.5 Tax — placeholder (not jurisdiction-ready)

**What we have:** `lib/checkout/pricing.ts` sets:

```typescript
const tax = 0;
```

Totals persist `taxTotal` on orders (always zero today). Checkout UI may show tax line as $0.

**Launch blocker depends on jurisdiction:**

| Region | Typical requirement |
|--------|---------------------|
| **India** | GST (CGST/SGST/IGST) by HSN, place of supply, GSTIN on invoices; Stripe Tax or manual rules |
| **US** | State/local sales tax nexus; Stripe Tax or Avalara/TaxJar |
| **EU/UK** | VAT by customer location; MOSS considerations |

**Remediation paths:**

1. **Stripe Tax** — enable on PaymentIntents; amount includes tax; sync with `priceCartLines` / webhook fulfillment.
2. **Manual rules** — tax table by country/state/postal prefix in DB; compute in `priceCartLines` before PI creation.
3. **Third-party API** — TaxJar/Avalara at quote + checkout time.

**Do not** trust client-sent tax amounts; always recompute server-side (same pattern as shipping/discount today).

**Related:** If you sell in India and need Razorpay + local compliance, that’s a separate integration (not in repo today).

---

### 20.6 Other follow-ups (lower urgency)

| Item | Notes |
|------|--------|
| **Reviews seed** | No demo reviews without a real `DELIVERED` order in DB |
| **Razorpay** | Not implemented; Stripe only |
| **Prisma 7** | Project on Prisma 6; upgrade is a dedicated migration |
| **In-memory rate limit + local uploads** | Combined, these define “single-server MVP” vs “Vercel at scale” |

---

## 21. Quick gap summary

| Gap | MVP OK? | Fix before Vercel scale? |
|-----|---------|---------------------------|
| In-memory rate limits | Single instance | **Yes** — Upstash/Redis |
| Local `public/uploads/` | Local dev / one VM | **Configure S3/R2 on Vercel** (code ready) |
| Guest status = PI capability | Usually yes | Optional token if paranoid |
| CSP unsafe-inline/eval | Known Next 14 tradeoff | Plan nonce CSP later |
| `tax = 0` | Dev/demo only | **Yes** if GST/VAT/sales tax applies |

---

## Appendix A — Order lifecycle (admin)

Typical happy path after Stripe payment:

`PAID` (webhook) → admin **PROCESSING** → **SHIPPED** (email) → **DELIVERED** (enables reviews)

---

## Appendix B — File index (Phase 6 additions)

| File | Purpose |
|------|---------|
| `actions/reviews.ts` | Submit review |
| `components/reviews/ProductReviews.tsx` | Review UI |
| `app/api/reviews/upload/route.ts` | Photo upload |
| `lib/reviews/queries.ts` | Eligibility + public list |
| `lib/validators/reviews.ts` | Zod schema |
| `lib/sanitize.ts` | Text sanitization |
| `lib/uploads/safe-image.ts` | Binary image validation |
| `lib/mail-transactional.ts` | Unified mail sender |
| `app/sitemap.ts` | SEO sitemap |
| `app/robots.ts` | Crawler rules |
| `lib/seo/site-url.ts` | Base URL helper |
| `tests/sanitize.test.ts` | Sanitize tests |
| `tests/review-photo.test.ts` | Photo path tests |

---

*Document version: aligns with Phase 6 completion + security hardening pass. Section 20 documents production gaps (rate limits, uploads, guest status, CSP, tax) for Vercel/scale and compliance planning.*
