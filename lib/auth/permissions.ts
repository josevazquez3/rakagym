import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";

export class AuthzError extends Error {
  readonly code: "UNAUTHENTICATED" | "FORBIDDEN";

  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN") {
    super(code);
    this.name = "AuthzError";
    this.code = code;
  }
}

export async function requireRole(roles: readonly Role[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthzError("UNAUTHENTICATED");
  }
  if (!roles.includes(session.user.role)) {
    throw new AuthzError("FORBIDDEN");
  }
  return session;
}

export async function requirePageRole(roles: readonly Role[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!roles.includes(session.user.role)) redirect("/panel");
  return session;
}
