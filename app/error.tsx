"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void _error;
  return (
    <main id="contenido" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="font-display text-4xl uppercase tracking-wide">Algo salió mal</h1>
      <p className="max-w-md text-sm text-muted">No pudimos completar la acción. Probá de nuevo en un momento.</p>
      <Button type="button" onClick={reset}>
        Reintentar
      </Button>
    </main>
  );
}
