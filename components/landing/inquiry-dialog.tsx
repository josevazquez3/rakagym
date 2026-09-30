"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { inquirySchema } from "@/lib/validations/inquiry";
import { applyFieldErrors } from "@/lib/forms";
import { createInquiry } from "@/app/(public)/actions";
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
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof inquirySchema>;

const defaults: FormValues = {
  nombre: "",
  apellido: "",
  dni: "",
  calle: "",
  numero: "",
  piso: "",
  dpto: "",
  email: "",
  celular: "",
  tieneProblemaSalud: "no",
  detalleSalud: "",
  consulta: "",
};

export function InquiryDialog() {
  const [open, setOpen] = useState(false);
  const [thanksOpen, setThanksOpen] = useState(false);
  const [accent, setAccent] = useState<"gold" | "green">("gold");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const form = useForm<FormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: defaults,
  });
  const health = form.watch("tieneProblemaSalud");
  const consulta = form.watch("consulta");

  async function onSubmit(values: FormValues) {
    setPending(true);
    setFormError(undefined);
    try {
      const result = await createInquiry(values);
      if (!result.ok) {
        setFormError(result.error);
        applyFieldErrors(form, result.fieldErrors);
        toast.error(result.error);
        return;
      }
      form.reset(defaults);
      setOpen(false);
      setThanksOpen(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          size="lg"
          onClick={() => {
            setAccent("gold");
            setOpen(true);
          }}
        >
          Consultas
        </Button>
        <Button
          type="button"
          size="lg"
          variant="green"
          onClick={() => {
            setAccent("green");
            setOpen(true);
          }}
        >
          Quiero empezar
        </Button>
      </div>
      <DialogContent className={accent === "green" ? "shadow-[0_0_24px_color-mix(in_srgb,var(--green)_28%,transparent)]" : undefined}>
        <DialogHeader>
          <DialogTitle>Consulta</DialogTitle>
          <DialogDescription>Dejanos tus datos y te contactamos desde RAKA GYM.</DialogDescription>
        </DialogHeader>
        <form
          className={accent === "green" ? "inquiry-green space-y-4" : "space-y-4"}
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="nombre" error={form.formState.errors.nombre?.message}>
              <Input id="nombre" autoComplete="given-name" aria-invalid={Boolean(form.formState.errors.nombre)} {...form.register("nombre")} />
            </Field>
            <Field label="Apellido" htmlFor="apellido" error={form.formState.errors.apellido?.message}>
              <Input id="apellido" autoComplete="family-name" aria-invalid={Boolean(form.formState.errors.apellido)} {...form.register("apellido")} />
            </Field>
            <Field label="DNI" htmlFor="dni" error={form.formState.errors.dni?.message}>
              <Input id="dni" inputMode="numeric" autoComplete="off" maxLength={10} aria-invalid={Boolean(form.formState.errors.dni)} {...form.register("dni")} />
            </Field>
          </div>
          <fieldset className="space-y-3">
            <legend className="font-condensed text-sm font-semibold uppercase tracking-wide">Dirección</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Calle" htmlFor="calle" error={form.formState.errors.calle?.message}>
                <Input id="calle" autoComplete="address-line1" aria-invalid={Boolean(form.formState.errors.calle)} {...form.register("calle")} />
              </Field>
              <Field label="Número" htmlFor="numero" error={form.formState.errors.numero?.message}>
                <Input id="numero" autoComplete="off" aria-invalid={Boolean(form.formState.errors.numero)} {...form.register("numero")} />
              </Field>
              <Field label="Piso" htmlFor="piso" error={form.formState.errors.piso?.message}>
                <Input id="piso" autoComplete="off" aria-invalid={Boolean(form.formState.errors.piso)} {...form.register("piso")} />
              </Field>
              <Field label="Dpto" htmlFor="dpto" error={form.formState.errors.dpto?.message}>
                <Input id="dpto" autoComplete="off" aria-invalid={Boolean(form.formState.errors.dpto)} {...form.register("dpto")} />
              </Field>
            </div>
          </fieldset>
          <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
          </Field>
          <Field label="Celular" htmlFor="celular" error={form.formState.errors.celular?.message}>
            <Input id="celular" type="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.celular)} {...form.register("celular")} />
          </Field>
          <fieldset className="space-y-2">
            <legend className="font-condensed text-sm font-semibold uppercase tracking-wide">¿Tiene algún problema de salud?</legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="no" className={accent === "green" ? "accent-green" : "accent-gold"} {...form.register("tieneProblemaSalud")} />
                No
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="si" className={accent === "green" ? "accent-green" : "accent-gold"} {...form.register("tieneProblemaSalud")} />
                Sí
              </label>
            </div>
          </fieldset>
          {health === "si" ? (
            <Field label="¿Cuál?" htmlFor="detalleSalud" error={form.formState.errors.detalleSalud?.message}>
              <Input id="detalleSalud" aria-invalid={Boolean(form.formState.errors.detalleSalud)} {...form.register("detalleSalud")} />
            </Field>
          ) : null}
          <Field label="Consulta" htmlFor="consulta" error={form.formState.errors.consulta?.message}>
            <Textarea id="consulta" maxLength={1000} aria-invalid={Boolean(form.formState.errors.consulta)} {...form.register("consulta")} />
            <p className="text-right text-xs text-muted">{consulta.length}/1000</p>
          </Field>
          <FormAlert message={formError} />
          <Button type="submit" className="w-full" variant={accent === "green" ? "green" : "default"} disabled={pending}>
            {pending ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={thanksOpen} onOpenChange={setThanksOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Muchas gracias</DialogTitle>
          <DialogDescription className="text-base text-foreground">
            Muchas gracias por elegirnos, a la brevedad nos pondremos en contacto
          </DialogDescription>
        </DialogHeader>
        <Button type="button" className="w-full" variant={accent === "green" ? "green" : "default"} onClick={() => setThanksOpen(false)}>
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
    </>
  );
}
