export function StatusChip({ tone, children }: { tone: 'info' | 'success' | 'warning'; children: React.ReactNode }) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : tone === 'warning'
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-sky-100 text-sky-700 border-sky-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${toneClass}`.trim()}>
      {children}
    </span>
  );
}
