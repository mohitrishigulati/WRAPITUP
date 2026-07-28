#!/usr/bin/env node
/** Smoke-test internal storefront paths (default: production). */
const base = (process.argv[2] ?? "https://wrapitup-two.vercel.app").replace(/\/$/, "");

const paths = [
  "/",
  "/products",
  "/products?tags=gift-idea",
  "/products?tags=new-arrival",
  "/products?tags=personalization",
  "/products?tags=best-seller",
  "/themes",
  "/corporate-gifts",
  "/cart",
  "/checkout",
  "/login",
  "/signup",
  "/forgot-password",
  "/admin",
  "/api/health",
  "/robots.txt",
  "/sitemap.xml",
  "/info/about",
  "/info/contact",
  "/info/shipping",
  "/info/returns",
  "/info/privacy",
  "/info/terms",
  "/info/track-order",
  "/info/offers",
  "/collections/return-gifts",
  "/collections/new-arrivals",
  "/collections/trending",
  "/collections/personalization-picks",
  "/categories/stationery-school",
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
  "/categories/stickers-washi-tapes",
  "/categories/toys-games",
  "/categories/miniatures",
  "/categories/plushies-soft-toys",
  "/categories/diy-craft-kits",
  "/categories/educational-toys",
  "/categories/gift-sets",
  "/categories/gifts-wrap",
  "/themes/birthday",
  "/account/profile",
  "/account/orders",
  "/account/wishlist",
];

function classify(body, status) {
  if (status >= 500) return "SERVER_ERROR";
  if (status === 404) return "NOT_FOUND";
  if (body.includes("Application error")) return "APP_ERROR";
  if (body.includes("Catalog unavailable")) return "OK_CATALOG_MSG";
  if (body.includes("Something went wrong")) return "ERROR_UI";
  if (status >= 400) return "CLIENT_ERROR";
  return "OK";
}

const results = [];
for (const path of paths) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const body = await res.text();
    results.push({
      path,
      status: res.status,
      kind: classify(body, res.status),
    });
  } catch (e) {
    results.push({ path, status: 0, kind: `FAIL: ${e.message}` });
  }
}

const broken = results.filter((r) => !["OK", "OK_CATALOG_MSG"].includes(r.kind));
console.log(`Base: ${base}\n`);
console.log(`Total: ${results.length} | OK: ${results.length - broken.length} | Issues: ${broken.length}\n`);
if (broken.length) {
  console.log("Issues:");
  for (const r of broken) console.log(`  ${r.status} ${r.kind} ${r.path}`);
} else {
  console.log("All paths returned 200 without server/application errors.");
}
console.log("\nFull report:");
for (const r of results) console.log(`${r.status}\t${r.kind}\t${r.path}`);

process.exitCode = broken.some((r) =>
  ["SERVER_ERROR", "APP_ERROR", "NOT_FOUND", "FAIL"].some((p) => r.kind.startsWith(p)),
)
  ? 1
  : 0;
