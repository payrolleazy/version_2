'use client';

import { usePathname, useRouter } from 'next/navigation';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import RecruiterSidebarMenu from '@/components/recruiter/shell/RecruiterSidebarMenu';

function getSuggestedAction(pathname: string) {
  if (pathname === '/recruiter') {
    return {
      title: 'Review recruiter queue',
      description: 'Start with the queue to see interviews, offers, and conversions that need action now.',
      href: '/recruiter/queue',
      label: 'Open my queue',
    };
  }

  if (pathname.startsWith('/recruiter/pipeline')) {
    return {
      title: 'Check candidate movement',
      description: 'Keep stage transitions moving so open requisitions do not stall.',
      href: '/recruiter/pipeline',
      label: 'Open pipeline',
    };
  }

  if (pathname.startsWith('/recruiter/requisitions')) {
    return {
      title: 'Inspect owned requisitions',
      description: 'Use requisitions as the control center for demand, ownership, and stage health.',
      href: '/recruiter/requisitions',
      label: 'Open requisitions',
    };
  }

  return {
    title: 'Back to the workbench',
    description: 'Use the dashboard as your operating home for requisitions, pipeline, and conversion flow.',
    href: '/recruiter',
    label: 'Open dashboard',
  };
}

export function RecruiterSidebarPanels() {
  const pathname = usePathname();
  const router = useRouter();
  const suggestion = getSuggestedAction(pathname);

  return (
    <>
      <div className="flex flex-col rounded-[1.7rem] border border-white/60 bg-white/80 p-4 shadow-xl shadow-sky-900/5 backdrop-blur dark:border-white/5 dark:bg-slate-950/80 dark:shadow-none">
        <RecruiterSidebarMenu />
      </div>

      <div className="flex h-full min-h-0 flex-col justify-between rounded-[1.7rem] border border-sky-200/70 bg-gradient-to-br from-sky-600 via-cyan-600 to-indigo-700 p-5 text-white shadow-xl shadow-sky-900/10 dark:border-white/5 dark:shadow-none">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/80">Start Here</p>
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
    </>
  );
}

export default function RecruiterSidebar() {
  return (
    <aside className="sticky top-24 w-full">
      <CandidateSurfaceCard className="grid h-full gap-5 overflow-hidden p-0 [grid-template-rows:auto_minmax(0,1fr)]">
        <RecruiterSidebarPanels />
      </CandidateSurfaceCard>
    </aside>
  );
}
