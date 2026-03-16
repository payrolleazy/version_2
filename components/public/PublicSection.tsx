import type { ComponentPropsWithoutRef } from 'react';
import { SurfaceCard } from '@/components/ui/SurfaceCard';

export function PublicSection({ className = '', ...props }: ComponentPropsWithoutRef<'section'>) {
  return <section className={`space-y-5 ${className}`.trim()} {...props} />;
}

export function PublicSectionCard({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <SurfaceCard className={`overflow-hidden p-8 sm:p-10 ${className}`.trim()} {...props} />;
}
