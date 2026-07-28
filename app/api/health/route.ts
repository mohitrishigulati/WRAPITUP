import { NextResponse } from "next/server";
import { getAuthSecret, isGoogleOAuthConfigured } from "@/lib/auth/env";

export const runtime = "nodejs";

/** Safe config probe for production debugging (no secret values). */
export async function GET() {
  const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
  const hasAuthSecret = Boolean(getAuthSecret());
  const hasAuthUrl = Boolean(
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim(),
  );
  const google = isGoogleOAuthConfigured();

  const ok = hasDatabase && hasAuthSecret;

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
      database: { configured: hasDatabase },
      hint: !hasAuthSecret
        ? "Set AUTH_SECRET on Vercel (Production) and redeploy."
        : !hasDatabase
          ? "Set DATABASE_URL on Vercel and run prisma db push."
          : !google
            ? "Google OAuth optional; set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
            : !hasAuthUrl
              ? "Set AUTH_URL to your production URL (e.g. https://wrapitup-two.vercel.app)."
              : null,
    },
    { status: ok ? 200 : 503 },
  );
}
