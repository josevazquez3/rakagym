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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FormAlert } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof inquirySchema>;

const defaults: FormValues = {
  nombre: "",
  apellido: "",
  email: "",
  celular: "",
  tieneProblemaSalud: "no",
  detalleSalud: "",
  consulta: "",
};

export function InquiryDialog() {
  const [open, setOpen] = useState(false);
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
      toast.success("Consulta enviada. Te vamos a responder a la brevedad.");
      form.reset(defaults);
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Consultas</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Consulta</DialogTitle>
          <DialogDescription>Dejanos tus datos y te contactamos desde RAKA GYM.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FormAlert message={formError} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="nombre" error={form.formState.errors.nombre?.message}>
              <Input id="nombre" autoComplete="given-name" aria-invalid={Boolean(form.formState.errors.nombre)} {...form.register("nombre")} />
            </Field>
            <Field label="Apellido" htmlFor="apellido" error={form.formState.errors.apellido?.message}>
              <Input id="apellido" autoComplete="family-name" aria-invalid={Boolean(form.formState.errors.apellido)} {...form.register("apellido")} />
            </Field>
          </div>
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
                <input type="radio" value="no" className="accent-gold" {...form.register("tieneProblemaSalud")} />
                No
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="si" className="accent-gold" {...form.register("tieneProblemaSalud")} />
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
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
