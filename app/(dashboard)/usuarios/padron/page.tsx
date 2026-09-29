import type { Prisma, Role } from "@prisma/client";
import { requirePageRole } from "@/lib/auth/permissions";
import { prisma, withDb } from "@/lib/db";
import { clampPage, getPageCount, PAGE_SIZE } from "@/lib/pagination";
import { readParam } from "@/lib/utils";
import { serializeUser } from "@/lib/users";
import { DbAlert } from "@/components/dashboard/db-alert";
import { UsersManager } from "@/components/dashboard/users-manager";

export const metadata = { title: "Padrón" };

type SearchParams = Record<string, string | string[] | undefined>;

function whereFor(q: string, rol: string, activo: string): Prisma.UserWhereInput {
  const roleFilter: Role | undefined = rol === "ADMIN" || rol === "USUARIO" ? rol : undefined;
  return {
    AND: [
      q
        ? {
            OR: [
              { nombre: { contains: q, mode: "insensitive" } },
              { apellido: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      roleFilter ? { rol: roleFilter } : {},
      activo === "true" ? { activo: true } : activo === "false" ? { activo: false } : {},
    ],
  };
}

export default async function PadronPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requirePageRole(["ADMIN"]);
  const filters = {
    q: readParam(searchParams.q).slice(0, 80),
    rol: readParam(searchParams.rol),
    activo: readParam(searchParams.activo),
  };
  const where = whereFor(filters.q, filters.rol, filters.activo);
  const result = await withDb(async () => {
    const total = await prisma.user.count({ where });
    const totalPages = getPageCount(total);
    const page = clampPage(Number(readParam(searchParams.page) || "1"), totalPages);
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        celular: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    return { users: users.map(serializeUser), page, totalPages, total };
  });

  if (!result.ok) return <DbAlert />;

  return (
    <UsersManager
      users={result.data.users}
      currentUserId={session.user.id}
      filters={filters}
      page={result.data.page}
      totalPages={result.data.totalPages}
      total={result.data.total}
    />
  );
}
