import { Prisma } from "@prisma/client";
import { requirePageRole } from "@/lib/auth/permissions";
import { prisma, withDb } from "@/lib/db";
import { parseDateOnly, toDateInput } from "@/lib/format";
import { clampPage, getPageCount, PAGE_SIZE } from "@/lib/pagination";
import { readParam } from "@/lib/utils";
import { DbAlert } from "@/components/dashboard/db-alert";
import { TreasuryManager, type TxFilters, type TxItem } from "@/components/dashboard/treasury-manager";

export const metadata = { title: "Tesorería" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function TreasuryPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePageRole(["ADMIN"]);
  const filters: TxFilters = {
    desde: readParam(searchParams.desde),
    hasta: readParam(searchParams.hasta),
    estado: readParam(searchParams.estado),
    tipo: readParam(searchParams.tipo),
    socio: readParam(searchParams.socio),
  };

  const result = await withDb(async () => {
    const fecha: Prisma.DateTimeFilter = {};
    const from = parseDateOnly(filters.desde);
    const to = parseDateOnly(filters.hasta);
    if (from) fecha.gte = from;
    if (to) fecha.lte = to;

    const where: Prisma.TransactionWhereInput = {
      ...(from || to ? { fecha } : {}),
      ...(filters.estado === "PENDIENTE" || filters.estado === "PAGADO" || filters.estado === "ANULADO"
        ? { estado: filters.estado }
        : {}),
      ...(filters.tipo === "INGRESO" || filters.tipo === "EGRESO" ? { tipo: filters.tipo } : {}),
      ...(filters.socio ? { userId: filters.socio } : {}),
    };

    const totalWhere: Prisma.TransactionWhereInput = {
      ...where,
      tipo: undefined,
      estado: filters.estado === "ANULADO" || filters.estado === "PENDIENTE" || filters.estado === "PAGADO"
        ? filters.estado
        : { not: "ANULADO" },
    };

    const [total, ingresos, egresos, members] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({ where: { ...totalWhere, tipo: "INGRESO" }, _sum: { monto: true } }),
      prisma.transaction.aggregate({ where: { ...totalWhere, tipo: "EGRESO" }, _sum: { monto: true } }),
      prisma.user.findMany({
        where: { activo: true },
        select: { id: true, nombre: true, apellido: true },
        orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      }),
    ]);

    const totalPages = getPageCount(total);
    const page = clampPage(Number(readParam(searchParams.page) || "1"), totalPages);
    const rows = await prisma.transaction.findMany({
      where,
      include: { user: { select: { nombre: true, apellido: true } } },
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    const income = new Prisma.Decimal(ingresos._sum.monto ?? 0);
    const expense = new Prisma.Decimal(egresos._sum.monto ?? 0);
    const items: TxItem[] = rows.map((row) => ({
      id: row.id,
      userId: row.userId ?? "",
      socio: row.user ? `${row.user.nombre} ${row.user.apellido}` : "",
      tipo: row.tipo,
      concepto: row.concepto,
      monto: row.monto.toFixed(2),
      fecha: row.fecha.toISOString(),
      fechaInput: toDateInput(row.fecha),
      estado: row.estado,
    }));

    return {
      items,
      members,
      page,
      totalPages,
      total,
      totals: {
        ingresos: income.toFixed(2),
        egresos: expense.toFixed(2),
        balance: income.minus(expense).toFixed(2),
      },
    };
  });

  if (!result.ok) return <DbAlert />;

  return (
    <TreasuryManager
      items={result.data.items}
      members={result.data.members}
      filters={filters}
      totals={result.data.totals}
      page={result.data.page}
      totalPages={result.data.totalPages}
      total={result.data.total}
    />
  );
}
