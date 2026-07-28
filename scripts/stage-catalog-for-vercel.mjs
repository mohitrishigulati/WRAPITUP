#!/usr/bin/env node
/**
 * Copy only images referenced in product-images.json + storefront-images.json
 * into public/catalog/ (real files, not junction) for Vercel deploy (~2.5k files).
 */
import { readFileSync, existsSync, mkdirSync, copyFileSync, rmSync, lstatSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = join(root, "images");
const destDir = join(root, "public", "catalog");
const productMap = join(root, "prisma", "data", "product-images.json");
const storefrontMap = join(root, "prisma", "data", "storefront-images.json");

function collectFilenames() {
  const names = new Set();
  const product = JSON.parse(readFileSync(productMap, "utf8"));
  for (const arr of Object.values(product.bySlug ?? {})) {
    for (const f of arr) names.add(f.replace(/^.*\//, ""));
  }
  const sf = JSON.parse(readFileSync(storefrontMap, "utf8"));
  for (const url of [sf.hero, sf.promo, ...Object.values(sf.shopTiles ?? {})]) {
    if (typeof url === "string" && url.includes("/catalog/")) {
      names.add(url.split("/catalog/")[1]);
    }
  }
  return [...names];
}

if (!existsSync(imagesDir)) {
  console.error(`Missing ${imagesDir}`);
  process.exit(1);
}

if (existsSync(destDir)) {
  rmSync(destDir, { recursive: true, force: true });
}

mkdirSync(destDir, { recursive: true });

const files = collectFilenames();
let copied = 0;
let missing = 0;
for (const name of files) {
  const src = join(imagesDir, name);
  const dest = join(destDir, name);
  if (!existsSync(src)) {
    missing++;
    continue;
  }
  copyFileSync(src, dest);
  copied++;
}

console.log(`Staged ${copied} files → public/catalog (${missing} missing from images/)`);
