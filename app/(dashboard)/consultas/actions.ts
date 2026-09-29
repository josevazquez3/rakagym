"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/permissions";
import { handleActionError, zodFailure, type ActionResult } from "@/lib/action";
import { inquiryStatusSchema } from "@/lib/validations/inquiry";

export async function updateInquiryStatus(id: string, estado: unknown): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const parsed = inquiryStatusSchema.safeParse(estado);
    if (!parsed.success) return zodFailure(parsed.error);
    const exists = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { ok: false, error: "La consulta no existe." };
    await prisma.inquiry.update({ where: { id }, data: { estado: parsed.data } });
    revalidatePath("/consultas");
    revalidatePath("/panel");
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo cambiar el estado.");
  }
}
