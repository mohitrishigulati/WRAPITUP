import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { mergeGuestCartIntoUser, replaceUserCart } from "@/lib/cart/server";
import { cartLinesSchema } from "@/lib/validators/checkout";

const bodySchema = z.object({
  lines: cartLinesSchema,
  mode: z.enum(["merge", "replace"]).default("merge"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
  }

  const lines =
    parsed.data.mode === "replace"
      ? await replaceUserCart(session.user.id, parsed.data.lines).then(() => parsed.data.lines)
      : await mergeGuestCartIntoUser(session.user.id, parsed.data.lines);

  return NextResponse.json({ lines });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ lines: [] });
  }

  const { getCartLinesForUser } = await import("@/lib/cart/server");
  const lines = await getCartLinesForUser(session.user.id);
  return NextResponse.json({ lines });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse({ ...json, mode: "replace" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
  }

  await replaceUserCart(session.user.id, parsed.data.lines);
  return NextResponse.json({ lines: parsed.data.lines });
}
