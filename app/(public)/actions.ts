"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { inquirySchema } from "@/lib/validations/inquiry";
import { getClientIp } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { handleActionError, zodFailure, type ActionResult } from "@/lib/action";

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

    const hasHealthIssue = parsed.data.tieneProblemaSalud === "si";
    await prisma.inquiry.create({
      data: {
        nombre: parsed.data.nombre,
        apellido: parsed.data.apellido,
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
