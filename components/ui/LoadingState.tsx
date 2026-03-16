export function LoadingState({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-4 rounded-full border border-slate-200/80 bg-white px-6 py-4 shadow-[var(--shadow-card)]">
        <span className="h-3 w-3 animate-pulse rounded-full bg-sky-500" />
        <p className="text-sm font-semibold text-slate-700">{label}</p>
      </div>
    </div>
  );
}
