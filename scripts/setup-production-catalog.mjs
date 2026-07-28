#!/usr/bin/env node
/**
 * Push schema + seed catalog to a hosted Postgres, then sync DATABASE_URL to Vercel.
 *
 * Usage:
 *   node scripts/setup-production-catalog.mjs "postgresql://user:pass@host/db?sslmode=require"
 *
 * Or:
 *   set DATABASE_URL=postgresql://...
 *   node scripts/setup-production-catalog.mjs
 */
import { spawnSync } from "child_process";
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: join(root, ".env") });

const databaseUrl = process.argv[2]?.trim() || process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error(`
Missing DATABASE_URL.

1. Create free Postgres at https://neon.tech (or Supabase / Vercel Storage).
2. Copy the connection string (must start with postgresql://, include ?sslmode=require).
3. Run:

   node scripts/setup-production-catalog.mjs "postgresql://..."

Do NOT use localhost or prisma+postgres:// URLs on Vercel.
`);
  process.exit(1);
}

if (
  databaseUrl.includes("localhost") ||
  databaseUrl.includes("127.0.0.1") ||
  databaseUrl.startsWith("prisma+postgres://")
) {
  console.error("Refusing local/Prisma Dev URL. Use a hosted Postgres connection string.");
  process.exit(1);
}

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    env: { ...process.env, DATABASE_URL: databaseUrl, ...env },
    encoding: "utf8",
    shell: true,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("→ prisma db push");
run("npx", ["prisma", "db push"]);

console.log("→ catalog seed");
run("npx", ["tsx", "prisma/seed.ts"]);

console.log("→ vercel env (Production, Preview, Development)");
for (const target of ["production", "preview", "development"]) {
  const result = spawnSync("npx", ["vercel", "env", "add", "DATABASE_URL", target, "--force"], {
    cwd: root,
    input: databaseUrl,
    encoding: "utf8",
    shell: true,
  });
  if (result.status !== 0) {
    console.error(`Vercel env update failed for ${target}. Run manually in dashboard.`);
    console.error(result.stderr || result.stdout);
  } else {
    console.log(`  ok DATABASE_URL → ${target}`);
  }
}

console.log(`
Done.

1. Redeploy: npx vercel deploy --prod
2. Check: https://wrapitup-two.vercel.app/api/health  (database.reachable: true)
3. Browse: https://wrapitup-two.vercel.app/products
`);
