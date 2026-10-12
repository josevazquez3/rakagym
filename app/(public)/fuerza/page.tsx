import type { Metadata } from "next";
import { DisciplinePage } from "@/components/landing/discipline-page";

export const metadata: Metadata = { title: "Fuerza" };

export default function FuerzaPage() {
  return (
    <DisciplinePage
      title="Fuerza"
      vision="La fuerza en RAKA se construye con constancia y buena técnica de levantamiento. La visión es que cada sesión sume potencia útil, con movimientos seguros, para rendir dentro del gimnasio y también fuera de él."
    />
  );
}
