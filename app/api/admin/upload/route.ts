import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { persistUploadedImage } from "@/lib/uploads/persist-image";
import {
  assertAllowedImageUpload,
  buildProductImageFilename,
} from "@/lib/uploads/safe-image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Each image must be under 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let ext: string;
    try {
      ext = assertAllowedImageUpload(file, buffer);
    } catch {
      return NextResponse.json({ error: "Unsupported or invalid image file" }, { status: 400 });
    }

    const filename = buildProductImageFilename(ext);
    const url = await persistUploadedImage("products", filename, buffer, ext);
    urls.push(url);
  }

  return NextResponse.json({ urls });
}
