import type { NextAuthConfig } from "next-auth";
import { ADMIN_ROUTES, PROTECTED_ROUTES, matchesRoute } from "@/lib/auth/routes";

const devSecret = "raka-gym-local-dev-secret";
const configuredSecret = process.env.AUTH_SECRET?.trim();

export const authConfig = {
  secret: configuredSecret || (process.env.NODE_ENV === "production" ? undefined : devSecret),
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user?.id);
      const role = auth?.user?.role;

      if (pathname === "/login") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/panel", request.nextUrl));
        }
        return true;
      }

      if (!matchesRoute(pathname, PROTECTED_ROUTES)) {
        return true;
      }

      if (!isLoggedIn) return false;

      if (matchesRoute(pathname, ADMIN_ROUTES) && role !== "ADMIN") {
        return Response.redirect(new URL("/rutinas", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.nombre = user.nombre;
        token.apellido = user.apellido;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = typeof token.id === "string" ? token.id : "";
      session.user.role = token.role === "ADMIN" ? "ADMIN" : "USUARIO";
      session.user.nombre = typeof token.nombre === "string" ? token.nombre : "";
      session.user.apellido = typeof token.apellido === "string" ? token.apellido : "";
      return session;
    },
  },
} satisfies NextAuthConfig;
