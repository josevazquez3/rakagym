import { z } from "zod";

export const routineSchema = z.object({
  titulo: z.string().trim().min(1, "El título es obligatorio").max(120),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria").max(300),
  contenido: z.string().trim().min(1, "El contenido es obligatorio").max(20000),
  userIds: z.array(z.string().min(1)).max(500),
});
