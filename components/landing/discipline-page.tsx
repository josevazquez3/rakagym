import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { InquiryDialog } from "@/components/landing/inquiry-dialog";
import { SectionTitle } from "@/components/landing/section-title";

export function DisciplinePage({
  title,
  vision,
}: {
  title: string;
  vision: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="contenido" className="pt-[4.5rem]">
        <section className="hero-stage relative flex min-h-[70svh] items-center justify-center border-b border-border px-6 py-16">
          <Image
            src="/brand/logo.png"
            alt={`Foto de ${title} en RAKA GYM`}
            width={640}
            height={640}
            priority
            className="h-72 w-72 rounded-full object-cover shadow-gold sm:h-96 sm:w-96"
          />
        </section>
        <section className="brand-grain bg-surface">
          <div className="relative z-[1] mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-16 text-center">
            <SectionTitle as="h1">Mi visión</SectionTitle>
            <p className="max-w-2xl text-base text-muted sm:text-lg">{vision}</p>
            <InquiryDialog trigger="empezar" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
