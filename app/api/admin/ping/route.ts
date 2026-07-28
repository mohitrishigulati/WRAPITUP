import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";

/** Non-admin and anonymous callers must receive 401/403 (also enforced in middleware). */
export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  return NextResponse.json({
    ok: true,
    admin: auth.user.email,
  });
}
