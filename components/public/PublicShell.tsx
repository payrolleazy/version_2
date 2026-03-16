import type { ReactNode } from 'react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background-accent)] text-[var(--foreground)]">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
