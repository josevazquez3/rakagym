import { z } from "zod";

export const transactionSchema = z.object({
  userId: z.string().trim().max(64),
  tipo: z.enum(["INGRESO", "EGRESO"]),
  concepto: z.string().trim().min(1, "El concepto es obligatorio").max(160),
  monto: z.string().trim().regex(/^\d+([.,]\d{1,2})?$/, "Ingresá un monto válido"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresá una fecha válida"),
  estado: z.enum(["PENDIENTE", "PAGADO", "ANULADO"]),
});
