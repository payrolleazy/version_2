import type { ReactNode } from 'react';

export function PublicValueChip({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-sky-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[var(--shadow-card)]">
      {children}
    </div>
  );
}
