'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import CandidateOnboardingSectionDialog from '@/components/candidate/onboarding/CandidateOnboardingSectionDialog';
import CandidateSidebarSection from '@/components/candidate/shell/CandidateSidebarSection';
import CandidateHeroCard from '@/components/candidate/ui/CandidateHeroCard';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { onboardingFormSchema } from '@/lib/onboardingFormSchema';
import { fetchCandidateOnboardingStatus } from '@/lib/candidate/contracts';

type CandidateSessionLike = {
  access_token?: string;
  user?: {
    user_metadata?: { full_name?: string };
    email?: string;
  };
} | null;

interface OnboardingStatusData {
  onboarding_documentation: {
    total_fields_tracked: number;
    fields_filled: number;
    fields_empty: number;
    completion_percentage: number;
    empty_fields: string[];
  };
}

interface SectionSummary {
  id: string;
  title: string;
  fieldCount: number;
  pendingCount: number;
  filledCount: number;
  progress: number;
  missingLabels: string[];
}

function formatPersonName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function buildOnboardingSections(emptyFields: Set<string>): SectionSummary[] {
  return onboardingFormSchema
    .filter((section) => section.id !== 'documents')
    .map((section) => {
      const missingLabels = section.fields
        .filter((field) => emptyFields.has(field.name))
        .map((field) => field.label);
      const pendingCount = missingLabels.length;
      const fieldCount = section.fields.length;
      const filledCount = Math.max(0, fieldCount - pendingCount);
      const progress = fieldCount > 0 ? Math.round((filledCount / fieldCount) * 100) : 0;

      return {
        id: section.id,
        title: section.title,
        fieldCount,
        pendingCount,
        filledCount,
        progress,
        missingLabels,
      };
    });
}



function buildOverallTone(completionPercentage: number) {
  if (completionPercentage >= 90) {
    return 'You are almost done with your onboarding profile.';
  }

  if (completionPercentage >= 70) {
    return 'You are in a good position and only a few important details are left.';
  }

  if (completionPercentage >= 40) {
    return 'You are making steady progress, but a few sections still need attention.';
  }

  return 'Your onboarding profile is still in the early stage, so focus on the basics first.';
}

function buildAllPendingNarration(
  status: OnboardingStatusData | null,
  sections: SectionSummary[],
) {
  const pendingSections = sections.filter((section) => section.pendingCount > 0);

  if (!status) {
    return pendingSections.length === 0
      ? 'Your onboarding information looks complete right now.'
      : `You still have ${pendingSections.length} onboarding section${pendingSections.length === 1 ? '' : 's'} to review.`;
  }

  const {
    completion_percentage: completionPercentage,
    total_fields_tracked: totalFields,
    fields_filled: filledFields,
    fields_empty: pendingFields,
  } = status.onboarding_documentation;

  if (pendingSections.length === 0 || pendingFields === 0) {
    return `Your onboarding information looks complete right now. You have filled all ${totalFields} tracked fields.`;
  }

  const prioritySections = [...pendingSections]
    .sort((left, right) => right.pendingCount - left.pendingCount)
    .slice(0, 2)
    .map((section) => section.title)
    .join(' and ');

  return [
    `Here is your onboarding overview. ${buildOverallTone(completionPercentage)}`,
    `You have completed ${filledFields} of ${totalFields} tracked fields, and ${pendingFields} field${pendingFields === 1 ? '' : 's'} are still pending.`,
    `Prioritize ${prioritySections} first.`,
    'Open each info bucket one by one to finish the remaining details.',
  ].join(' ');
}

