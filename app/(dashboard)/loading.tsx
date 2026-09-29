export default function DashboardLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-10 w-56 rounded-md bg-surface-2 motion-safe:animate-pulse" />
      <div className="h-24 rounded-md bg-surface motion-safe:animate-pulse" />
      <div className="h-64 rounded-md bg-surface motion-safe:animate-pulse" />
    </div>
  );
}
