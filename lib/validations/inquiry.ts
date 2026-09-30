import { z } from "zod";

export const inquirySchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio").max(80),
    apellido: z.string().trim().min(1, "El apellido es obligatorio").max(80),
    dni: z
      .string()
      .trim()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().regex(/^\d{7,8}$/, "Ingresá un DNI de 7 u 8 dígitos")),
    calle: z.string().trim().min(1, "La calle es obligatoria").max(120),
    numero: z.string().trim().min(1, "El número es obligatorio").max(20),
    piso: z.string().trim().max(10),
    dpto: z.string().trim().max(10),
    email: z.string().trim().email("Ingresá un email válido").max(160),
    celular: z.string().trim().min(6, "Ingresá un celular válido").max(30),
    tieneProblemaSalud: z.enum(["si", "no"]),
    detalleSalud: z.string().trim().max(500).optional(),
    consulta: z.string().trim().max(1000),
  })
  .superRefine((data, ctx) => {
    if (data.tieneProblemaSalud === "si" && !data.detalleSalud) {
      ctx.addIssue({
        code: "custom",
        message: "Indicá cuál es el problema de salud",
        path: ["detalleSalud"],
      });
    }
  });

export const inquiryStatusSchema = z.enum(["NUEVA", "LEIDA", "RESUELTA"]);
