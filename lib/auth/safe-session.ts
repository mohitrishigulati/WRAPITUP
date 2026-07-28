import "server-only";

import { auth } from "@/lib/auth";
import { getAuthSecret } from "@/lib/auth/env";

/** Avoid crashing pages when Vercel env is not configured yet. */
export async function safeAuth() {
  if (!getAuthSecret()) {
    return null;
  }
  try {
    return await auth();
  } catch {
    return null;
  }
}

export function isRuntimeConfigured(): boolean {
  return Boolean(getAuthSecret() && process.env.DATABASE_URL?.trim());
}
