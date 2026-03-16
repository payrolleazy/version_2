'use client';

import { memo, useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import CandidateLaunchpadOnboardingPanel from '@/components/candidate/launchpad/CandidateLaunchpadOnboardingPanel';
import CandidateSidebarSection from '@/components/candidate/shell/CandidateSidebarSection';
import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateCallout from '@/components/candidate/ui/CandidateCallout';
import CandidateHeroCard from '@/components/candidate/ui/CandidateHeroCard';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidateMessageState from '@/components/candidate/ui/CandidateMessageState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CandidateDocumentGroup, CandidateLaunchpadResponse, CandidateOnboardingStatusResponse } from '@/lib/candidate/contracts';

interface CandidateSessionLike {
  access_token?: string;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
      picture?: string;
      photo_url?: string;
    };
  };
}

interface HeroStep {
  id: string;
  label: string;
  title: string;
  detail: string;
  tone: 'ready' | 'attention';
}

interface LifeEvents {
  birthday: string | null;
  anniversary: string | null;
}

interface LaunchpadBundle {
  launchpad: CandidateLaunchpadResponse | null;
  lifeEvents: LifeEvents;
}

interface CandidateLaunchpadProps {
  session: CandidateSessionLike;
  initialBundle?: LaunchpadBundle;
  initialError?: string | null;
  initialOnboardingStatus?: CandidateOnboardingStatusResponse | null;
}

const EMPTY_LIFE_EVENTS: LifeEvents = {
  birthday: null,
  anniversary: null,
};

