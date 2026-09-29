export function DbAlert() {
  return (
    <div role="alert" className="rounded-md border border-ember bg-surface px-4 py-3 text-sm text-foreground">
      No pudimos conectar con la base de datos. Revisá DATABASE_URL y que las migraciones estén aplicadas.
    </div>
  );
}
