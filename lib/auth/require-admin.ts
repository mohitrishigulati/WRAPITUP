import "server-only";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { evaluateAdminAccess } from "@/lib/auth/admin-access";

export async function requireAdmin(callbackPath?: string) {
  const session = await auth();
  const access = evaluateAdminAccess({
    isAuthenticated: Boolean(session?.user?.id),
    role: session?.user?.role,
  });

  if (access.allowed) {
    return {
      id: session!.user!.id,
      email: session!.user!.email ?? "",
      name: session!.user!.name ?? null,
      role: session!.user!.role,
    };
  }

  if (access.reason === "unauthenticated") {
    const callback = callbackPath ? `?callbackUrl=${encodeURIComponent(callbackPath)}` : "";
    redirect(`/login${callback}`);
  }

  redirect("/?admin=forbidden");
}

export async function requireAdminApi() {
  const session = await auth();
  const access = evaluateAdminAccess({
    isAuthenticated: Boolean(session?.user?.id),
    role: session?.user?.role,
  });

  if (!access.allowed) {
    if (access.reason === "unauthenticated") {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      } as const;
    }
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as const;
  }

  return {
    user: {
      id: session!.user!.id,
      email: session!.user!.email ?? "",
      role: session!.user!.role,
    },
  } as const;
}
