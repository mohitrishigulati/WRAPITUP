import { NextResponse } from "next/server";
import { getAuthSecret, isGoogleOAuthConfigured } from "@/lib/auth/env";
import { getDatabaseConfigStatus } from "@/lib/db/database-status";

export const runtime = "nodejs";

/** Safe config probe for production debugging (no secret values). */
export async function GET() {
  const database = await getDatabaseConfigStatus();
  const hasAuthSecret = Boolean(getAuthSecret());
  const hasAuthUrl = Boolean(
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim(),
  );
  const google = isGoogleOAuthConfigured();

  const ok = hasAuthSecret && database.reachable;

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
        configured: database.configured,
        reachable: database.reachable,
        looksLikeLocalDevUrl: database.looksLikeLocalDevUrl,
      },
      hint: !hasAuthSecret
        ? "Set AUTH_SECRET on Vercel and redeploy."
        : database.hint
          ? database.hint
          : !google
            ? "Google OAuth optional; set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
            : !hasAuthUrl
              ? "Set AUTH_URL to https://wrapitup-two.vercel.app."
              : null,
    },
    { status: ok ? 200 : 503 },
  );
}
