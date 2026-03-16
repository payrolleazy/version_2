'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import {
  candidateNavItems,
  CandidateNavItem,
  isCandidateNavActive,
} from '@/components/candidate/shell/candidateNav';

function getSuggestedAction(pathname: string): {
  title: string;
  description: string;
  href: string;
  label: string;
} {
  if (pathname === '/candidate') {
    return {
      title: 'Review your shared letters',
      description: 'Open the offer room and go straight to the latest letters shared by HR.',
      href: '/candidate/letters',
      label: 'Open offer room',
    };
  }

  if (pathname.startsWith('/candidate/documents')) {
    return {
      title: 'Continue your forms',
      description: 'After reviewing uploads, complete the remaining onboarding sections.',
      href: '/candidate/onboarding',
      label: 'Continue onboarding',
    };
  }

  if (pathname.startsWith('/candidate/onboarding')) {
    return {
      title: 'Review your offer room',
      description: 'Once your details are in place, review the latest letters and HR updates.',
      href: '/candidate/letters',
      label: 'Open offer room',
    };
  }

  if (pathname.startsWith('/candidate/letters')) {
    return {
      title: 'Review your shared letters',
      description: 'Open the offer room and go straight to the latest letters shared by HR.',
      href: '/candidate/letters',
      label: 'Open offer room',
    };
  }

  if (pathname.startsWith('/candidate/interview')) {
    return {
      title: 'Prepare for your interview',
      description: 'Use the interview console to review the schedule and join Microsoft Teams when your round is ready.',
      href: '/candidate/interview',
      label: 'Open interview console',
    };
  }

  return {
    title: 'Back to your launchpad',
    description: 'Use the launchpad as your single place to understand what needs attention next.',
    href: '/candidate',
    label: 'Go to launchpad',
  };
}

function StepItem({
  item,
  active,
}: {
  item: CandidateNavItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-all ${
        active
          ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950'
          : 'text-slate-600 hover:bg-white/90 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-950/80 dark:hover:text-white'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
          active
            ? 'bg-white/15 dark:bg-slate-950/10'
            : 'bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-900 dark:group-hover:bg-slate-800'
        }`}
      >
        {item.icon(active)}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-6">{item.label}</p>
        <p
          className={`mt-1 text-sm leading-5 ${
            active ? 'text-white/75 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {item.id === 'launchpad'
            ? 'Your guided home'
            : item.id === 'documents'
              ? 'Upload and review proofs'
              : item.id === 'onboarding'
                ? 'Finish your details'
                : item.id === 'letters'
                  ? 'Review HR letters'
                  : item.id === 'interview'
                    ? 'Join your next round'
                    : 'Account and day-zero view'}
        </p>
      </div>
    </Link>
  );
}

export function CandidateSidebarPanels() {
  const pathname = usePathname();
  const router = useRouter();
  const suggestion = getSuggestedAction(pathname);

  return (
    <div className="grid h-full gap-5 [grid-template-rows:auto_minmax(0,1fr)]">
      <div className="flex flex-col rounded-[1.7rem] border border-white/60 bg-white/80 p-4 shadow-xl shadow-sky-900/5 backdrop-blur dark:border-white/5 dark:bg-slate-950/80 dark:shadow-none">
        <div className="space-y-2">
          {candidateNavItems.map((item) => (
            <StepItem
              key={item.id}
              item={item}
              active={isCandidateNavActive(pathname, item.href)}
            />
          ))}
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-col justify-between rounded-[1.7rem] border border-sky-200/70 bg-gradient-to-br from-sky-600 via-cyan-600 to-indigo-700 p-5 text-white shadow-xl shadow-sky-900/10 dark:border-white/5 dark:shadow-none">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/80">
          Start Here
        </p>
        <div className="mt-3.5 flex-1">
          <h3 className="text-xl font-black">{suggestion.title}</h3>
          <p className="mt-3 text-sm leading-5 text-cyan-50/90">{suggestion.description}</p>
        </div>
        <div className="mt-5">
          <CandidateActionButton variant="secondary" block onClick={() => router.push(suggestion.href)}>
            {suggestion.label}
          </CandidateActionButton>
        </div>
      </div>
    </div>
  );
}

export default function CandidateSidebar() {
  return (
    <aside className="sticky top-24 w-full">
      <CandidateSurfaceCard className="h-full overflow-hidden p-0">
        <CandidateSidebarPanels />
      </CandidateSurfaceCard>
    </aside>
  );
}
