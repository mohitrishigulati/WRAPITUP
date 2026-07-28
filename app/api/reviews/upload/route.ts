import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { persistUploadedImage } from "@/lib/uploads/persist-image";
import {
  assertAllowedImageUpload,
  buildReviewImageFilename,
} from "@/lib/uploads/safe-image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = checkRateLimit(rateLimitKey("review-upload", userId), {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 3MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let ext: string;
  try {
    ext = assertAllowedImageUpload(file, buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid image";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const filename = buildReviewImageFilename(userId, ext);
  const url = await persistUploadedImage("reviews", filename, buffer, ext);

  return NextResponse.json({ url });
}
