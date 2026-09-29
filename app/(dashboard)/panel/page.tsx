import Link from "next/link";
import { Prisma } from "@prisma/client";
import { requirePageRole } from "@/lib/auth/permissions";
import { prisma, withDb } from "@/lib/db";
import { currentMonthRange, formatMoney } from "@/lib/format";
import { roleLabel } from "@/lib/labels";
import { PageHeader } from "@/components/dashboard/page-header";
import { DbAlert } from "@/components/dashboard/db-alert";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-styles";

export const metadata = { title: "Panel" };

export default async function PanelPage() {
  const session = await requirePageRole(["ADMIN", "USUARIO"]);
  const isAdmin = session.user.role === "ADMIN";

  const result = await withDb(async () => {
    if (!isAdmin) {
      const routines = await prisma.routineAssignment.count({
        where: { userId: session.user.id },
      });
      return { routines };
    }
    const { start, end } = currentMonthRange();
    const [socios, consultas, ingresos, egresos] = await Promise.all([
      prisma.user.count({ where: { activo: true, rol: "USUARIO" } }),
      prisma.inquiry.count({ where: { estado: "NUEVA" } }),
      prisma.transaction.aggregate({
        where: { tipo: "INGRESO", estado: "PAGADO", fecha: { gte: start, lt: end } },
        _sum: { monto: true },
      }),
      prisma.transaction.aggregate({
        where: { tipo: "EGRESO", estado: "PAGADO", fecha: { gte: start, lt: end } },
        _sum: { monto: true },
      }),
    ]);
    const income = new Prisma.Decimal(ingresos._sum.monto ?? 0);
    const expense = new Prisma.Decimal(egresos._sum.monto ?? 0);
    return {
      socios,
      consultas,
      balance: income.minus(expense).toFixed(2),
    };
  });

  if (!result.ok) {
    return (
      <div>
        <PageHeader title="Panel" />
        <DbAlert />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Hola, ${session.user.nombre}`}
        description={`${roleLabel[session.user.role]} de RAKA GYM.`}
      />
      {isAdmin && "socios" in result.data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="font-condensed text-sm uppercase tracking-wide text-muted">Socios activos</p>
            <p className="mt-2 font-display text-4xl">{result.data.socios}</p>
          </Card>
          <Card className="p-5">
            <p className="font-condensed text-sm uppercase tracking-wide text-muted">Consultas nuevas</p>
            <p className="mt-2 font-display text-4xl">{result.data.consultas}</p>
          </Card>
          <Card className="p-5">
            <p className="font-condensed text-sm uppercase tracking-wide text-muted">Balance del mes</p>
            <p className="mt-2 font-display text-3xl text-gold">{formatMoney(result.data.balance ?? "0")}</p>
          </Card>
        </div>
      ) : "routines" in result.data ? (
        <Card className="max-w-xl p-5">
          <p className="font-condensed text-sm uppercase tracking-wide text-muted">Rutinas asignadas</p>
          <p className="mt-2 font-display text-4xl">{result.data.routines}</p>
          <Link href="/rutinas" className={`${buttonVariants()} mt-4`}>
            Ver rutinas
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
