"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/permissions";
import { emptyToNull } from "@/lib/utils";
import { handleActionError, isUniqueViolation, zodFailure, type ActionResult } from "@/lib/action";
import { changePasswordSchema, profileSchema } from "@/lib/validations/user";

export async function updateProfile(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireRole(["ADMIN", "USUARIO"]);
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nombre: parsed.data.nombre,
        apellido: parsed.data.apellido,
        email: parsed.data.email.toLowerCase(),
        celular: emptyToNull(parsed.data.celular),
      },
    });
    revalidatePath("/perfil");
    revalidatePath("/usuarios/padron");
    return { ok: true };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: "Ese email ya está registrado." };
    return handleActionError(error, "No se pudo actualizar el perfil.");
  }
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireRole(["ADMIN", "USUARIO"]);
    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) return zodFailure(parsed.error);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });
    if (!user) return { ok: false, error: "No se encontró la cuenta." };

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return { ok: false, error: "La contraseña actual no coincide." };

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo cambiar la contraseña.");
  }
}
