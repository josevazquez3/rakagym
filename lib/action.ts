import { ZodError } from "zod";
import { AuthzError } from "@/lib/auth/permissions";

export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export function zodFailure(error: ZodError): ActionResult<never> {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    const current = fieldErrors[key] ?? [];
    current.push(issue.message);
    fieldErrors[key] = current;
  }
  return {
    ok: false,
    error: "Revisá los campos marcados.",
    fieldErrors,
  };
}

export function handleActionError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof AuthzError) {
    return {
      ok: false,
      error:
        error.code === "UNAUTHENTICATED"
          ? "Tenés que iniciar sesión."
          : "No tenés permiso para esta acción.",
    };
  }
  console.error(error);
  return { ok: false, error: fallback };
}

export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
