"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { routineSchema } from "@/lib/validations/routine";
import { applyFieldErrors } from "@/lib/forms";
import { formatDateTime } from "@/lib/format";
import { createRoutine, deleteRoutine, updateRoutine } from "@/app/(dashboard)/rutinas/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
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
import { Textarea } from "@/components/ui/textarea";

export type RoutineCard = {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  createdAt: string;
  author: string;
  assignees: { id: string; nombre: string; apellido: string }[];
};

export type MemberOption = { id: string; nombre: string; apellido: string; email: string };

type FormValues = z.infer<typeof routineSchema>;

const emptyForm: FormValues = { titulo: "", descripcion: "", contenido: "", userIds: [] };

export function RoutinesManager({
  routines,
  members,
  canManage,
}: {
  routines: RoutineCard[];
  members: MemberOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoutineCard | null>(null);
  const [viewing, setViewing] = useState<RoutineCard | null>(null);
  const [removing, setRemoving] = useState<RoutineCard | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [query, setQuery] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(routineSchema), defaultValues: emptyForm });
  const selected = form.watch("userIds");

  const filteredMembers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) =>
      `${member.nombre} ${member.apellido} ${member.email}`.toLowerCase().includes(term),
    );
  }, [members, query]);

  function openCreate() {
    setEditing(null);
    setFormError(undefined);
    form.reset(emptyForm);
    setQuery("");
    setOpen(true);
  }

  function openEdit(routine: RoutineCard) {
    setEditing(routine);
    setFormError(undefined);
    form.reset({
      titulo: routine.titulo,
      descripcion: routine.descripcion,
      contenido: routine.contenido,
      userIds: routine.assignees.map((assignee) => assignee.id),
    });
    setQuery("");
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    setPending(true);
    setFormError(undefined);
    try {
      const result = editing ? await updateRoutine(editing.id, values) : await createRoutine(values);
      if (!result.ok) {
        setFormError(result.error);
        applyFieldErrors(form, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Rutina actualizada." : "Rutina creada.");
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
      const result = await deleteRoutine(removing.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Rutina eliminada.");
      setRemoving(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  function toggleMember(id: string) {
    const current = form.getValues("userIds");
    form.setValue(
      "userIds",
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      { shouldValidate: true },
    );
  }

  return (
    <div>
      <PageHeader
        title={canManage ? "Rutinas" : "Mis rutinas"}
        description={canManage ? "Creá planes y asignalos a los socios." : "Planes que te asignó el gimnasio."}
        action={canManage ? <Button type="button" onClick={openCreate}>Nueva rutina</Button> : undefined}
      />
      {routines.length === 0 ? (
        <p className="rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          {canManage ? "Todavía no hay rutinas." : "Todavía no tenés rutinas asignadas."}
        </p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {routines.map((routine) => (
            <li key={routine.id}>
              <Card className="flex h-full flex-col p-5">
                <h2 className="font-condensed text-xl font-bold uppercase tracking-wide">{routine.titulo}</h2>
                <p className="mt-2 text-sm text-muted">{routine.descripcion}</p>
                <p className="mt-3 text-xs text-muted">
                  {routine.author} · {formatDateTime(routine.createdAt)}
                </p>
                {canManage ? (
                  <p className="mt-2 text-sm">
                    {routine.assignees.length === 0
                      ? "Sin socios asignados"
                      : routine.assignees.map((assignee) => `${assignee.nombre} ${assignee.apellido}`).join(", ")}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setViewing(routine)}>
                    Ver
                  </Button>
                  {canManage ? (
                    <>
                      <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(routine)}>
                        Editar
                      </Button>
                      <Button type="button" variant="danger" size="sm" onClick={() => setRemoving(routine)}>
                        Eliminar
                      </Button>
                    </>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar rutina" : "Nueva rutina"}</DialogTitle>
            <DialogDescription>El contenido se muestra como texto, sin formato HTML.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <FormAlert message={formError} />
            <Field label="Título" htmlFor="titulo" error={form.formState.errors.titulo?.message}>
              <Input id="titulo" {...form.register("titulo")} />
            </Field>
            <Field label="Descripción" htmlFor="descripcion" error={form.formState.errors.descripcion?.message}>
              <Input id="descripcion" {...form.register("descripcion")} />
            </Field>
            <Field label="Contenido" htmlFor="contenido" error={form.formState.errors.contenido?.message}>
              <Textarea id="contenido" className="min-h-40" {...form.register("contenido")} />
            </Field>
            <fieldset className="space-y-2">
              <legend className="font-condensed text-sm font-semibold uppercase tracking-wide">Asignar socios</legend>
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar socio" aria-label="Buscar socio" />
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-muted">No hay socios activos.</p>
                ) : (
                  filteredMembers.map((member) => (
                    <label key={member.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 accent-gold"
                        checked={selected.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                      />
                      <span>
                        {member.nombre} {member.apellido}
                        <span className="block text-xs text-muted">{member.email}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </fieldset>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewing)} onOpenChange={(value) => !value && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.titulo}</DialogTitle>
            <DialogDescription>{viewing?.descripcion}</DialogDescription>
          </DialogHeader>
          <pre className="whitespace-pre-wrap font-sans text-sm">{viewing?.contenido}</pre>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Eliminar rutina"
        description={removing ? `Se va a borrar "${removing.titulo}" y sus asignaciones.` : ""}
        confirmLabel="Eliminar"
        pending={pending}
        onOpenChange={(value) => !value && setRemoving(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
