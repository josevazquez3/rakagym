"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteCarousel,
  moveCarousel,
  setCarouselActive,
  uploadCarousel,
} from "@/app/(dashboard)/carrusel/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export type CarouselItem = {
  id: string;
  url: string;
  alt: string;
  activo: boolean;
};

export function CarouselManager({ images }: { images: CarouselItem[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [removing, setRemoving] = useState<CarouselItem | null>(null);
  const [error, setError] = useState<string>();

  async function onUpload(formData: FormData) {
    setPending(true);
    setError(undefined);
    try {
      const result = await uploadCarousel(formData);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success("Imagen publicada en el carrusel.");
      router.refresh();
      return true;
    } finally {
      setPending(false);
    }
  }

  async function move(id: string, direction: "up" | "down") {
    const result = await moveCarousel(id, direction);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function toggle(id: string, activo: boolean) {
    const result = await setCarouselActive(id, activo);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function confirmDelete() {
    if (!removing) return;
    setPending(true);
    try {
      const result = await deleteCarousel(removing.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Imagen eliminada.");
      setRemoving(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Carrusel"
        description="Las fotos se guardan en Vercel Blob. Solo las activas aparecen en la portada."
      />
      <Card className="mb-6 p-5">
        <form
          className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const uploaded = await onUpload(new FormData(form));
            if (uploaded) form.reset();
          }}
        >
          <Field label="Imagen" htmlFor="file">
            <Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
          </Field>
          <Field label="Texto alternativo" htmlFor="alt">
            <Input id="alt" name="alt" maxLength={140} required />
          </Field>
          <Button type="submit" disabled={pending}>{pending ? "Subiendo..." : "Subir"}</Button>
        </form>
        {error ? <p role="alert" className="mt-3 text-sm text-gold-light">{error}</p> : null}
      </Card>
      {images.length === 0 ? (
        <p className="rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
          Todavía no hay fotos en el carrusel.
        </p>
      ) : (
        <ul className="space-y-3">
          {images.map((image, index) => (
            <li key={image.id}>
              <Card className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
                <div className="relative h-24 w-full overflow-hidden rounded-md bg-surface-2 sm:w-40">
                  <Image src={image.url} alt={image.alt} fill sizes="160px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{image.alt}</p>
                  <p className="text-xs text-muted">Orden {index + 1}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={image.activo}
                      onCheckedChange={(checked) => toggle(image.id, checked)}
                      aria-label={image.activo ? "Desactivar imagen" : "Activar imagen"}
                    />
                    {image.activo ? "Activa" : "Oculta"}
                  </label>
                  <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => move(image.id, "up")}>
                    Subir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === images.length - 1}
                    onClick={() => move(image.id, "down")}
                  >
                    Bajar
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => setRemoving(image)}>
                    Eliminar
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        title="Eliminar imagen"
        description="Se borra del carrusel y del almacenamiento."
        confirmLabel="Eliminar"
        pending={pending}
        onOpenChange={(value) => !value && setRemoving(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
