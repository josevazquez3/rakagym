import { NextResponse, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { PROTECTED_ROUTES, matchesRoute } from "@/lib/auth/routes";

const handleAuth = NextAuth(authConfig).auth as unknown as (
  request: NextRequest,
) => Promise<Response | undefined> | Response | undefined;

export default function middleware(request: NextRequest) {
  if (!process.env.AUTH_SECRET?.trim()) {
    if (matchesRoute(request.nextUrl.pathname, PROTECTED_ROUTES)) {
      const login = new URL("/login", request.nextUrl);
      login.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return handleAuth(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand|.*\\..*).*)"],
};
