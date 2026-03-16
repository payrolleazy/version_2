import type { ComponentPropsWithoutRef } from 'react';

export function HeroCard({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <section
      className={`rounded-[var(--radius-shell)] border border-white/70 bg-[var(--surface-strong)] p-8 shadow-[var(--shadow-soft)] ${className}`.trim()}
      {...props}
    />
  );
}
