import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { getAdminAnalytics } from "@/lib/admin/queries";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const analytics = await getAdminAnalytics();
  return NextResponse.json(analytics);
}
