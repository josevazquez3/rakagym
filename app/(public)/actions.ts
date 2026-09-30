"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { inquirySchema } from "@/lib/validations/inquiry";
import { getClientIp } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { handleActionError, zodFailure, type ActionResult } from "@/lib/action";
import { emptyToNull } from "@/lib/utils";

export async function createInquiry(input: unknown): Promise<ActionResult> {
  try {
    const ip = getClientIp();
    const limit = rateLimit(`inquiry:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.ok) {
      return {
        ok: false,
        error: `Demasiadas consultas. Probá de nuevo en ${limit.retryAfterSeconds} segundos.`,
      };
    }

    const parsed = inquirySchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);

    if (!process.env.DATABASE_URL) {
      return {
        ok: false,
        error: "No se pudo enviar la consulta porque la base de datos no está configurada.",
      };
    }

    const hasHealthIssue = parsed.data.tieneProblemaSalud === "si";
    await prisma.inquiry.create({
      data: {
        nombre: parsed.data.nombre,
        apellido: parsed.data.apellido,
        dni: parsed.data.dni,
        calle: parsed.data.calle,
        numero: parsed.data.numero,
        piso: emptyToNull(parsed.data.piso),
        dpto: emptyToNull(parsed.data.dpto),
        email: parsed.data.email.toLowerCase(),
        celular: parsed.data.celular,
        tieneProblemaSalud: hasHealthIssue,
        detalleSalud: hasHealthIssue ? parsed.data.detalleSalud : null,
        consulta: parsed.data.consulta,
        estado: "NUEVA",
      },
    });

    revalidatePath("/consultas");
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo enviar la consulta.");
  }
}
