import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-styles";

export function Pagination({
  page,
  totalPages,
  pathname,
  params,
}: {
  page: number;
  totalPages: number;
  pathname: string;
  params: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  function href(nextPage: number) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    search.set("page", String(nextPage));
    return `${pathname}?${search.toString()}`;
  }

  const linkClass = buttonVariants({ variant: "outline", size: "sm" });
  const disabledClass = `${linkClass} pointer-events-none opacity-40`;

  return (
    <nav aria-label="Paginación" className="mt-4 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass}>
          Anterior
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Anterior
        </span>
      )}
      <p className="text-sm text-muted">
        Página {page} de {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkClass}>
          Siguiente
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Siguiente
        </span>
      )}
    </nav>
  );
}
