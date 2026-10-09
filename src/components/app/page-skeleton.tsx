export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Carregando">
      <div className="h-4 w-24 rounded-pill bg-surface" />
      <div className="h-8 w-3/4 rounded-pill bg-surface" />
      <div className="mx-auto size-52 rounded-pill bg-surface" />
      <div className="h-24 rounded-lg bg-surface" />
    </div>
  );
}
