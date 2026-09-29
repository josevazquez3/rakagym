import { requirePageRole } from "@/lib/auth/permissions";
import { prisma, withDb } from "@/lib/db";
import { DbAlert } from "@/components/dashboard/db-alert";
import { CarouselManager } from "@/components/dashboard/carousel-manager";

export const metadata = { title: "Carrusel" };

export default async function CarouselPage() {
  await requirePageRole(["ADMIN"]);
  const result = await withDb(() =>
    prisma.carouselImage.findMany({
      orderBy: [{ orden: "asc" }, { id: "asc" }],
      select: { id: true, url: true, alt: true, activo: true },
    }),
  );

  if (!result.ok) return <DbAlert />;
  return <CarouselManager images={result.data} />;
}
