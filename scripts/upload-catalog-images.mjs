#!/usr/bin/env node
/**
 * Upload E:/wrapitup/images → S3/R2 under catalog/ (same filenames as local).
 * Requires S3_* env vars (see docs/WRAPITUP-COMPLETE.md).
 *
 *   node scripts/upload-catalog-images.mjs
 *   node scripts/upload-catalog-images.mjs --limit 50   # smoke test
 *
 * After upload, seed production with:
 *   set CATALOG_PUBLIC_BASE_URL=https://your-cdn.example.com/catalog
 *   node scripts/setup-production-catalog.mjs "postgresql://..."
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { config as loadEnv } from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: join(root, ".env") });

const imagesDir = join(root, "images");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : null;

const bucket = process.env.S3_BUCKET?.trim();
const accessKey = process.env.S3_ACCESS_KEY_ID?.trim();
const secret = process.env.S3_SECRET_ACCESS_KEY?.trim();
const publicBase = process.env.S3_PUBLIC_URL?.trim()?.replace(/\/$/, "");

if (!bucket || !accessKey || !secret || !publicBase) {
  console.error(`
Missing S3 env. Set in .env:
  S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL
  (optional S3_ENDPOINT, S3_REGION=auto for R2)
`);
  process.exit(1);
}

if (!existsSync(imagesDir)) {
  console.error(`Missing ${imagesDir}`);
  process.exit(1);
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function contentType(ext) {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

const region = process.env.S3_REGION?.trim() || "auto";
const endpoint = process.env.S3_ENDPOINT?.trim();
const client = new S3Client({
  region,
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  credentials: { accessKeyId: accessKey, secretAccessKey: secret },
});

const files = readdirSync(imagesDir)
  .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
  .sort();

const toUpload = limit ? files.slice(0, limit) : files;
console.log(`Uploading ${toUpload.length} files to s3://${bucket}/catalog/ …`);

let ok = 0;
let fail = 0;
for (let i = 0; i < toUpload.length; i++) {
  const name = toUpload[i];
  const key = `catalog/${name}`;
  const body = readFileSync(join(imagesDir, name));
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType(extname(name)),
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    ok++;
  } catch (e) {
    fail++;
    if (fail <= 5) console.error(`  fail ${name}:`, e.message);
  }
  if ((i + 1) % 500 === 0) console.log(`  … ${i + 1}/${toUpload.length}`);
}

console.log(`Done. ok=${ok} fail=${fail}`);
console.log(`Public base for seed: ${publicBase}/catalog`);
console.log(`
Set before production seed:
  CATALOG_PUBLIC_BASE_URL=${publicBase}/catalog
`);
