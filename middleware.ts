import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { evaluateAdminAccess, isAdminRoute } from "@/lib/auth/admin-access";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const access = evaluateAdminAccess({
    isAuthenticated: Boolean(token?.sub),
    role: typeof token?.role === "string" ? token.role : undefined,
  });

  if (access.allowed) {
    return NextResponse.next();
  }

  if (access.reason === "unauthenticated") {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const home = new URL("/", request.url);
  home.searchParams.set("admin", "forbidden");
  return NextResponse.redirect(home);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
