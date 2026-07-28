/**
 * Builds prisma/data/catalog-products.json from uploads/www.giftoo.in-0.md
 * Run: node scripts/build-catalog-from-giftoo-md.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mdPath =
  process.argv[2] ||
  join(root, "data", "www.giftoo.in-0.md");
const altPath = join(process.env.USERPROFILE || "", ".cursor/projects/e-wrapitup/uploads/www.giftoo.in-0.md");

function loadMarkdown() {
  for (const p of [mdPath, altPath]) {
    try {
      return readFileSync(p, "utf8");
    } catch {
      /* try next */
    }
  }
  throw new Error(`Giftoo markdown not found. Pass path: node scripts/build-catalog-from-giftoo-md.mjs <path>`);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[₹|/\\?&]+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

const CATEGORY_RULES = [
  { re: /lunch box|lunch bag|bento|tiffin/i, slug: "lunch-boxes" },
  { re: /water bottle|sipper|tumbler|flask/i, slug: "water-bottles-sippers" },
  { re: /mini fan|handheld fan|desk fan|neck fan|usb fan|folding hand fan/i, slug: "mini-fans" },
  { re: /led|night light|lamp|table lamp/i, slug: "led-lamps" },
  { re: /keychain|key ring|luggage tag/i, slug: "keychains-luggage-tags" },
  { re: /school bag|backpack|preschool|daycare|toddler bag|college students/i, slug: "school-bags" },
  { re: /sling|handbag|duffle|tote bag|crossbody|waist bag|chest bag/i, slug: "sling-waist-bags" },
  { re: /pouch|pencil case|pencil pouch|file folder|organizer bag|mesh/i, slug: "pouches-pencil-cases" },
  { re: /sticker|washi/i, slug: "stickers-washi-tapes" },
  { re: /eraser|sharpener|pencil|pen |marker|highlighter|notebook|diary|folder|file|correction tape|whiteout|geometry|ruler|sticky note|glue|stationery|compass|bookmark|harmonica/i, slug: "pens-pencils" },
  { re: /eraser|sharpener|correction|whiteout/i, slug: "erasers-sharpeners" },
  { re: /puzzle|tangram|maze|fidget|brain teaser|sliding number|harmonica|wooden block/i, slug: "puzzles-brain-teasers" },
  { re: /diy|sewing|craft kit|coloring|painting|diamond crystal|scratch notebook|magnetic drawing/i, slug: "diy-craft-kits" },
  { re: /plush|soft toy|bubble gun|musical piano|guitar|camera|walkie|microscope|gadget|earphone|phone toy/i, slug: "kids-gadgets" },
  { re: /educational|flash card|habit tracker|montessori|alphabet/i, slug: "educational-toys" },
  { re: /hamper|gift set|corporate|diary.*pen|executive personalized/i, slug: "corporate-gift-sets" },
  { re: /birthday|return gift hamper|gift hamper/i, slug: "birthday-gift-hampers" },
  { re: /miniature|die-cast|motorcycle/i, slug: "miniatures" },
  { re: /plush|soft toy keyring/i, slug: "plushies-soft-toys" },
  { re: /paper bag|gift box/i, slug: "paper-bags-gift-boxes" },
  { re: /bandage/i, slug: "art-books" },
  { re: /toy|game|bubble|puzzle kit|table tennis|tennis trainer/i, slug: "fun-toys-games" },
];

function categoryFor(name) {
  for (const { re, slug } of CATEGORY_RULES) {
    if (re.test(name)) return slug;
  }
  return "stationery-kits";
}

const THEME_RULES = [
  { re: /unicorn/i, slug: "unicorn" },
  { re: /dino|dinosaur|astronaut|space/i, slug: "dino" },
  { re: /space|astronaut|rocket/i, slug: "space" },
  { re: /mermaid/i, slug: "mermaid" },
  { re: /jungle|safari|animal/i, slug: "jungle" },
  { re: /panda/i, slug: "panda" },
  { re: /dessert|ice cream|macaron|chili pepper|yummy/i, slug: "dessert" },
];

function themesFor(name) {
  const out = new Set();
  for (const { re, slug } of THEME_RULES) {
    if (re.test(name)) out.add(slug);
  }
  if (out.has("dino") && /space|astronaut|rocket/i.test(name)) out.delete("dino");
  return [...out];
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function tagsFor(name, slug) {
  const h = hash(slug);
  const tags = ["gift-idea"];
  if (h % 5 === 0) tags.push("new-arrival");
  if (h % 7 === 0) tags.push("best-seller");
  if (/personaliz|custom name|engrav|logo printing/i.test(name)) tags.push("personalization");
  if (h % 2 === 0) tags.push("gender-girls");
  else if (h % 3 === 0) tags.push("gender-boys");
  else tags.push("gender-unisex");
  const ages = ["age-3-6", "age-6-9", "age-0-3", "age-9-plus"];
  tags.push(ages[h % ages.length]);
  return [...new Set(tags)];
}

function collectionsFor(name, tags, price) {
  const cols = [];
  if (tags.includes("personalization")) cols.push("personalization-picks");
  if (tags.includes("new-arrival")) cols.push("new-arrivals");
  if (tags.includes("best-seller") || tags.includes("gift-idea")) cols.push("trending");
  if (price <= 500 || tags.includes("gift-idea")) cols.push("return-gifts");
  return [...new Set(cols)];
}

const md = loadMarkdown();
const parts = md.split(/^### /gm).slice(1);
const seenSlugs = new Set();
const products = [];

for (const block of parts) {
  const firstLine = block.split("\n")[0]?.trim();
  if (!firstLine || firstLine === "Giftoo" || firstLine === "Subtotal:") continue;

  const name = firstLine.replace(/\s+/g, " ").trim();
  let baseSlug = slugify(name);
  if (!baseSlug) continue;
  let slug = baseSlug;
  let n = 2;
  while (seenSlugs.has(slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  seenSlugs.add(slug);

  const saleMatch = block.match(/Sale price\s+(?:From\s+)?₹\s*([\d,]+)/i);
  const compareMatch = block.match(/~~₹\s*([\d,]+)~~/);
  const priceRupees = saleMatch
    ? Number.parseInt(saleMatch[1].replace(/,/g, ""), 10)
    : 99 + (hash(slug) % 400);
  const compareAtRupees = compareMatch
    ? Number.parseInt(compareMatch[1].replace(/,/g, ""), 10)
    : Math.ceil(priceRupees * 1.35);

  const categorySlug = categoryFor(name);
  const themeSlugs = themesFor(name);
  const tagSlugs = tagsFor(name, slug);
  const isPersonalizable = /personaliz|custom name|engrav|customised|customized/i.test(name);

  products.push({
    name,
    slug,
    sku: `WUI-${slug}`.slice(0, 64),
    categorySlug,
    themeSlugs,
    tagSlugs,
    priceRupees,
    compareAtRupees,
    stock: 20 + (hash(slug) % 180),
    isPersonalizable,
    collectionSlugs: collectionsFor(name, tagSlugs, priceRupees),
  });
}

const outDir = join(root, "prisma", "data");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "catalog-products.json");
writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: products.length, products }, null, 2));

console.log(`Wrote ${products.length} products → ${outPath}`);
