import { randomBytes } from "crypto";
import { getObjectStoragePublicBaseUrl } from "@/lib/uploads/public-base-url";

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const REVIEW_FILENAME =
  /^[a-z0-9]+-\d+-[a-f0-9]+\.(jpg|jpeg|png|webp|gif)$/i;

export function extensionFromImageBuffer(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return ".jpg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return ".png";
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return ".gif";
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return ".webp";
  }

  return null;
}

export function assertAllowedImageUpload(file: File, buffer: Buffer): string {
  if (file.type === "image/svg+xml" || file.type === "image/svg") {
    throw new Error("SVG uploads are not allowed");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only images are allowed");
  }

  const ext = extensionFromImageBuffer(buffer);
  if (!ext || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    throw new Error("Unsupported or invalid image file");
  }

  return ext;
}

export function buildReviewImageFilename(userId: string, ext: string) {
  const safeUser = userId.replace(/[^a-z0-9]/gi, "");
  if (!safeUser) {
    throw new Error("Invalid user id");
  }
  return `${safeUser}-${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
}

export function buildProductImageFilename(ext: string) {
  return `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
}

function parseLocalReviewPhoto(photoUrl: string): string | null {
  const match = photoUrl.match(/^\/uploads\/reviews\/([^/]+)$/);
  if (!match) return null;
  const filename = match[1];
  return REVIEW_FILENAME.test(filename) ? filename : null;
}

function parseRemoteReviewPhoto(photoUrl: string): string | null {
  const publicBase = getObjectStoragePublicBaseUrl();
  if (!publicBase) return null;

  try {
    const base = new URL(publicBase);
    const url = new URL(photoUrl);
    if (url.origin !== base.origin) return null;

    const basePath = base.pathname.replace(/\/$/, "");
    const expectedPrefix = `${basePath}/reviews/`.replace(/\/+/g, "/");
    const pathname = url.pathname.replace(/\/+/g, "/");
    if (!pathname.startsWith(expectedPrefix)) return null;

    const filename = pathname.slice(expectedPrefix.length);
    if (filename.includes("/")) return null;
    return REVIEW_FILENAME.test(filename) ? filename : null;
  } catch {
    return null;
  }
}

/** Extract review image filename from a stored public URL or local path. */
export function parseReviewPhotoFilename(photoUrl: string): string | null {
  if (!photoUrl || photoUrl.includes("..")) return null;
  return parseLocalReviewPhoto(photoUrl) ?? parseRemoteReviewPhoto(photoUrl);
}

export function isSafeReviewPhotoPath(photoUrl: string): boolean {
  return parseReviewPhotoFilename(photoUrl) != null;
}

export function isReviewPhotoOwnedByUser(photoUrl: string, userId: string): boolean {
  const safeUser = userId.replace(/[^a-z0-9]/gi, "");
  const filename = parseReviewPhotoFilename(photoUrl);
  if (!safeUser || !filename) return false;
  return filename.startsWith(`${safeUser}-`);
}

/** When object storage is on, reject legacy local paths on new submissions. */
export function isAllowedReviewPhotoSubmission(photoUrl: string): boolean {
  const filename = parseReviewPhotoFilename(photoUrl);
  if (!filename) return false;

  const publicBase = getObjectStoragePublicBaseUrl();
  if (publicBase) {
    return parseRemoteReviewPhoto(photoUrl) != null;
  }
  return parseLocalReviewPhoto(photoUrl) != null;
}
