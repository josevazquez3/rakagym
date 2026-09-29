"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { applyFieldErrors } from "@/lib/forms";
import { changePasswordSchema, profileSchema } from "@/lib/validations/user";
import { changePassword, updateProfile } from "@/app/(dashboard)/perfil/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormAlert } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof changePasswordSchema>;

export function ProfileForm({
  profile,
}: {
  profile: { nombre: string; apellido: string; email: string; celular: string };
}) {
  const router = useRouter();
  const [pendingProfile, setPendingProfile] = useState(false);
  const [pendingPassword, setPendingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  async function submitProfile(values: ProfileValues) {
    setPendingProfile(true);
    setProfileError(undefined);
    try {
      const result = await updateProfile(values);
      if (!result.ok) {
        setProfileError(result.error);
        applyFieldErrors(profileForm, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      toast.success("Perfil guardado. Volvé a ingresar para ver el nombre nuevo en la barra.");
      router.refresh();
    } finally {
      setPendingProfile(false);
    }
  }

  async function submitPassword(values: PasswordValues) {
    setPendingPassword(true);
    setPasswordError(undefined);
    try {
      const result = await changePassword(values);
      if (!result.ok) {
        setPasswordError(result.error);
        applyFieldErrors(passwordForm, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      passwordForm.reset({ currentPassword: "", newPassword: "" });
      toast.success("Contraseña actualizada.");
    } finally {
      setPendingPassword(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h2 className="mb-4 font-condensed text-lg font-bold uppercase tracking-wide">Datos</h2>
        <form className="space-y-3" noValidate onSubmit={profileForm.handleSubmit(submitProfile)}>
          <FormAlert message={profileError} />
          <Field label="Nombre" htmlFor="nombre" error={profileForm.formState.errors.nombre?.message}>
            <Input id="nombre" {...profileForm.register("nombre")} />
          </Field>
          <Field label="Apellido" htmlFor="apellido" error={profileForm.formState.errors.apellido?.message}>
            <Input id="apellido" {...profileForm.register("apellido")} />
          </Field>
          <Field label="Email" htmlFor="email" error={profileForm.formState.errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...profileForm.register("email")} />
          </Field>
          <Field label="Celular" htmlFor="celular" error={profileForm.formState.errors.celular?.message}>
            <Input id="celular" {...profileForm.register("celular")} />
          </Field>
          <Button type="submit" disabled={pendingProfile}>
            {pendingProfile ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </Card>
      <Card className="p-5">
        <h2 className="mb-4 font-condensed text-lg font-bold uppercase tracking-wide">Contraseña</h2>
        <form className="space-y-3" noValidate onSubmit={passwordForm.handleSubmit(submitPassword)}>
          <FormAlert message={passwordError} />
          <Field label="Actual" htmlFor="currentPassword" error={passwordForm.formState.errors.currentPassword?.message}>
            <Input id="currentPassword" type="password" autoComplete="current-password" {...passwordForm.register("currentPassword")} />
          </Field>
          <Field label="Nueva" htmlFor="newPassword" error={passwordForm.formState.errors.newPassword?.message}>
            <Input id="newPassword" type="password" autoComplete="new-password" {...passwordForm.register("newPassword")} />
          </Field>
          <Button type="submit" variant="outline" disabled={pendingPassword}>
            {pendingPassword ? "Guardando..." : "Cambiar contraseña"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
