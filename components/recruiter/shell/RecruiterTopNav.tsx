'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import { BrandSourceBox } from '@/components/BrandSourceBox';
import { useRecruiterLogout } from '@/hooks/useRecruiterLogout';

const DeferredRecruiterNotificationsPopover = dynamic(
  () => import('@/components/recruiter/shell/RecruiterNotificationsPopover'),
  {
    ssr: false,
    loading: () => (
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-950/80" />
    ),
  },
);

const routeLabels: Array<{ match: (pathname: string) => boolean; label: string }> = [
  { match: (pathname) => pathname === '/recruiter', label: 'Dashboard' },
  { match: (pathname) => pathname.startsWith('/recruiter/queue'), label: 'My Queue' },
  { match: (pathname) => pathname.startsWith('/recruiter/calendar'), label: 'Calendar' },
  { match: (pathname) => pathname.startsWith('/recruiter/requisitions'), label: 'Requisitions' },
  { match: (pathname) => pathname.startsWith('/recruiter/pipeline'), label: 'Pipeline' },
  { match: (pathname) => pathname.startsWith('/recruiter/interviews'), label: 'Interviews' },
  { match: (pathname) => pathname.startsWith('/recruiter/offers'), label: 'Offers' },
  { match: (pathname) => pathname.startsWith('/recruiter/conversions'), label: 'Conversions' },
  { match: (pathname) => pathname.startsWith('/recruiter/analytics'), label: 'Analytics' },
  { match: (pathname) => pathname.startsWith('/recruiter/settings'), label: 'Settings' },
];

function getRouteLabel(pathname: string) {
  return routeLabels.find((item) => item.match(pathname))?.label ?? 'Recruiter Portal';
}

export default function RecruiterTopNav() {
  const pathname = usePathname();
  const { loggingOut, logout } = useRecruiterLogout();
  const [navReady, setNavReady] = useState(false);
  const routeLabel = getRouteLabel(pathname);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNavReady(true);
    }, 140);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1460px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <Link href="/recruiter" className="inline-flex items-center pl-5">
            <BrandSourceBox className="max-w-full shadow-[0_6px_14px_rgba(15,23,42,0.1)]" />
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="rounded-full border border-slate-200 bg-white/70 px-5 py-2.5 text-base font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
            Current page: <span className="text-slate-950 dark:text-white">{routeLabel}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {navReady ? (
            <DeferredRecruiterNotificationsPopover />
          ) : (
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-950/80" />
          )}
          <CandidateActionButton variant="outline" size="sm" onClick={logout} isLoading={loggingOut}>
            {loggingOut ? 'Signing out...' : 'Logout'}
          </CandidateActionButton>
        </div>
      </div>
    </header>
  );
}
