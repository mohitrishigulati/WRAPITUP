import "server-only";

export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function getAuthBaseUrl(): string {
  const explicit =
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/** Surfaces misconfiguration in Vercel function logs (not during `next build`). */
export function logAuthEnvDiagnostics() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.NODE_ENV !== "production") return;

  if (!getAuthSecret()) {
    console.error(
      "[auth] Missing AUTH_SECRET (or NEXTAUTH_SECRET). Google/credentials sign-in will fail.",
    );
  }
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[auth] Missing DATABASE_URL. OAuth account linking will fail.");
  }
  if (!isGoogleOAuthConfigured()) {
    console.warn("[auth] Google OAuth env vars not set; Google sign-in disabled.");
  } else if (!process.env.AUTH_URL?.trim() && !process.env.NEXTAUTH_URL?.trim()) {
    console.warn(
      "[auth] Set AUTH_URL to your production URL (e.g. https://wrapitup-two.vercel.app) for reliable OAuth redirects.",
    );
  }
}
