import "server-only";

import { existsSync, readFileSync } from "fs";
import { join } from "path";

type StorefrontImagesFile = {
  hero?: string;
  promo?: string;
  shopTiles?: Record<string, string>;
};

let cached: StorefrontImagesFile | null | undefined;

export function getStorefrontImages(): StorefrontImagesFile | null {
  if (cached !== undefined) return cached;
  const path = join(process.cwd(), "prisma", "data", "storefront-images.json");
  if (!existsSync(path)) {
    cached = null;
    return null;
  }
  try {
    cached = JSON.parse(readFileSync(path, "utf8")) as StorefrontImagesFile;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

export function storefrontImageForHref(href: string): string | undefined {
  return getStorefrontImages()?.shopTiles?.[href];
}
