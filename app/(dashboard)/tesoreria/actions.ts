"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/permissions";
import { parseAmount, parseDateOnly } from "@/lib/format";
import { handleActionError, zodFailure, type ActionResult } from "@/lib/action";
import { transactionSchema } from "@/lib/validations/transaction";

const PATH = "/tesoreria";

async function memberOrNull(userId: string) {
  if (!userId) return { ok: true as const, userId: null };
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return { ok: false as const, error: "El socio no existe." };
  return { ok: true as const, userId: user.id };
}

function toData(input: {
  userId: string | null;
  tipo: "INGRESO" | "EGRESO";
  concepto: string;
  monto: string;
  fecha: string;
  estado: "PENDIENTE" | "PAGADO" | "ANULADO";
}) {
  const amount = parseAmount(input.monto);
  const fecha = parseDateOnly(input.fecha);
  if (!amount || !fecha) return null;
  return {
    userId: input.userId,
    tipo: input.tipo,
    concepto: input.concepto,
    monto: new Prisma.Decimal(amount),
    fecha,
    estado: input.estado,
  };
}

export async function createTransaction(input: unknown): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const parsed = transactionSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);
    const member = await memberOrNull(parsed.data.userId);
    if (!member.ok) return member;
    const data = toData({ ...parsed.data, userId: member.userId });
    if (!data) return { ok: false, error: "Revisá el monto y la fecha." };
    await prisma.transaction.create({ data });
    revalidatePath(PATH);
    revalidatePath("/panel");
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo registrar el movimiento.");
  }
}

export async function updateTransaction(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const parsed = transactionSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);
    const member = await memberOrNull(parsed.data.userId);
    if (!member.ok) return member;
    const data = toData({ ...parsed.data, userId: member.userId });
    if (!data) return { ok: false, error: "Revisá el monto y la fecha." };
    await prisma.transaction.update({ where: { id }, data });
    revalidatePath(PATH);
    revalidatePath("/panel");
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo actualizar el movimiento.");
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    await prisma.transaction.delete({ where: { id } });
    revalidatePath(PATH);
    revalidatePath("/panel");
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo eliminar el movimiento.");
  }
}
