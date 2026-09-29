import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido").max(160),
  password: z.string().min(1, "Ingresá tu contraseña").max(72),
});