function formatTitle(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPersonName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatLifeEventDate(value?: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function getAvatarSource(session: CandidateSessionLike | null) {
  return (
    session?.user?.user_metadata?.avatar_url ??
    session?.user?.user_metadata?.picture ??
    session?.user?.user_metadata?.photo_url ??
    null
  );
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index > length - 1) return 0;
  return index;
}

function buildHeroSteps({
  pendingDocCount,
  unreadLetterCount,
}: {
  pendingDocCount: number;
  unreadLetterCount: number;
}): HeroStep[] {
  return [
    {
      id: 'documents',
      label: 'Step 1',
      title: pendingDocCount > 0 ? 'Upload documents' : 'Documents ready',
      detail:
        pendingDocCount > 0
          ? `${pendingDocCount} required file${pendingDocCount === 1 ? '' : 's'} left`
          : 'All required files uploaded',
      tone: pendingDocCount > 0 ? 'attention' : 'ready',
    },
    {
      id: 'onboarding',
      label: 'Step 2',
      title: 'Continue onboarding',
      detail: 'Review and complete the remaining profile sections.',
      tone: 'attention',
    },
    {
      id: 'letters',
      label: 'Step 3',
      title: unreadLetterCount > 0 ? 'Review letters' : 'Offer room ready',
      detail:
        unreadLetterCount > 0
          ? `${unreadLetterCount} unread letter${unreadLetterCount === 1 ? '' : 's'} waiting`
          : 'Check the latest HR updates',
      tone: unreadLetterCount > 0 ? 'attention' : 'ready',
    },
  ];
}

function resolvePrimaryAction({
  pendingDocCount,
  unreadLetterCount,
  nextRecommendedAction,
}: {
  pendingDocCount: number;
  unreadLetterCount: number;
  nextRecommendedAction?: string | null;
}) {
  if (pendingDocCount > 0) {
    return { label: 'Open documents', href: '/candidate/documents' };
  }

  const nextAction = (nextRecommendedAction ?? '').toLowerCase();

  if (nextAction.includes('letter') || unreadLetterCount > 0) {
    return { label: 'Open offer room', href: '/candidate/letters' };
  }

  if (nextAction.includes('interview')) {
    return { label: 'Open interview console', href: '/candidate/interview' };
  }

  return { label: 'Continue onboarding', href: '/candidate/onboarding' };
}

const ScoreRing = memo(function ScoreRing({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 700ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-[2.9rem] font-black leading-none sm:text-[3.2rem]">{Math.round(safeScore)}</span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Ready</span>
      </div>
    </div>
  );
});

const SliderDots = memo(function SliderDots({
  count,
  currentIndex,
  onChange,
  labelPrefix,
}: {
  count: number;
  currentIndex: number;
  onChange: (index: number) => void;
  labelPrefix: string;
}) {
  if (count <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-1">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={`${labelPrefix}-${index}`}
          type="button"
          onClick={() => onChange(index)}
          aria-label={`${labelPrefix} ${index + 1}`}
          className={`h-2.5 rounded-full transition-all ${
            index === currentIndex
              ? 'w-8 bg-sky-500 dark:bg-sky-400'
              : 'w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
});

const DocumentGroupCard = memo(function DocumentGroupCard({
  group,
  className = '',
}: {
  group: CandidateDocumentGroup;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full min-h-[8.75rem] flex-col justify-between rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 sm:flex-nowrap">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatTitle(group.sub_folder)}</p>
          <p className="mt-1 text-[1.05rem] text-slate-600 dark:text-slate-300">
            {group.uploaded_documents} of {group.required_documents} required uploaded
          </p>
        </div>
        <StatusBadge status={group.pending_required_documents > 0 ? 'attention_required' : 'ready'} size="sm" />
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"
          style={{
            width: `${group.required_documents > 0 ? (group.uploaded_documents / group.required_documents) * 100 : 100}%`,
            transition: 'width 700ms ease-out',
          }}
        />
      </div>
      {group.pending_required_documents > 0 ? (
        <p className="mt-3 text-base font-semibold text-amber-700 dark:text-amber-300">
          {group.pending_required_documents} required document(s) still pending
        </p>
      ) : (
        <p className="mt-3 text-base font-semibold text-emerald-700 dark:text-emerald-300">This document group is complete</p>
      )}
    </div>
  );
});

const HeroStepStack = memo(function HeroStepStack({ steps }: { steps: HeroStep[] }) {
  return (
    <div className="max-w-[29rem] space-y-2.5 lg:flex-1">
      {steps.map((step) => (
        <div key={step.id} className="rounded-[1.5rem] border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur">
          <div className="flex items-start justify-between gap-3 sm:flex-nowrap">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100/80">{step.label}</p>
              <p className="mt-2 text-lg font-black text-white">{step.title}</p>
              <p className="mt-1 text-base text-cyan-50/85">{step.detail}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                step.tone === 'attention' ? 'bg-amber-400/20 text-amber-100' : 'bg-emerald-400/20 text-emerald-100'
              }`}
            >
              {step.tone === 'attention' ? 'Do next' : 'Ready'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});

export default function CandidateLaunchpad({
  session,
  initialBundle,
  initialError,
  initialOnboardingStatus,
}: CandidateLaunchpadProps) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);

  const bundle = initialBundle ?? {
    launchpad: null,
    lifeEvents: EMPTY_LIFE_EVENTS,
  };

  const error = initialError ?? null;
  const data = bundle.launchpad;
  const lifeEvents = bundle.lifeEvents;

  const candidateName =
    data?.candidate_name ??
    session?.user?.user_metadata?.full_name ??
    session?.user?.email?.split('@')[0] ??
    'Candidate';
  const displayName = formatPersonName(candidateName);
  const avatarSource = getAvatarSource(session);
  const avatarFallback = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const summary = data?.summary;
  const documentGroups = useMemo(() => data?.documents?.groups ?? [], [data?.documents?.groups]);
  const birthdayLabel = formatLifeEventDate(lifeEvents.birthday);
  const anniversaryLabel = formatLifeEventDate(lifeEvents.anniversary);

  useEffect(() => {
    setCurrentDocumentIndex((currentIndex) => clampIndex(currentIndex, documentGroups.length));
  }, [documentGroups.length]);

  const documentSliderGroup = useMemo(() => {
    if (documentGroups.length === 0) return null;
    return documentGroups[currentDocumentIndex % documentGroups.length];
  }, [currentDocumentIndex, documentGroups]);

  const pendingDocCount = summary?.pending_required_documents ?? 0;
  const unreadLetterCount = data?.offer_room?.unread_count ?? summary?.unread_letters ?? 0;
  const heroSteps = useMemo(
    () => buildHeroSteps({ pendingDocCount, unreadLetterCount }),
    [pendingDocCount, unreadLetterCount],
  );

  const primaryAction = resolvePrimaryAction({
    pendingDocCount,
    unreadLetterCount,
    nextRecommendedAction: summary?.next_recommended_action,
  });

  const handleRefresh = () => {
    startRefresh(() => {
      router.refresh();
    });
  };

  if (!initialBundle && !error) {
    return (
      <CandidatePageFrame title="Launchpad" subtitle="Candidate home" containerClassName="max-w-6xl">
        <CandidateLoadingState message="Loading your launchpad..." />
      </CandidatePageFrame>
    );
  }

  if (error || !data?.success) {
    return (
      <CandidatePageFrame title="Launchpad" subtitle="Candidate home" containerClassName="max-w-3xl">
        <CandidateMessageState
          title="Launchpad unavailable"
          message={error ?? 'The candidate launchpad could not be loaded right now.'}
          tone="error"
          action={
            <CandidateActionButton onClick={handleRefresh} isLoading={refreshing}>
              Retry
            </CandidateActionButton>
          }
        />
      </CandidatePageFrame>
    );
  }

  return (
    <CandidatePageFrame title="Launchpad" subtitle="Candidate home" containerClassName="ml-0 mr-auto max-w-full">
      <div className="grid gap-4 lg:grid-cols-[minmax(17rem,1fr)_minmax(0,2.5fr)_minmax(19rem,1.5fr)] lg:items-stretch">
        <CandidateSidebarSection className="lg:h-full" />

        <section className="min-w-0 lg:min-h-0">
          <CandidateHeroCard className="relative h-full overflow-hidden">
            <div className="absolute right-7 top-7 hidden lg:flex">
              <ScoreRing score={Number(summary?.overall_score ?? 0)} />
            </div>

            <div className="flex h-full flex-col">
              <div className="max-w-[40rem] lg:pr-24 xl:pr-28">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/15 bg-white/12 text-2xl font-black text-white shadow-lg shadow-sky-950/10 sm:h-20 sm:w-20 sm:text-[1.75rem]">
                    {avatarSource ? (
                      <Image src={avatarSource} alt={displayName} fill sizes="96px" unoptimized className="object-cover" />
                    ) : (
                      avatarFallback || 'C'
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xl font-black uppercase tracking-[0.22em] text-cyan-100/80 sm:text-2xl">Welcome</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{displayName}</h1>
                  </div>
                </div>
                <div className="mt-7 flex lg:hidden">
                  <ScoreRing score={Number(summary?.overall_score ?? 0)} />
                </div>

                {birthdayLabel || anniversaryLabel ? (
                  <div className="mt-5 max-w-[29rem]">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {birthdayLabel ? (
                        <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100/80">Birthday</p>
                          <p className="mt-3 text-2xl font-black text-white">{birthdayLabel}</p>
                        </div>
                      ) : null}
                      {anniversaryLabel ? (
                        <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                          <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-100/80">Anniversary</p>
                          <p className="mt-3 text-2xl font-black text-white">{anniversaryLabel}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className={`mt-auto flex flex-col gap-4 ${birthdayLabel || anniversaryLabel ? 'pt-24' : 'pt-6'} lg:flex-row lg:items-end lg:justify-between`}>
                <HeroStepStack steps={heroSteps} />

                <div className="flex justify-start lg:justify-end lg:pl-6">
                  <CandidateActionButton onClick={() => router.push(primaryAction.href)}>
                    {primaryAction.label}
                  </CandidateActionButton>
                </div>
              </div>
            </div>
          </CandidateHeroCard>
        </section>

        <CandidateSurfaceCard className="p-0">
          <div className="grid gap-4 lg:min-h-0 lg:[grid-template-rows:minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-3.5 lg:p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-start justify-between gap-3 sm:flex-nowrap">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Documents</p>
                  <h2 className="mt-2 whitespace-nowrap text-[1.55rem] font-black text-slate-900 dark:text-white lg:text-[1.72rem]">
                    Upload readiness
                  </h2>
                </div>
                <CandidateActionButton
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => router.push('/candidate/documents')}
                >
                  Manage
                </CandidateActionButton>
              </div>

              <div className="mt-3 flex min-h-0 flex-1 flex-col">
                {documentSliderGroup ? (
                  <div className="flex h-full min-h-0 flex-col justify-between gap-4">
                    <div className="min-h-0 flex-1">
                      <DocumentGroupCard group={documentSliderGroup} className="h-full" />
                    </div>
                    <SliderDots
                      count={documentGroups.length}
                      currentIndex={currentDocumentIndex}
                      onChange={setCurrentDocumentIndex}
                      labelPrefix="Show document bucket"
                    />
                  </div>
                ) : (
                  <CandidateCallout
                    tone="info"
                    title="No document groups yet"
                    message="Your document checklist will appear here once HR publishes the required upload buckets."
                  />
                )}
              </div>
            </div>

            <div className="min-h-0">
              <CandidateLaunchpadOnboardingPanel onboardingStatus={initialOnboardingStatus ?? null} />
            </div>
          </div>
        </CandidateSurfaceCard>
      </div>
    </CandidatePageFrame>
  );
}


