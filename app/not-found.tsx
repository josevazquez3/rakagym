import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-styles";

export default function NotFound() {
  return (
    <main id="contenido" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="font-display text-4xl uppercase tracking-wide">Página no encontrada</h1>
      <p className="text-sm text-muted">Esa ruta no existe en RAKA GYM.</p>
      <Link href="/" className={buttonVariants()}>
        Volver al inicio
      </Link>
    </main>
  );
}
