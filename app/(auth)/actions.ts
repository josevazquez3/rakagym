"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";
import { getClientIp } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { zodFailure, type ActionResult } from "@/lib/action";

export async function loginAction(input: unknown): Promise<ActionResult> {
  const ip = getClientIp();
  const ipLimit = rateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
  if (!ipLimit.ok) {
    return {
      ok: false,
      error: `Demasiados intentos. Probá de nuevo en ${ipLimit.retryAfterSeconds} segundos.`,
    };
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return zodFailure(parsed.error);

  const email = parsed.data.email.toLowerCase();
  const emailLimit = rateLimit(`login:email:${email}`, 8, 15 * 60 * 1000);
  if (!emailLimit.ok) {
    return {
      ok: false,
      error: `Demasiados intentos. Probá de nuevo en ${emailLimit.retryAfterSeconds} segundos.`,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/panel",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Email o contraseña incorrectos." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
