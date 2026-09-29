"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/permissions";
import { emptyToNull } from "@/lib/utils";
import {
  handleActionError,
  isUniqueViolation,
  zodFailure,
  type ActionResult,
} from "@/lib/action";
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "@/lib/validations/user";

const PATH = "/usuarios/padron";

async function assertLastAdmin(userId: string, nextIsAdmin: boolean) {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, rol: true, activo: true },
  });
  if (!current) return { ok: false as const, error: "El usuario no existe." };
  if (current.rol === "ADMIN" && current.activo && !nextIsAdmin) {
    const admins = await prisma.user.count({ where: { rol: "ADMIN", activo: true } });
    if (admins <= 1) {
      return { ok: false as const, error: "Tiene que quedar al menos un administrador activo." };
    }
  }
  return { ok: true as const, current };
}

export async function createUser(input: unknown): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
      data: {
        nombre: parsed.data.nombre,
        apellido: parsed.data.apellido,
        email: parsed.data.email.toLowerCase(),
        celular: emptyToNull(parsed.data.celular),
        rol: parsed.data.rol,
        passwordHash,
        activo: true,
      },
    });
    revalidatePath(PATH);
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "Ese email ya está registrado." };
    return handleActionError(error, "No se pudo crear el usuario.");
  }
}

export async function updateUser(id: string, input: unknown): Promise<ActionResult> {
  try {
    const session = await requireRole(["ADMIN"]);
    const parsed = updateUserSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);

    const guard = await assertLastAdmin(id, parsed.data.rol === "ADMIN");
    if (!guard.ok) return guard;
    if (guard.current.id === session.user.id && parsed.data.rol !== "ADMIN") {
      return { ok: false, error: "No podés quitarte el rol de administrador." };
    }

    await prisma.user.update({
      where: { id },
      data: {
        nombre: parsed.data.nombre,
        apellido: parsed.data.apellido,
        email: parsed.data.email.toLowerCase(),
        celular: emptyToNull(parsed.data.celular),
        rol: parsed.data.rol,
      },
    });
    revalidatePath(PATH);
    revalidatePath("/perfil");
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "Ese email ya está registrado." };
    return handleActionError(error, "No se pudo actualizar el usuario.");
  }
}

export async function setUserActive(id: string, activo: boolean): Promise<ActionResult> {
  try {
    const session = await requireRole(["ADMIN"]);
    if (id === session.user.id && !activo) {
      return { ok: false, error: "No podés desactivar tu propia cuenta." };
    }
    const current = await prisma.user.findUnique({
      where: { id },
      select: { rol: true, activo: true },
    });
    if (!current) return { ok: false, error: "El usuario no existe." };
    if (current.rol === "ADMIN" && current.activo && !activo) {
      const admins = await prisma.user.count({ where: { rol: "ADMIN", activo: true } });
      if (admins <= 1) {
        return { ok: false, error: "Tiene que quedar al menos un administrador activo." };
      }
    }
    await prisma.user.update({ where: { id }, data: { activo } });
    revalidatePath(PATH);
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo cambiar el estado del usuario.");
  }
}

export async function resetUserPassword(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);
    const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { ok: false, error: "El usuario no existe." };
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo restablecer la contraseña.");
  }
}
