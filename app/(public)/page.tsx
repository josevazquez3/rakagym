import { Dumbbell, Zap } from "lucide-react";
import { prisma } from "@/lib/db";
import { BoxingGlove } from "@/components/brand/boxing-glove";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { InquiryDialog } from "@/components/landing/inquiry-dialog";
import { SectionTitle } from "@/components/landing/section-title";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const pillars = [
  {
    title: "Fuerza",
    text: "Sesiones para construir potencia y técnica de levantamiento.",
    icon: Dumbbell,
  },
  {
    title: "Rendimiento",
    text: "Trabajo de acondicionamiento para rendir dentro y fuera del ring.",
    icon: Zap,
  },
  {
    title: "Boxeo",
    text: "Guantes, timing y combates guiados por el equipo del gimnasio.",
    icon: BoxingGlove,
  },
] as const;

async function loadSlides() {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await prisma.carouselImage.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: { id: true, url: true, alt: true },
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage() {
  const slides = await loadSlides();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="contenido">
        <HeroCarousel images={slides} />
        <section className="brand-grain border-y border-border bg-surface">
          <div className="relative z-[1] mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-16 text-center">
            <SectionTitle>Entrená en RAKA</SectionTitle>
            <p className="max-w-2xl text-base text-muted sm:text-lg">
              Fuerza, rendimiento y boxeo en un mismo lugar. Escribinos y te respondemos para coordinar tu primera clase.
            </p>
            <InquiryDialog />
            <ul className="grid w-full gap-4 text-left sm:grid-cols-3">
              {pillars.map((pillar) => (
                <li key={pillar.title}>
                  <Card interactive className="h-full p-5">
                    <pillar.icon className="h-6 w-6 text-gold" />
                    <h3 className="mt-3 font-condensed text-lg font-bold uppercase tracking-wide">{pillar.title}</h3>
                    <p className="mt-2 text-sm text-muted">{pillar.text}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
