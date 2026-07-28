import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireUser(callbackPath?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    const callback = callbackPath ? `?callbackUrl=${encodeURIComponent(callbackPath)}` : "";
    redirect(`/login${callback}`);
  }
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    role: session.user.role,
  };
}
