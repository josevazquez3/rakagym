"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/format";
import { inquiryLabel } from "@/lib/labels";
import { updateInquiryStatus } from "@/app/(dashboard)/consultas/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export type InquiryItem = {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  calle: string;
  numero: string;
  piso: string | null;
  dpto: string | null;
  email: string;
  celular: string;
  tieneProblemaSalud: boolean;
  detalleSalud: string | null;
  consulta: string;
  estado: "NUEVA" | "LEIDA" | "RESUELTA";
  createdAt: string;
};

const statuses = ["NUEVA", "LEIDA", "RESUELTA"] as const;

export function InquiriesManager({
  items,
  estado,
  page,
  totalPages,
  total,
}: {
  items: InquiryItem[];
  estado: string;
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function changeStatus(id: string, next: InquiryItem["estado"]) {
    setPendingId(id);
    try {
      const result = await updateInquiryStatus(id, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Estado actualizado.");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Consultas" description={`${total} consulta${total === 1 ? "" : "s"} recibidas.`} />
      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <label htmlFor="estado" className="mb-1 block font-condensed text-sm font-semibold uppercase tracking-wide">
            Estado
          </label>
          <Select id="estado" name="estado" defaultValue={estado}>
            <option value="">Todas</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {inquiryLabel[status]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">Filtrar</Button>
      </form>
      {items.length === 0 ? (
        <p className="rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          No hay consultas en esta bandeja.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-condensed text-lg font-bold uppercase tracking-wide">
                      {item.nombre} {item.apellido}
                    </p>
                    <p className="text-sm text-muted">
                      {item.email} · {item.celular}
                      {item.dni ? ` · DNI ${item.dni}` : ""}
                    </p>
                    {item.calle ? (
                      <p className="text-sm text-muted">
                        {item.calle} {item.numero}
                        {item.piso ? `, piso ${item.piso}` : ""}
                        {item.dpto ? `, dpto ${item.dpto}` : ""}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted">{formatDateTime(item.createdAt)}</p>
                  </div>
                  <Badge tone={item.estado === "NUEVA" ? "solid" : item.estado === "RESUELTA" ? "muted" : "gold"}>
                    {inquiryLabel[item.estado]}
                  </Badge>
                </div>
                {item.tieneProblemaSalud ? (
                  <p className="mt-3 rounded-md border border-ember bg-ember px-3 py-2 text-sm text-white">
                    Problema de salud: {item.detalleSalud}
                  </p>
                ) : null}
                {item.consulta ? <p className="mt-3 whitespace-pre-wrap text-sm">{item.consulta}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={item.estado === status ? "default" : "outline"}
                      aria-pressed={item.estado === status}
                      disabled={pendingId === item.id || item.estado === status}
                      onClick={() => changeStatus(item.id, status)}
                    >
                      {inquiryLabel[status]}
                    </Button>
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} totalPages={totalPages} pathname="/consultas" params={{ estado }} />
    </div>
  );
}
