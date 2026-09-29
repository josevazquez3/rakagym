import { requirePageRole } from "@/lib/auth/permissions";
import { prisma, withDb } from "@/lib/db";
import { DbAlert } from "@/components/dashboard/db-alert";
import { RoutinesManager, type MemberOption, type RoutineCard } from "@/components/dashboard/routines-manager";

export const metadata = { title: "Rutinas" };

export default async function RoutinesPage() {
  const session = await requirePageRole(["ADMIN", "USUARIO"]);
  const isAdmin = session.user.role === "ADMIN";

  const result = await withDb(async () => {
    const routines = await prisma.routine.findMany({
      where: isAdmin ? {} : { assignments: { some: { userId: session.user.id } } },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { nombre: true, apellido: true } },
        assignments: {
          include: { user: { select: { id: true, nombre: true, apellido: true } } },
        },
      },
    });
    const members = isAdmin
      ? await prisma.user.findMany({
          where: { activo: true },
          select: { id: true, nombre: true, apellido: true, email: true },
          orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
        })
      : [];

    const cards: RoutineCard[] = routines.map((routine) => ({
      id: routine.id,
      titulo: routine.titulo,
      descripcion: routine.descripcion,
      contenido: routine.contenido,
      createdAt: routine.createdAt.toISOString(),
      author: `${routine.createdBy.nombre} ${routine.createdBy.apellido}`,
      assignees: isAdmin
        ? routine.assignments.map((assignment) => ({
            id: assignment.user.id,
            nombre: assignment.user.nombre,
            apellido: assignment.user.apellido,
          }))
        : [],
    }));

    return { cards, members: members satisfies MemberOption[] };
  });

  if (!result.ok) return <DbAlert />;

  return <RoutinesManager routines={result.data.cards} members={result.data.members} canManage={isAdmin} />;
}
