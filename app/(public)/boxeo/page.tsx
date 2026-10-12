import type { Metadata } from "next";
import { DisciplinePage } from "@/components/landing/discipline-page";

export const metadata: Metadata = { title: "Boxeo" };

export default function BoxeoPage() {
  return (
    <DisciplinePage
      title="Boxeo"
      vision="El boxeo en RAKA es técnica, timing y respeto por el ring. La visión es que cada persona entre a entrenar con una guardia clara, aprenda a moverse y pegue con intención, acompañada de cerca por el equipo del gimnasio."
    />
  );
}
