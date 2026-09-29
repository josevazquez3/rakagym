import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres");

const userFields = {
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  apellido: z.string().trim().min(1, "El apellido es obligatorio").max(80),
  email: z.string().trim().email("Ingresá un email válido").max(160),
  celular: z.string().trim().max(30),
  rol: z.enum(["ADMIN", "USUARIO"]),
};

export const createUserSchema = z.object({
  ...userFields,
  password: passwordSchema,
});

export const updateUserSchema = z.object(userFields);

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export const profileSchema = z.object({
  nombre: userFields.nombre,
  apellido: userFields.apellido,
  email: userFields.email,
  celular: userFields.celular,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresá tu contraseña actual").max(72),
  newPassword: passwordSchema,
});
