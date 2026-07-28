#!/usr/bin/env node
/**
 * Symlink/junction E:/wrapitup/images → public/catalog for Next.js static serving.
 * Run: node scripts/link-catalog-images.mjs
 */
import { existsSync, lstatSync, mkdirSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = join(root, "images");
const publicDir = join(root, "public");
const linkPath = join(publicDir, "catalog");

if (!existsSync(imagesDir)) {
  console.error(`Missing folder: ${imagesDir}`);
  process.exit(1);
}

mkdirSync(publicDir, { recursive: true });

if (existsSync(linkPath)) {
  const stat = lstatSync(linkPath);
  if (stat.isSymbolicLink() || stat.isDirectory()) {
    rmSync(linkPath, { recursive: true, force: true });
  }
}

if (process.platform === "win32") {
  execSync(`cmd /c mklink /J "${linkPath}" "${imagesDir}"`, { stdio: "inherit" });
} else {
  execSync(`ln -s "${imagesDir}" "${linkPath}"`, { stdio: "inherit" });
}

console.log(`Linked ${linkPath} → ${imagesDir}`);
console.log("Product URLs: /catalog/<filename>");
