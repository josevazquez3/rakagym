import { Prisma } from "@prisma/client";

export const userPublicSelect = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  rol: true,
  celular: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof userPublicSelect }>;

export function serializeUser(user: PublicUser) {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    rol: user.rol,
    celular: user.celular,
    activo: user.activo,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export type UserListItem = ReturnType<typeof serializeUser>;
