import { NextResponse } from "next/server";
import { getAuthSecret, isGoogleOAuthConfigured } from "@/lib/auth/env";
import { isDatabaseReachable } from "@/lib/db/connectivity";

export const runtime = "nodejs";

/** Safe config probe for production debugging (no secret values). */
export async function GET() {
  const hasDatabaseEnv = Boolean(process.env.DATABASE_URL?.trim());
  const databaseReachable = hasDatabaseEnv ? await isDatabaseReachable() : false;
  const hasAuthSecret = Boolean(getAuthSecret());
  const hasAuthUrl = Boolean(
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim(),
  );
  const google = isGoogleOAuthConfigured();

  const ok = hasAuthSecret && databaseReachable;

  const dbUrl = process.env.DATABASE_URL ?? "";
  const looksLocal =
    hasDatabaseEnv &&
    (dbUrl.includes("localhost") ||
      dbUrl.includes("127.0.0.1") ||
      dbUrl.startsWith("prisma+postgres://"));

  return NextResponse.json(
    {
      ok,
      auth: {
        hasAuthSecret,
        hasAuthUrl,
        googleOAuthConfigured: google,
        vercelUrl: process.env.VERCEL_URL ?? null,
        suggestedAuthUrl: process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : null,
      },
      database: {
        configured: hasDatabaseEnv,
        reachable: databaseReachable,
        looksLikeLocalDevUrl: looksLocal,
      },
      hint: !hasAuthSecret
        ? "Set AUTH_SECRET on Vercel and redeploy."
        : !hasDatabaseEnv
          ? "Set DATABASE_URL to a hosted Postgres URL on Vercel."
          : looksLocal
            ? "DATABASE_URL points at localhost/Prisma Dev. Replace with Neon, Supabase, or Vercel Postgres."
            : !databaseReachable
              ? "DATABASE_URL is set but connection failed. Check credentials, SSL, and run prisma db push."
              : !google
                ? "Google OAuth optional; set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
                : !hasAuthUrl
                  ? "Set AUTH_URL to https://wrapitup-two.vercel.app."
                  : null,
    },
    { status: ok ? 200 : 503 },
  );
}
