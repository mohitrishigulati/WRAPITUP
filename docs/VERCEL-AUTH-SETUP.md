# Vercel auth & Google OAuth setup

Fixes the JSON error at `/api/auth/callback/google`:

```json
{"message":"There was a problem with the server configuration..."}
```

That almost always means **missing or wrong environment variables on Vercel**, or **database not migrated** (OAuth needs Prisma to create/link `User` + `Account`).

## 1. Vercel environment variables (Production)

**Project → Settings → Environment Variables**

| Variable | Example / notes |
|----------|-----------------|
| `AUTH_SECRET` | `openssl rand -base64 32` — **required** |
| `AUTH_URL` | `https://wrapitup-two.vercel.app` (no trailing slash) |
| `NEXTAUTH_URL` | Same as `AUTH_URL` |
| `DATABASE_URL` | Neon/Supabase Postgres connection string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

Redeploy after saving (Deployments → … → Redeploy).

## 2. Google Cloud Console

**APIs & Services → Credentials → OAuth 2.0 Client**

**Authorized JavaScript origins**

- `https://wrapitup-two.vercel.app`

**Authorized redirect URIs** (must match exactly)

- `https://wrapitup-two.vercel.app/api/auth/callback/google`

If you add a custom domain later, add those URLs too.

## 3. Database schema

OAuth uses the Prisma adapter; tables must exist in the **same** DB as `DATABASE_URL`:

```bash
DATABASE_URL="your-production-url" npx prisma db push
```

Or commit migrations and run `prisma migrate deploy` in CI/build.

## 4. Verify

1. Open `https://wrapitup-two.vercel.app/login` — Google button only shows if Google env vars are set.
2. Sign in with Google again.
3. If it still fails, **Vercel → Deployments → Functions → Logs** and search for `[auth]`.

## 5. Email/password (no Google)

Works with only `AUTH_SECRET` + `DATABASE_URL` if users exist in the DB (e.g. after seed). Google is optional.
