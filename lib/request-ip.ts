import "server-only";

import { headers } from "next/headers";

export async function getClientIp() {
  const headerStore = headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headerStore.get("x-real-ip") ?? "unknown";
}
