import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  contentTypeForExtension,
  isObjectStorageConfigured,
  objectKeyFor,
  publicUrlFor,
  type UploadScope,
} from "@/lib/uploads/storage-config";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) return s3Client;

  const region = process.env.S3_REGION?.trim() || "auto";
  const endpoint = process.env.S3_ENDPOINT?.trim();

  s3Client = new S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!.trim(),
    },
  });

  return s3Client;
}

async function saveToLocalDisk(scope: UploadScope, filename: string, buffer: Buffer) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", scope);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
}

async function saveToObjectStorage(
  scope: UploadScope,
  filename: string,
  buffer: Buffer,
  ext: string,
) {
  const bucket = process.env.S3_BUCKET!.trim();
  const key = objectKeyFor(scope, filename);
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentTypeForExtension(ext),
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

/** Persist validated image bytes; returns public URL stored on Product/Review. */
export async function persistUploadedImage(
  scope: UploadScope,
  filename: string,
  buffer: Buffer,
  ext: string,
): Promise<string> {
  if (isObjectStorageConfigured()) {
    await saveToObjectStorage(scope, filename, buffer, ext);
  } else {
    await saveToLocalDisk(scope, filename, buffer);
  }
  return publicUrlFor(scope, filename);
}
