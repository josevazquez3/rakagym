"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/permissions";
import { BlobUploadError, deleteCarouselBlob, uploadCarouselImage } from "@/lib/blob";
import { getClientIp } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { handleActionError, zodFailure, type ActionResult } from "@/lib/action";
import { carouselAltSchema } from "@/lib/validations/carousel";

const PATH = "/carrusel";

export async function uploadCarousel(formData: FormData): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const limit = rateLimit(`carousel:${getClientIp()}`, 20, 60 * 60 * 1000);
    if (!limit.ok) {
      return { ok: false, error: `Demasiadas cargas. Probá en ${limit.retryAfterSeconds} segundos.` };
    }

    const parsed = carouselAltSchema.safeParse({ alt: formData.get("alt") });
    if (!parsed.success) return zodFailure(parsed.error);
    const file = formData.get("file");
    if (!(file instanceof File)) return { ok: false, error: "Elegí una imagen." };

    const blob = await uploadCarouselImage(file);
    const last = await prisma.carouselImage.aggregate({ _max: { orden: true } });
    await prisma.carouselImage.create({
      data: {
        url: blob.url,
        alt: parsed.data.alt,
        orden: (last._max.orden ?? -1) + 1,
        activo: true,
      },
    });
    revalidatePath(PATH);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    if (error instanceof BlobUploadError) return { ok: false, error: error.message };
    return handleActionError(error, "No se pudo subir la imagen.");
  }
}

export async function moveCarousel(id: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const images = await prisma.carouselImage.findMany({ orderBy: [{ orden: "asc" }, { id: "asc" }] });
    const index = images.findIndex((image) => image.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    const current = images[index];
    if (!current || target < 0 || target >= images.length) return { ok: true };
    const next = [...images];
    const [item] = next.splice(index, 1);
    if (!item) return { ok: true };
    next.splice(target, 0, item);
    await prisma.$transaction(
      next.map((image, orden) => prisma.carouselImage.update({ where: { id: image.id }, data: { orden } })),
    );
    revalidatePath(PATH);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo reordenar la imagen.");
  }
}

export async function setCarouselActive(id: string, activo: boolean): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    await prisma.carouselImage.update({ where: { id }, data: { activo } });
    revalidatePath(PATH);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo actualizar la imagen.");
  }
}

export async function deleteCarousel(id: string): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const image = await prisma.carouselImage.findUnique({ where: { id } });
    if (!image) return { ok: false, error: "La imagen no existe." };
    await deleteCarouselBlob(image.url);
    await prisma.carouselImage.delete({ where: { id } });
    revalidatePath(PATH);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return handleActionError(error, "No se pudo eliminar la imagen.");
  }
}
