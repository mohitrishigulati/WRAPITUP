import type { UserRole } from "@prisma/client";

export const ADMIN_PATH_PREFIX = "/admin";
export const ADMIN_API_PREFIX = "/api/admin";

export function isAdminRoute(pathname: string) {
  return (
    pathname === ADMIN_PATH_PREFIX ||
    pathname.startsWith(`${ADMIN_PATH_PREFIX}/`) ||
    pathname === ADMIN_API_PREFIX ||
    pathname.startsWith(`${ADMIN_API_PREFIX}/`)
  );
}

export function canAccessAdmin(role: UserRole | string | undefined | null) {
  return role === "ADMIN";
}

export type AdminAccessDeniedReason = "unauthenticated" | "forbidden";

export function evaluateAdminAccess(input: {
  isAuthenticated: boolean;
  role: UserRole | string | undefined | null;
}): { allowed: true } | { allowed: false; reason: AdminAccessDeniedReason } {
  if (!input.isAuthenticated) {
    return { allowed: false, reason: "unauthenticated" };
  }
  if (!canAccessAdmin(input.role)) {
    return { allowed: false, reason: "forbidden" };
  }
  return { allowed: true };
}
