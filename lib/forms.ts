import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { FieldErrors } from "@/lib/action";

export function applyFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldErrors: FieldErrors | undefined,
) {
  if (!fieldErrors) return;
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];
    if (!message) continue;
    form.setError(key as Path<T>, { message });
  }
}
