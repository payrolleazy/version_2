'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import RecruiterSidebarSection from '@/components/recruiter/shell/RecruiterSidebarSection';
import RecruiterTopNav from '@/components/recruiter/shell/RecruiterTopNav';

export default function RecruiterClientShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    ['/recruiter', '/recruiter/queue', '/recruiter/calendar', '/recruiter/requisitions', '/recruiter/pipeline'].forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d7f0ff_0%,#f4f7fb_34%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,#152033_0%,#090d14_38%,#0f172a_100%)]">
      <RecruiterTopNav />
      <div className="mx-auto max-w-[1460px] px-4 pb-10 pt-7 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-7 lg:grid lg:grid-cols-[390px_minmax(0,1fr)] lg:items-start">
          <RecruiterSidebarSection sticky />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
