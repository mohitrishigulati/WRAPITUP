#!/usr/bin/env node
/**
 * Map every file in ./images to catalog products (even chunks) and storefront picks.
 * Run after catalog-products.json exists:
 *   node scripts/attach-local-images.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = join(root, "images");
const catalogPath = join(root, "prisma", "data", "catalog-products.json");
const outPath = join(root, "prisma", "data", "product-images.json");
const storefrontPath = join(root, "prisma", "data", "storefront-images.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function hashKey(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickFile(files, key) {
  return files[hashKey(key) % files.length];
}

if (!existsSync(imagesDir)) {
  console.error(`Missing ${imagesDir}`);
  process.exit(1);
}
if (!existsSync(catalogPath)) {
  console.error(`Missing ${catalogPath} — run npm run catalog:build-products first.`);
  process.exit(1);
}

console.log("Scanning images…");
const files = readdirSync(imagesDir)
  .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
  .sort();

console.log(`Found ${files.length} image files.`);

const { products } = JSON.parse(readFileSync(catalogPath, "utf8"));
if (!products?.length) {
  console.error("No products in catalog-products.json");
  process.exit(1);
}

const perProduct = Math.max(1, Math.ceil(files.length / products.length));
const bySlug = {};
let fileIndex = 0;

for (let i = 0; i < products.length; i++) {
  const slug = products[i].slug;
  const chunk = [];
  for (let j = 0; j < perProduct && fileIndex < files.length; j++) {
    chunk.push(files[fileIndex++]);
  }
  bySlug[slug] = chunk;
}
while (fileIndex < files.length) {
  const last = products[products.length - 1].slug;
  bySlug[last].push(files[fileIndex++]);
}

const maxImagesPerProduct = 12;
for (const slug of Object.keys(bySlug)) {
  if (bySlug[slug].length > maxImagesPerProduct) {
    bySlug[slug] = bySlug[slug].slice(0, maxImagesPerProduct);
  }
}

mkdirSync(join(root, "prisma", "data"), { recursive: true });

writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      imageCount: files.length,
      productCount: products.length,
      imagesPerProduct: perProduct,
      publicBase: "/catalog",
      bySlug,
    },
    null,
    2,
  ),
);

const shopTileKeys = [
  "/collections/return-gifts",
  "/collections/personalization-picks",
  "/categories/stationery-school",
  "/collections/trending",
  "/categories/led-lamps",
  "/categories/mini-fans",
  "/categories/lunch-boxes",
  "/categories/keychains-luggage-tags",
  "/categories/pouches-pencil-cases",
  "/categories/school-bags",
  "/categories/highlighters-markers",
  "/categories/water-bottles-sippers",
  "/categories/handbags-tote-bags",
  "/categories/birthday-gift-hampers",
  "/categories/kids-gadgets",
];

const shopTiles = {};
for (const href of shopTileKeys) {
  shopTiles[href] = `/catalog/${pickFile(files, href)}`;
}

writeFileSync(
  storefrontPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      hero: `/catalog/${pickFile(files, "hero")}`,
      promo: `/catalog/${pickFile(files, "promo-summer")}`,
      shopTiles,
    },
    null,
    2,
  ),
);

console.log(`Wrote ${outPath}`);
console.log(`Wrote ${storefrontPath}`);
console.log(`Each product gets up to ${maxImagesPerProduct} of ~${perProduct} mapped images.`);
