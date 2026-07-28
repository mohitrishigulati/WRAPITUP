import "server-only";

import { isDatabaseReachable } from "@/lib/db/connectivity";

export type DatabaseConfigStatus = {
  configured: boolean;
  reachable: boolean;
  looksLikeLocalDevUrl: boolean;
  hint: string | null;
};

function looksLikeLocalDevDatabaseUrl(dbUrl: string): boolean {
  return (
    dbUrl.includes("localhost") ||
    dbUrl.includes("127.0.0.1") ||
    dbUrl.startsWith("prisma+postgres://")
  );
}

export async function getDatabaseConfigStatus(): Promise<DatabaseConfigStatus> {
  const dbUrl = process.env.DATABASE_URL?.trim() ?? "";
  const configured = Boolean(dbUrl);
  const looksLikeLocalDevUrl = configured && looksLikeLocalDevDatabaseUrl(dbUrl);
  const reachable = configured ? await isDatabaseReachable() : false;

  let hint: string | null = null;
  if (!configured) {
    hint = "Set DATABASE_URL to a hosted Postgres URL on Vercel (Neon, Supabase, or Vercel Postgres).";
  } else if (looksLikeLocalDevUrl) {
    hint =
      "DATABASE_URL still points at localhost or Prisma Dev. Replace it in Vercel → Settings → Environment Variables with a Neon/Supabase connection string, then seed production (see docs/PRODUCTION-DATABASE.md).";
  } else if (!reachable) {
    hint =
      "DATABASE_URL is set but the server cannot connect. Check credentials, ?sslmode=require, run npx prisma db push and npm run catalog:seed against that database, then redeploy.";
  }

  return { configured, reachable, looksLikeLocalDevUrl, hint };
}
