/** Public CDN/base URL for uploaded objects (no trailing slash). Safe to import in tests. */
export function getObjectStoragePublicBaseUrl(): string | null {
  const raw = process.env.S3_PUBLIC_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}
