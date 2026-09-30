"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import type { UserListItem } from "@/lib/users";
import { roleLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import { applyFieldErrors } from "@/lib/forms";
import { createUserSchema, resetPasswordSchema, updateUserSchema } from "@/lib/validations/user";
import {
  createUser,
  resetUserPassword,
  setUserActive,
  updateUser,
} from "@/app/(dashboard)/usuarios/padron/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type CreateValues = z.infer<typeof createUserSchema>;
type UpdateValues = z.infer<typeof updateUserSchema>;
type ResetValues = z.infer<typeof resetPasswordSchema>;

const createDefaults: CreateValues = {
  nombre: "",
  apellido: "",
  email: "",
  celular: "",
  rol: "USUARIO",
  password: "",
};

export function UsersManager({
  users,
  currentUserId,
  filters,
  page,
  totalPages,
  total,
}: {
  users: UserListItem[];
  currentUserId: string;
  filters: { q: string; rol: string; activo: string };
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [resetting, setResetting] = useState<UserListItem | null>(null);
  const [confirmUser, setConfirmUser] = useState<UserListItem | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: createDefaults,
  });
  const createRole = createForm.watch("rol");
  const editForm = useForm<UpdateValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { nombre: "", apellido: "", email: "", celular: "", rol: "USUARIO" },
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  function openCreate(rol: CreateValues["rol"]) {
    setFormError(undefined);
    createForm.reset({ ...createDefaults, rol });
    setCreateOpen(true);
  }

  function openEdit(user: UserListItem) {
    setFormError(undefined);
    editForm.reset({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      celular: user.celular ?? "",
      rol: user.rol,
    });
    setEditing(user);
  }

  async function submitCreate(values: CreateValues) {
    setPending(true);
    setFormError(undefined);
    try {
      const result = await createUser(values);
      if (!result.ok) {
        setFormError(result.error);
        applyFieldErrors(createForm, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success("Usuario creado.");
      createForm.reset(createDefaults);
      setCreateOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function submitEdit(values: UpdateValues) {
    if (!editing) return;
    setPending(true);
    setFormError(undefined);
    try {
      const result = await updateUser(editing.id, values);
      if (!result.ok) {
        setFormError(result.error);
        applyFieldErrors(editForm, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success("Usuario actualizado.");
      setEditing(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function submitReset(values: ResetValues) {
    if (!resetting) return;
    setPending(true);
    setFormError(undefined);
    try {
      const result = await resetUserPassword(resetting.id, values);
      if (!result.ok) {
        setFormError(result.error);
        applyFieldErrors(resetForm, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success("Contraseña actualizada.");
      resetForm.reset({ password: "" });
      setResetting(null);
    } finally {
      setPending(false);
    }
  }

  async function confirmActive() {
    if (!confirmUser) return;
    setPending(true);
    try {
      const result = await setUserActive(confirmUser.id, !confirmUser.activo);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(confirmUser.activo ? "Usuario dado de baja." : "Usuario reactivado.");
      setConfirmUser(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Padrón"
        description={`${total} usuario${total === 1 ? "" : "s"} en el resultado.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => openCreate("USUARIO")}>
              Nuevo socio
            </Button>
            <Button type="button" onClick={() => openCreate("ADMIN")}>
              Nuevo administrador
            </Button>
          </div>
        }
      />

      <form method="get" className="mb-4 grid gap-3 md:grid-cols-[1fr_10rem_10rem_auto]">
        <div>
          <label htmlFor="q" className="mb-1 block font-condensed text-sm font-semibold uppercase tracking-wide">
            Buscar
          </label>
          <Input id="q" name="q" defaultValue={filters.q} placeholder="Nombre, apellido o email" />
        </div>
        <div>
          <label htmlFor="rol" className="mb-1 block font-condensed text-sm font-semibold uppercase tracking-wide">
            Rol
          </label>
          <Select id="rol" name="rol" defaultValue={filters.rol}>
            <option value="">Todos</option>
            <option value="ADMIN">Administrador</option>
            <option value="USUARIO">Socio</option>
          </Select>
        </div>
        <div>
          <label htmlFor="activo" className="mb-1 block font-condensed text-sm font-semibold uppercase tracking-wide">
            Estado
          </label>
          <Select id="activo" name="activo" defaultValue={filters.activo}>
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">De baja</option>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" variant="outline">
            Filtrar
          </Button>
        </div>
      </form>

      {users.length === 0 ? (
        <p className="rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          No hay usuarios con esos filtros.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-md border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 font-condensed uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-3 font-semibold">Nombre</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Celular</th>
                  <th className="px-3 py-3 font-semibold">Rol</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <p className="font-medium">
                        {user.nombre} {user.apellido}
                      </p>
                      <p className="text-xs text-muted">{formatDateTime(user.createdAt)}</p>
                    </td>
                    <td className="px-3 py-3">{user.email}</td>
                    <td className="px-3 py-3">{user.celular || "—"}</td>
                    <td className="px-3 py-3">
                      <Badge tone={user.rol === "ADMIN" ? "solid" : "gold"}>{roleLabel[user.rol]}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={user.activo ? "gold" : "muted"}>{user.activo ? "Activo" : "De baja"}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <RowActions
                        user={user}
                        isSelf={user.id === currentUserId}
                        onEdit={() => openEdit(user)}
                        onReset={() => {
                          setFormError(undefined);
                          resetForm.reset({ password: "" });
                          setResetting(user);
                        }}
                        onToggle={() => setConfirmUser(user)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {users.map((user) => (
              <li key={user.id} className="rounded-md border border-border bg-surface p-4">
                <p className="font-medium">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-sm text-muted">{user.email}</p>
                <p className="text-sm text-muted">{user.celular || "Sin celular"}</p>
                <div className="mt-2 flex gap-2">
                  <Badge tone={user.rol === "ADMIN" ? "solid" : "gold"}>{roleLabel[user.rol]}</Badge>
                  <Badge tone={user.activo ? "gold" : "muted"}>{user.activo ? "Activo" : "De baja"}</Badge>
                </div>
                <div className="mt-3">
                  <RowActions
                    user={user}
                    isSelf={user.id === currentUserId}
                    onEdit={() => openEdit(user)}
                    onReset={() => {
                      setFormError(undefined);
                      resetForm.reset({ password: "" });
                      setResetting(user);
                    }}
                    onToggle={() => setConfirmUser(user)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Pagination page={page} totalPages={totalPages} pathname="/usuarios/padron" params={filters} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createRole === "ADMIN" ? "Alta de administrador" : "Alta de socio"}</DialogTitle>
            <DialogDescription>
              {createRole === "ADMIN"
                ? "Va a poder gestionar padrón, rutinas, tesorería, consultas y carrusel. La contraseña se guarda cifrada."
                : "El socio ve sus rutinas y su perfil. La contraseña se guarda cifrada."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" noValidate onSubmit={createForm.handleSubmit(submitCreate)}>
            <FormAlert message={formError} />
            <UserFields register={createForm.register} errors={createForm.formState.errors} />
            <Field label="Contraseña" htmlFor="password" error={createForm.formState.errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" {...createForm.register("password")} />
            </Field>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Crear"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Podés cambiar datos y rol. La baja es lógica.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" noValidate onSubmit={editForm.handleSubmit(submitEdit)}>
            <FormAlert message={formError} />
            <UserFields
              register={editForm.register as unknown as UseFormRegister<CreateValues>}
              errors={editForm.formState.errors as FieldErrors<CreateValues>}
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(resetting)} onOpenChange={(open) => !open && setResetting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva contraseña</DialogTitle>
            <DialogDescription>
              {resetting ? `Para ${resetting.nombre} ${resetting.apellido}.` : "Restablecer acceso."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" noValidate onSubmit={resetForm.handleSubmit(submitReset)}>
            <FormAlert message={formError} />
            <Field label="Contraseña" htmlFor="reset-password" error={resetForm.formState.errors.password?.message}>
              <Input id="reset-password" type="password" autoComplete="new-password" {...resetForm.register("password")} />
            </Field>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Restablecer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmUser)}
        title={confirmUser?.activo ? "Dar de baja" : "Reactivar"}
        description={
          confirmUser
            ? `${confirmUser.nombre} ${confirmUser.apellido} ${confirmUser.activo ? "no va a poder ingresar." : "va a poder ingresar de nuevo."}`
            : ""
        }
        confirmLabel={confirmUser?.activo ? "Dar de baja" : "Reactivar"}
        pending={pending}
        onOpenChange={(open) => !open && setConfirmUser(null)}
        onConfirm={confirmActive}
      />
    </div>
  );
}

function UserFields({
  register,
  errors,
}: {
  register: UseFormRegister<CreateValues>;
  errors: FieldErrors<CreateValues>;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="nombre" error={errors.nombre?.message}>
          <Input id="nombre" {...register("nombre")} />
        </Field>
        <Field label="Apellido" htmlFor="apellido" error={errors.apellido?.message}>
          <Input id="apellido" {...register("apellido")} />
        </Field>
      </div>
      <Field label="Email" htmlFor="user-email" error={errors.email?.message}>
        <Input id="user-email" type="email" autoComplete="off" {...register("email")} />
      </Field>
      <Field label="Celular" htmlFor="celular" error={errors.celular?.message}>
        <Input id="celular" {...register("celular")} />
      </Field>
      <Field label="Rol" htmlFor="user-rol" error={errors.rol?.message}>
        <Select id="user-rol" {...register("rol")}>
          <option value="USUARIO">Socio</option>
          <option value="ADMIN">Administrador</option>
        </Select>
      </Field>
    </>
  );
}

function RowActions({
  user,
  isSelf,
  onEdit,
  onReset,
  onToggle,
}: {
  user: UserListItem;
  isSelf: boolean;
  onEdit: () => void;
  onReset: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        Editar
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onReset}>
        Clave
      </Button>
      <Button type="button" variant="danger" size="sm" onClick={onToggle} disabled={isSelf && user.activo}>
        {user.activo ? "Baja" : "Activar"}
      </Button>
    </div>
  );
}
