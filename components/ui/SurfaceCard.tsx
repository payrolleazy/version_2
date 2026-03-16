import type { ComponentPropsWithoutRef } from 'react';

export function SurfaceCard({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] ${className}`.trim()}
      {...props}
    />
  );
}
