"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { transactionSchema } from "@/lib/validations/transaction";
import { applyFieldErrors } from "@/lib/forms";
import { formatDateOnly, formatMoney } from "@/lib/format";
import { txStatusLabel, txTypeLabel } from "@/lib/labels";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/app/(dashboard)/tesoreria/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FormAlert } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type TxItem = {
  id: string;
  userId: string;
  socio: string;
  tipo: "INGRESO" | "EGRESO";
  concepto: string;
  monto: string;
  fecha: string;
  fechaInput: string;
  estado: "PENDIENTE" | "PAGADO" | "ANULADO";
};

export type TxFilters = {
  desde: string;
  hasta: string;
  estado: string;
  tipo: string;
  socio: string;
};

type FormValues = z.infer<typeof transactionSchema>;

const emptyForm: FormValues = {
  userId: "",
  tipo: "INGRESO",
  concepto: "",
  monto: "",
  fecha: "",
  estado: "PENDIENTE",
};

export function TreasuryManager({
  items,
  members,
  filters,
  totals,
  page,
  totalPages,
  total,
}: {
  items: TxItem[];
  members: { id: string; nombre: string; apellido: string }[];
  filters: TxFilters;
  totals: { ingresos: string; egresos: string; balance: string };
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TxItem | null>(null);
  const [removing, setRemoving] = useState<TxItem | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const form = useForm<FormValues>({ resolver: zodResolver(transactionSchema), defaultValues: emptyForm });

  function openCreate() {
    setEditing(null);
    setFormError(undefined);
    form.reset({ ...emptyForm, fecha: new Date().toISOString().slice(0, 10) });
    setOpen(true);
  }

  function openEdit(item: TxItem) {
    setEditing(item);
    setFormError(undefined);
    form.reset({
      userId: item.userId,
      tipo: item.tipo,
      concepto: item.concepto,
      monto: item.monto,
      fecha: item.fechaInput,
      estado: item.estado,
    });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    setPending(true);
    setFormError(undefined);
    try {
      const result = editing ? await updateTransaction(editing.id, values) : await createTransaction(values);
      if (!result.ok) {
        setFormError(result.error);
        applyFieldErrors(form, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Movimiento actualizado." : "Movimiento registrado.");
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (!removing) return;
    setPending(true);
    try {
      const result = await deleteTransaction(removing.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Movimiento eliminado.");
      setRemoving(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Tesorería"
        description={`${total} movimiento${total === 1 ? "" : "s"}. Los totales excluyen anulados, salvo que filtres ese estado.`}
        action={<Button type="button" onClick={openCreate}>Nuevo movimiento</Button>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Ingresos</p>
          <p className="mt-1 font-display text-2xl text-gold">{formatMoney(totals.ingresos)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Egresos</p>
          <p className="mt-1 font-display text-2xl">{formatMoney(totals.egresos)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Balance</p>
          <p className="mt-1 font-display text-2xl text-gold-light">{formatMoney(totals.balance)}</p>
        </Card>
      </div>

      <form method="get" className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Field label="Desde" htmlFor="desde">
          <Input id="desde" name="desde" type="date" defaultValue={filters.desde} />
        </Field>
        <Field label="Hasta" htmlFor="hasta">
          <Input id="hasta" name="hasta" type="date" defaultValue={filters.hasta} />
        </Field>
        <Field label="Tipo" htmlFor="tipo">
          <Select id="tipo" name="tipo" defaultValue={filters.tipo}>
            <option value="">Todos</option>
            <option value="INGRESO">Ingreso</option>
            <option value="EGRESO">Egreso</option>
          </Select>
        </Field>
        <Field label="Estado" htmlFor="estado">
          <Select id="estado" name="estado" defaultValue={filters.estado}>
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADO">Pagado</option>
            <option value="ANULADO">Anulado</option>
          </Select>
        </Field>
        <Field label="Socio" htmlFor="socio">
          <Select id="socio" name="socio" defaultValue={filters.socio}>
            <option value="">Todos</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.apellido}, {member.nombre}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="outline">Filtrar</Button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          No hay movimientos con esos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-2 font-condensed uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Concepto</th>
                <th className="px-3 py-3">Socio</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Monto</th>
                <th className="px-3 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-3">{formatDateOnly(item.fecha)}</td>
                  <td className="px-3 py-3">{item.concepto}</td>
                  <td className="px-3 py-3">{item.socio || "—"}</td>
                  <td className="px-3 py-3">
                    <Badge tone={item.tipo === "INGRESO" ? "solid" : "gold"}>{txTypeLabel[item.tipo]}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={item.estado === "ANULADO" ? "muted" : "gold"}>{txStatusLabel[item.estado]}</Badge>
                  </td>
                  <td className="px-3 py-3">{formatMoney(item.monto)}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(item)}>Editar</Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => setRemoving(item)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} pathname="/tesoreria" params={filters} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
            <DialogDescription>Asociá el pago a un socio o dejalo general.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <FormAlert message={formError} />
            <Field label="Concepto" htmlFor="concepto" error={form.formState.errors.concepto?.message}>
              <Input id="concepto" {...form.register("concepto")} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Monto" htmlFor="monto" error={form.formState.errors.monto?.message}>
                <Input id="monto" inputMode="decimal" {...form.register("monto")} />
              </Field>
              <Field label="Fecha" htmlFor="fecha" error={form.formState.errors.fecha?.message}>
                <Input id="fecha" type="date" {...form.register("fecha")} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tipo" htmlFor="tx-tipo" error={form.formState.errors.tipo?.message}>
                <Select id="tx-tipo" {...form.register("tipo")}>
                  <option value="INGRESO">Ingreso</option>
                  <option value="EGRESO">Egreso</option>
                </Select>
              </Field>
              <Field label="Estado" htmlFor="tx-estado" error={form.formState.errors.estado?.message}>
                <Select id="tx-estado" {...form.register("estado")}>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="PAGADO">Pagado</option>
                  <option value="ANULADO">Anulado</option>
                </Select>
              </Field>
            </div>
            <Field label="Socio" htmlFor="userId">
              <Select id="userId" {...form.register("userId")}>
                <option value="">Sin socio</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.apellido}, {member.nombre}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Eliminar movimiento"
        description={removing ? `Se va a borrar "${removing.concepto}".` : ""}
        confirmLabel="Eliminar"
        pending={pending}
        onOpenChange={(value) => !value && setRemoving(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
