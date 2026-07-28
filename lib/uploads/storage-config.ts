import "server-only";

import { getObjectStoragePublicBaseUrl } from "@/lib/uploads/public-base-url";

/** Trimmed public origin + path prefix for object reads (no trailing slash). */
export { getObjectStoragePublicBaseUrl };

export function isObjectStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim() &&
      getObjectStoragePublicBaseUrl(),
  );
}

export type UploadScope = "reviews" | "products";

export function objectKeyFor(scope: UploadScope, filename: string): string {
  return `${scope}/${filename}`;
}

export function publicUrlFor(scope: UploadScope, filename: string): string {
  const base = getObjectStoragePublicBaseUrl();
  if (!base) {
    return `/uploads/${scope}/${filename}`;
  }
  return `${base}/${scope}/${filename}`;
}

export function contentTypeForExtension(ext: string): string {
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
