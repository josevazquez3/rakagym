import type { InquiryStatus, Prisma } from "@prisma/client";
import { requirePageRole } from "@/lib/auth/permissions";
import { prisma, withDb } from "@/lib/db";
import { clampPage, getPageCount, PAGE_SIZE } from "@/lib/pagination";
import { readParam } from "@/lib/utils";
import { DbAlert } from "@/components/dashboard/db-alert";
import { InquiriesManager, type InquiryItem } from "@/components/dashboard/inquiries-manager";

export const metadata = { title: "Consultas" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function InquiriesPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePageRole(["ADMIN"]);
  const estado = readParam(searchParams.estado);
  const status: InquiryStatus | undefined =
    estado === "NUEVA" || estado === "LEIDA" || estado === "RESUELTA" ? estado : undefined;
  const where: Prisma.InquiryWhereInput = status ? { estado: status } : {};

  const result = await withDb(async () => {
    const total = await prisma.inquiry.count({ where });
    const totalPages = getPageCount(total);
    const page = clampPage(Number(readParam(searchParams.page) || "1"), totalPages);
    const rows = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    const items: InquiryItem[] = rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      dni: row.dni,
      calle: row.calle,
      numero: row.numero,
      piso: row.piso,
      dpto: row.dpto,
      email: row.email,
      celular: row.celular,
      tieneProblemaSalud: row.tieneProblemaSalud,
      detalleSalud: row.detalleSalud,
      consulta: row.consulta,
      estado: row.estado,
      createdAt: row.createdAt.toISOString(),
    }));
    return { items, page, totalPages, total };
  });

  if (!result.ok) return <DbAlert />;

  return (
    <InquiriesManager
      items={result.data.items}
      estado={status ?? ""}
      page={result.data.page}
      totalPages={result.data.totalPages}
      total={result.data.total}
    />
  );
}
