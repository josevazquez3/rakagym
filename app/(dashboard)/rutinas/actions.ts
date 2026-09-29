"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/permissions";
import { handleActionError, zodFailure, type ActionResult } from "@/lib/action";
import { routineSchema } from "@/lib/validations/routine";

const PATH = "/rutinas";

async function assigneeIds(userIds: string[]) {
  const unique = Array.from(new Set(userIds));
  if (unique.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: unique }, activo: true },
    select: { id: true },
  });
  if (users.length !== unique.length) return null;
  return unique;
}

export async function createRoutine(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireRole(["ADMIN"]);
    const parsed = routineSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);
    const ids = await assigneeIds(parsed.data.userIds);
    if (!ids) return { ok: false, error: "Hay socios inválidos en la asignación." };

    await prisma.routine.create({
      data: {
        titulo: parsed.data.titulo,
        descripcion: parsed.data.descripcion,
        contenido: parsed.data.contenido,
        createdById: session.user.id,
        assignments: {
          create: ids.map((userId) => ({ userId })),
        },
      },
    });
    revalidatePath(PATH);
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo crear la rutina.");
  }
}

export async function updateRoutine(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const parsed = routineSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);
    const ids = await assigneeIds(parsed.data.userIds);
    if (!ids) return { ok: false, error: "Hay socios inválidos en la asignación." };

    const exists = await prisma.routine.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { ok: false, error: "La rutina no existe." };

    await prisma.$transaction([
      prisma.routine.update({
        where: { id },
        data: {
          titulo: parsed.data.titulo,
          descripcion: parsed.data.descripcion,
          contenido: parsed.data.contenido,
        },
      }),
      prisma.routineAssignment.deleteMany({ where: { routineId: id } }),
      ...(ids.length
        ? [
            prisma.routineAssignment.createMany({
              data: ids.map((userId) => ({ userId, routineId: id })),
            }),
          ]
        : []),
    ]);
    revalidatePath(PATH);
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo actualizar la rutina.");
  }
}

export async function deleteRoutine(id: string): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    await prisma.routine.delete({ where: { id } });
    revalidatePath(PATH);
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo eliminar la rutina.");
  }
}
