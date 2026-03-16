'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import { BrandSourceBox } from '@/components/BrandSourceBox';
import { useCandidateLogout } from '@/hooks/useCandidateLogout';

type CandidateVoiceState = {
  available?: boolean;
  supported?: boolean;
  speaking?: boolean;
};

const DeferredCandidateNotificationsPopover = dynamic(
  () => import('@/components/candidate/shell/CandidateNotificationsPopover'),
  {
    ssr: false,
    loading: () => (
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-950/80" />
    ),
  },
);

export default function CandidateTopNav() {
  const pathname = usePathname();
  const { loggingOut, logout } = useCandidateLogout();
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceSpeaking, setVoiceSpeaking] = useState(false);
  const [navReady, setNavReady] = useState(false);

  const isDashboardRoute = pathname === '/candidate' || pathname.startsWith('/candidate/onboarding') || pathname.startsWith('/candidate/documents') || pathname.startsWith('/candidate/letters') || pathname.startsWith('/candidate/interview');
  const isOnboardingRoute = pathname.startsWith('/candidate/onboarding');
  const isDocumentsRoute = pathname.startsWith('/candidate/documents');
  const voiceEventPrefix = isOnboardingRoute
    ? 'candidate-onboarding'
    : isDocumentsRoute
      ? 'candidate-documents'
      : null;

  const routeLabel =
    pathname === '/candidate'
      ? 'Launchpad'
      : pathname.startsWith('/candidate/documents')
        ? 'Documents'
        : pathname.startsWith('/candidate/onboarding')
          ? 'Onboarding'
          : pathname.startsWith('/candidate/letters')
            ? 'Offer Room'
            : pathname.startsWith('/candidate/interview')
              ? 'Interview'
              : 'Profile';

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNavReady(true);
    }, 140);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!voiceEventPrefix) {
      setVoiceAvailable(false);
      setVoiceSpeaking(false);
      return;
    }

    const eventName = `${voiceEventPrefix}-voice-state`;

    const handleVoiceState = (event: Event) => {
      const detail = (event as CustomEvent<CandidateVoiceState>).detail;
      setVoiceAvailable(Boolean(detail?.available && detail?.supported));
      setVoiceSpeaking(Boolean(detail?.speaking));
    };

    window.addEventListener(eventName, handleVoiceState as EventListener);

    return () => {
      window.removeEventListener(eventName, handleVoiceState as EventListener);
    };
  }, [voiceEventPrefix]);

  useEffect(() => {
    if (!voiceEventPrefix) {
      setVoiceAvailable(false);
      setVoiceSpeaking(false);
      return;
    }

    window.dispatchEvent(new CustomEvent(`${voiceEventPrefix}-voice-request-state`));
  }, [voiceEventPrefix]);

  const triggerVoiceControl = () => {
    if (!voiceEventPrefix || !voiceAvailable) return;

    window.dispatchEvent(
      new CustomEvent(`${voiceEventPrefix}-voice-command`, {
        detail: {
          action: voiceSpeaking ? 'stop' : 'play',
        },
      }),
    );
  };

  const containerClass = isDashboardRoute
    ? 'w-full pl-0 pr-4 py-4 sm:pr-6 lg:pr-8'
    : 'mx-auto flex max-w-[1460px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className={containerClass}>
        <div className={`flex items-center justify-between gap-6 ${isDashboardRoute ? 'w-full' : ''}`}>
          <div className="min-w-0">
            <Link href="/candidate" className="inline-flex items-center pl-5">
              <BrandSourceBox className="max-w-full shadow-[0_6px_14px_rgba(15,23,42,0.1)]" />
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="rounded-full border border-slate-200 bg-white/70 px-5 py-2.5 text-base font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
              Current page: <span className="text-slate-950 dark:text-white">{routeLabel}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {voiceEventPrefix && voiceAvailable ? (
              <button
                type="button"
                onClick={triggerVoiceControl}
                className={`inline-flex h-12 items-center gap-2 rounded-2xl border px-4 text-sm font-black uppercase tracking-[0.16em] transition-colors ${
                  voiceSpeaking
                    ? 'border-rose-200 bg-rose-100 text-rose-700 shadow-sm shadow-rose-200/60 dark:border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-200'
                    : 'animate-[pulse_3.4s_ease-in-out_infinite] border-sky-200 bg-sky-100 text-sky-700 shadow-sm shadow-sky-200/60 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-200'
                }`}
                aria-label={voiceSpeaking ? 'Stop voice assistance' : 'Play voice assistance'}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 dark:bg-slate-950/50">
                  {voiceSpeaking ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 7h4v10H7zM13 7h4v10h-4z" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </span>
                <span>{voiceSpeaking ? 'Stop' : 'Play'}</span>
              </button>
            ) : null}
            {navReady ? (
              <DeferredCandidateNotificationsPopover />
            ) : (
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-950/80" />
            )}
            <CandidateActionButton variant="outline" size="sm" onClick={logout} isLoading={loggingOut}>
              {loggingOut ? 'Signing out...' : 'Logout'}
            </CandidateActionButton>
          </div>
        </div>
      </div>
    </header>
  );
}


