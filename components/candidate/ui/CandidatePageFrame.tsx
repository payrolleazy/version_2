'use client';

import { useCandidateShell } from '@/components/candidate/shell/CandidateShellContext';
import PWAHeader from '@/components/pwa/PWAHeader';

export default function CandidatePageFrame({
  children,
  isPWA,
  title,
  subtitle,
  containerClassName = 'max-w-7xl',
}: {
  children: React.ReactNode;
  isPWA?: boolean;
  title?: string;
  subtitle?: string;
  containerClassName?: string;
}) {
  const shell = useCandidateShell();
  const resolvedIsPWA = isPWA ?? shell.isPWA;
  const contentPaddingClass = resolvedIsPWA ? 'px-5 pb-12 pt-7 sm:px-7 lg:px-10' : 'px-0 pb-10 pt-0';

  return (
    <div className="min-h-screen bg-transparent">
      {resolvedIsPWA && title ? <PWAHeader title={title} subtitle={subtitle} /> : null}
      <div className={`mx-auto ${containerClassName} ${contentPaddingClass}`.trim()}>{children}</div>
    </div>
  );
}