function findPreferredIndianVoice(voices: SpeechSynthesisVoice[]) {
  const exactEnglishIndia = voices.find((voice) => voice.lang.toLowerCase() === 'en-in');
  if (exactEnglishIndia) return exactEnglishIndia;

  const englishIndiaLike = voices.find(
    (voice) =>
      voice.lang.toLowerCase().startsWith('en-') &&
      voice.lang.toLowerCase().endsWith('in'),
  );
  if (englishIndiaLike) return englishIndiaLike;

  const nameMatched = voices.find((voice) =>
    /(india|indian|heera|prabhat|ravi|veena|aditi|google english india)/i.test(voice.name),
  );
  if (nameMatched) return nameMatched;

  return null;
}

function HeroStatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/75">{label}</p>
      <p className="mt-2 text-[1.7rem] font-black leading-none text-white">{value}</p>
    </div>
  );
}

function CompactSectionCard({
  section,
  onOpen,
}: {
  section: SectionSummary;
  onOpen: (sectionId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(section.id)}
      className="flex min-h-[12rem] flex-col justify-between rounded-[1.45rem] border border-slate-200 bg-white px-3.5 py-3.5 text-left shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50/35 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="flex flex-col items-start gap-2.5">
        <div className="min-w-0">
          <p className="truncate text-[1.08rem] font-black text-slate-900 dark:text-white">{section.title}</p>
          <p className="mt-1 text-[0.84rem] text-slate-600 dark:text-slate-300">
            {section.filledCount} of {section.fieldCount} tracked fields complete
          </p>
        </div>
        <StatusBadge
          status={section.pendingCount > 0 ? 'in_progress' : 'ready'}
          size="sm"
          className={
            section.pendingCount > 0
              ? 'self-start !border-amber-300/70 !bg-amber-300/15 !text-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.24)] dark:!text-amber-300'
              : 'self-start !border-emerald-300/70 !bg-emerald-300/15 !text-emerald-600 shadow-[0_0_18px_rgba(16,185,129,0.24)] dark:!text-emerald-300'
          }
        />
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500"
          style={{ width: `${section.progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[0.84rem] font-semibold">
        <span
          className={
            section.pendingCount > 0
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-emerald-700 dark:text-emerald-300'
          }
        >
          {section.pendingCount > 0
            ? `${section.pendingCount} field${section.pendingCount === 1 ? '' : 's'} pending`
            : 'This section is complete'}
        </span>
        <span className="text-base font-black text-slate-900 dark:text-white">{section.progress}%</span>
      </div>
    </button>
  );
}

function PendingHeadCard({
  section,
  onOpenMore,
}: {
  section: SectionSummary;
  onOpenMore: (sectionId: string) => void;
}) {
  const visibleLabels = section.missingLabels.slice(0, 2);
  const remainingCount = Math.max(0, section.missingLabels.length - visibleLabels.length);

  return (
    <div className="flex min-h-0 flex-col justify-between overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white px-2.5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.92rem] font-black leading-4 text-slate-900 dark:text-white">{section.title}</p>
      </div>

      <div className="mt-2.5 flex min-h-0 flex-col items-start gap-1.5">
        {section.pendingCount > 0 ? (
          <>
            {visibleLabels.map((label) => (
              <span
                key={`${section.id}-${label}`}
                className="inline-flex max-w-full items-center truncate rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[0.76rem] font-semibold leading-4 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-200"
                title={label}
              >
                {label}
              </span>
            ))}
            {remainingCount > 0 ? (
              <button
                type="button"
                onClick={() => onOpenMore(section.id)}
                className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-red-700 transition-colors hover:bg-red-200 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25"
              >
                +{remainingCount} more
              </button>
            ) : null}
          </>
        ) : (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[0.76rem] font-semibold leading-4 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200">
            All items filled
          </span>
        )}
      </div>
    </div>
  );
}

function PendingFieldsPopover({
  section,
  onClose,
}: {
  section: SectionSummary | null;
  onClose: () => void;
}) {
  if (!section) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Pending Fields
            </p>
            <h3 className="mt-2 text-[1.25rem] font-black text-slate-900 dark:text-white">{section.title}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-sm font-bold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {section.missingLabels.map((label) => (
            <span
              key={`${section.id}-modal-${label}`}
              className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-[0.8rem] font-semibold leading-4 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-200"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CandidateOnboardingWorkspace({
  session,
}: {
  session: CandidateSessionLike;
}) {
  const [status, setStatus] = useState<OnboardingStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openPendingSectionId, setOpenPendingSectionId] = useState<string | null>(null);
  const [openFormSectionId, setOpenFormSectionId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingTarget, setSpeakingTarget] = useState<string | 'all' | null>(null);
  const [preferredVoiceUri, setPreferredVoiceUri] = useState<string | null>(null);
  const [voiceBootReady, setVoiceBootReady] = useState(false);

  useEffect(() => {
    let active = true;

    const loadStatus = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      const result = await fetchCandidateOnboardingStatus(session.access_token);

      if (!active) return;

      if (result.success && result.data) {
        setStatus(result.data as OnboardingStatusData);
      }

      setLoading(false);
    };

    void loadStatus();

    return () => {
      active = false;
    };
  }, [session?.access_token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVoiceBootReady(true);
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!voiceBootReady) {
      return;
    }

    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setSpeechSupported(supported);

    if (!supported) {
      setPreferredVoiceUri(null);
      return;
    }

    const synth = window.speechSynthesis;
    const updatePreferredVoice = () => {
      const voice = findPreferredIndianVoice(synth.getVoices());
      setPreferredVoiceUri(voice?.voiceURI ?? null);
    };

    updatePreferredVoice();
    synth.addEventListener('voiceschanged', updatePreferredVoice);

    return () => {
      synth.cancel();
      synth.removeEventListener('voiceschanged', updatePreferredVoice);
    };
  }, [voiceBootReady]);

  const candidateName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.email?.split('@')[0] ??
    'Candidate';

  const displayName = formatPersonName(candidateName);
  const overallValue = status ? `${status.onboarding_documentation.completion_percentage}%` : '--';
  const filledValue = status ? String(status.onboarding_documentation.fields_filled) : '--';
  const pendingValue = status ? String(status.onboarding_documentation.fields_empty) : '--';
  const emptyFields = useMemo(
    () => new Set(status?.onboarding_documentation.empty_fields ?? []),
    [status?.onboarding_documentation.empty_fields],
  );
  const sections = useMemo(() => buildOnboardingSections(emptyFields), [emptyFields]);
  const sectionDefinitions = useMemo(
    () => onboardingFormSchema.filter((section) => section.id !== 'documents'),
    [],
  );
  const openPendingSection = useMemo(
    () => sections.find((section) => section.id === openPendingSectionId) ?? null,
    [openPendingSectionId, sections],
  );
  const openFormSection = useMemo(
    () => sectionDefinitions.find((section) => section.id === openFormSectionId) ?? null,
    [openFormSectionId, sectionDefinitions],
  );

  const stopNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingTarget(null);
  };

  const speakText = useCallback((text: string, target: string | 'all') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const voices = synth.getVoices();
    const preferredVoice =
      voices.find((voice) => voice.voiceURI === preferredVoiceUri) ??
      findPreferredIndianVoice(voices);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.84;
    utterance.pitch = 1;
    utterance.lang = preferredVoice?.lang ?? 'en-IN';

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setSpeakingTarget(null);
    utterance.onerror = () => setSpeakingTarget(null);

    setSpeakingTarget(target);
    synth.speak(utterance);
  }, [preferredVoiceUri]);



  useEffect(() => {
    if (!voiceBootReady || typeof window === 'undefined') return;

    const publishVoiceState = () => {
      window.dispatchEvent(
        new CustomEvent('candidate-onboarding-voice-state', {
          detail: {
            available: true,
            supported: speechSupported,
            speaking: Boolean(speakingTarget),
          },
        }),
      );
    };

    const handleVoiceCommand = (event: Event) => {
      const detail = (event as CustomEvent<{ action?: 'play' | 'stop' }>).detail;

      if (detail?.action === 'stop') {
        stopNarration();
        return;
      }

      if (detail?.action === 'play') {
        speakText(buildAllPendingNarration(status, sections), 'all');
      }
    };

    const handleStateRequest = () => {
      publishVoiceState();
    };

    publishVoiceState();
    window.addEventListener('candidate-onboarding-voice-command', handleVoiceCommand as EventListener);
    window.addEventListener('candidate-onboarding-voice-request-state', handleStateRequest);

    return () => {
      window.dispatchEvent(
        new CustomEvent('candidate-onboarding-voice-state', {
          detail: {
            available: false,
            supported: false,
            speaking: false,
          },
        }),
      );
      window.removeEventListener('candidate-onboarding-voice-command', handleVoiceCommand as EventListener);
      window.removeEventListener('candidate-onboarding-voice-request-state', handleStateRequest);
    };
  }, [speechSupported, speakingTarget, status, sections, speakText, voiceBootReady]);

  if (loading) {
    return (
      <CandidatePageFrame
        title="Onboarding"
        subtitle="Candidate form workspace"
        containerClassName="max-w-full"
      >
        <CandidateLoadingState message="Loading onboarding workspace..." />
      </CandidatePageFrame>
    );
  }

  return (
    <CandidatePageFrame
      title="Onboarding"
      subtitle="Candidate form workspace"
      containerClassName="max-w-full"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(17rem,1fr)_minmax(0,3fr)_minmax(17rem,1fr)] lg:items-stretch">
        <CandidateSidebarSection className="lg:h-full" />

        <section className="min-w-0 h-full lg:min-h-0">
          <div className="grid h-full gap-4 lg:grid-rows-[minmax(0,0.85fr)_minmax(0,1.95fr)]">
            <CandidateHeroCard
              className="h-full min-h-[12.5rem] px-8 py-7 sm:px-9 sm:py-8"
              gradientClassName="from-indigo-600 via-sky-600 to-cyan-600"
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-100/85">
                    Guided Onboarding
                  </p>
                  <h1 className="mt-4 text-[2.45rem] font-black tracking-tight sm:text-[2.85rem]">
                    Keep moving, {displayName}
                  </h1>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <HeroStatusCard label="Overall" value={overallValue} />
                  <HeroStatusCard label="Filled" value={filledValue} />
                  <HeroStatusCard label="Pending" value={pendingValue} />
                </div>
              </div>
            </CandidateHeroCard>

            <CandidateSurfaceCard className="h-full p-0">
              <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800 lg:px-7">
                <h2 className="text-[2.25rem] font-black text-slate-900 dark:text-white">Info Bucket</h2>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3 lg:p-6">
                {sections.map((section) => (
                  <CompactSectionCard
                    key={section.id}
                    section={section}
                    onOpen={setOpenFormSectionId}
                  />
                ))}
              </div>
            </CandidateSurfaceCard>
          </div>
        </section>

        <CandidateSurfaceCard className="h-full p-2.5 lg:min-h-0">
          <div className="grid h-full gap-2 lg:grid-rows-6 lg:gap-2">
            {sections.map((section) => (
              <PendingHeadCard
                key={`pending-${section.id}`}
                section={section}
                onOpenMore={setOpenPendingSectionId}
              />
            ))}
          </div>
        </CandidateSurfaceCard>
      </div>

      <PendingFieldsPopover
        section={openPendingSection}
        onClose={() => setOpenPendingSectionId(null)}
      />

      <CandidateOnboardingSectionDialog
        session={session}
        isOpen={Boolean(openFormSection)}
        onClose={() => setOpenFormSectionId(null)}
        title={openFormSection?.title ?? ''}
        fields={openFormSection?.fields ?? []}
      />
    </CandidatePageFrame>
  );
}




















