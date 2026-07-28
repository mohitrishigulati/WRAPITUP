#!/usr/bin/env node
/**
 * Push variables from .env to Vercel Production (run locally once).
 * Usage: node scripts/sync-env-to-vercel.mjs
 * Requires: vercel CLI logged in, .env in project root
 */
import { readFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

if (!existsSync(envPath)) {
  console.error("No .env file found. Create one from .env.example first.");
  process.exit(1);
}

const raw = readFileSync(envPath, "utf8");
const vars = {};
for (const line of raw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  vars[key] = val;
}

const productionUrl = "https://wrapitup-two.vercel.app";

const toPush = {
  DATABASE_URL: vars.DATABASE_URL,
  AUTH_SECRET: vars.AUTH_SECRET || randomBytes(32).toString("base64"),
  AUTH_URL: vars.AUTH_URL || productionUrl,
  NEXTAUTH_URL: vars.NEXTAUTH_URL || vars.AUTH_URL || productionUrl,
  GOOGLE_CLIENT_ID: vars.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: vars.GOOGLE_CLIENT_SECRET,
  STRIPE_SECRET_KEY: vars.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: vars.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: vars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  RESEND_API_KEY: vars.RESEND_API_KEY,
  EMAIL_FROM: vars.EMAIL_FROM,
  S3_BUCKET: vars.S3_BUCKET,
  S3_ACCESS_KEY_ID: vars.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: vars.S3_SECRET_ACCESS_KEY,
  S3_PUBLIC_URL: vars.S3_PUBLIC_URL,
  S3_ENDPOINT: vars.S3_ENDPOINT,
  S3_REGION: vars.S3_REGION,
};

function addEnv(name, value) {
  if (!value) {
    console.log(`skip ${name} (empty)`);
    return;
  }
  for (const target of ["production", "preview", "development"]) {
    const result = spawnSync("npx", ["vercel", "env", "add", name, target, "--force"], {
      input: value,
      encoding: "utf8",
      cwd: root,
      shell: true,
    });
    if (result.status !== 0) {
      console.error(`failed ${name} (${target}):`, result.stderr || result.stdout);
    } else {
      console.log(`ok ${name} → ${target}`);
    }
  }
}

console.log("Syncing .env → Vercel Production for wrapitup...\n");
for (const [key, value] of Object.entries(toPush)) {
  addEnv(key, value);
}
console.log("\nDone. Redeploy on Vercel (Deployments → Redeploy), then run:");
console.log("  DATABASE_URL=... npx prisma db push");
