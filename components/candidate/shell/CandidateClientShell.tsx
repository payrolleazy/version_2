'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';

import CandidateBottomNav from '@/components/candidate/shell/CandidateBottomNav';
import CandidateSidebarSection from '@/components/candidate/shell/CandidateSidebarSection';
import { CandidateSessionProvider } from '@/components/candidate/shell/CandidateSessionContext';
import { CandidateShellProvider } from '@/components/candidate/shell/CandidateShellContext';
import CandidateTopNav from '@/components/candidate/shell/CandidateTopNav';
import { usePWADetection } from '@/hooks/usePWADetection';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function CandidatePWAShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col bg-gray-50 dark:bg-gray-950"
      style={{
        height: '100dvh',
        overflow: 'hidden',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <main
        className="flex-1 overflow-y-scroll overscroll-y-none pb-20"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {children}
      </main>

      <CandidateBottomNav />
    </div>
  );
}

function CandidateWebShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageOwnsSidebar =
    pathname === '/candidate' ||
    pathname.startsWith('/candidate/onboarding') ||
    pathname.startsWith('/candidate/documents') ||
    pathname.startsWith('/candidate/letters') ||
    pathname.startsWith('/candidate/interview');
  const showSidebar = !pageOwnsSidebar;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d7f0ff_0%,#f4f7fb_34%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,#152033_0%,#090d14_38%,#0f172a_100%)]">
      <CandidateTopNav />
      <div
        className={
          showSidebar
            ? 'mx-auto max-w-[1460px] px-4 pb-10 pt-7 sm:px-6 lg:px-8'
            : 'pb-10 pt-7 px-5'
        }
      >
        {showSidebar ? (
          <div className="flex flex-col gap-7 lg:grid lg:grid-cols-[390px_minmax(0,1fr)] lg:items-start">
            <CandidateSidebarSection sticky />
            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default function CandidateClientShell({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) {
  const isPWA = usePWADetection();
  const router = useRouter();

  useEffect(() => {
    const candidateRoutes = [
      '/candidate',
      '/candidate/documents',
      '/candidate/onboarding',
      '/candidate/letters',
      '/candidate/interview',
    ] as const;

    candidateRoutes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  useEffect(() => {
    const win = window as IdleWindow;

    const preload = () => {
      void Promise.allSettled([
        import('@/components/candidate/launchpad/CandidateLaunchpad'),
        import('@/components/candidate/interview/CandidateInterviewConsole'),
        import('@/components/candidate/letters/CandidateOfferRoomScreen'),
        import('@/components/candidate/onboarding/CandidateOnboardingWorkspace'),
        import('@/components/candidate/shell/CandidateNotificationsPopover'),
      ]);
    };

    if (typeof win.requestIdleCallback === 'function') {
      const handle = win.requestIdleCallback(preload, { timeout: 1200 });
      return () => {
        if (typeof win.cancelIdleCallback === 'function') {
          win.cancelIdleCallback(handle);
        }
      };
    }

    const timeoutId = window.setTimeout(preload, 400);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });

      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => {
            void caches.delete(key);
          });
        });
      }

      return;
    }

    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  }, []);

  useEffect(() => {
    if (!isPWA) {
      return undefined;
    }

    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.documentElement.style.height = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [isPWA]);

  return (
    <CandidateSessionProvider initialSession={initialSession}>
      <CandidateShellProvider isPWA={isPWA}>
        {isPWA ? <CandidatePWAShell>{children}</CandidatePWAShell> : <CandidateWebShell>{children}</CandidateWebShell>}
      </CandidateShellProvider>
    </CandidateSessionProvider>
  );
}



