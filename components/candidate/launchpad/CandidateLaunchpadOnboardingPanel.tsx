'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateCallout from '@/components/candidate/ui/CandidateCallout';
import { onboardingFormSchema } from '@/lib/onboardingFormSchema';
import { StatusBadge } from '@/components/ui/StatusBadge';

type OnboardingStatusData = {
  onboarding_documentation?: {
    empty_fields?: string[];
  };
};

type SectionSummary = {
  id: string;
  title: string;
  fieldCount: number;
  pendingCount: number;
  filledCount: number;
  progress: number;
  accent: string;
};

const sectionColors: Record<string, string> = {
  personal: 'from-purple-500 to-violet-600',
  contact: 'from-blue-500 to-cyan-500',
  identification: 'from-orange-500 to-amber-500',
  bank: 'from-emerald-500 to-green-600',
  education: 'from-pink-500 to-rose-500',
  employment: 'from-indigo-500 to-blue-600',
};

function buildOnboardingSections(emptyFields: Set<string>): SectionSummary[] {
  return onboardingFormSchema
    .filter((section) => section.id !== 'documents')
    .map((section) => {
      const pendingCount = section.fields.filter((field) => emptyFields.has(field.name)).length;
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
        accent: sectionColors[section.id] ?? 'from-slate-500 to-slate-700',
      };
    });
}

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

const SectionStatusCard = memo(function SectionStatusCard({
  section,
  className = '',
}: {
  section: SectionSummary;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full min-h-[8.75rem] flex-col justify-between rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 sm:flex-nowrap">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</p>
          <p className="mt-1 text-[1.05rem] text-slate-600 dark:text-slate-300">
            {section.filledCount} of {section.fieldCount} tracked fields complete
          </p>
        </div>
        <StatusBadge status={section.pendingCount > 0 ? 'in_progress' : 'ready'} size="sm" />
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${section.accent}`}
          style={{ width: `${section.progress}%`, transition: 'width 700ms ease-out' }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-base font-semibold">
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
        <span className="text-lg font-black text-slate-900 dark:text-white">{section.progress}%</span>
      </div>
    </div>
  );
});

export default function CandidateLaunchpadOnboardingPanel({
  onboardingStatus,
}: {
  onboardingStatus: OnboardingStatusData | null;
}) {
  const router = useRouter();
  const [currentInfoIndex, setCurrentInfoIndex] = useState(0);

  const emptyFields = useMemo(
    () => new Set(onboardingStatus?.onboarding_documentation?.empty_fields ?? []),
    [onboardingStatus?.onboarding_documentation?.empty_fields],
  );
  const onboardingSections = useMemo(() => buildOnboardingSections(emptyFields), [emptyFields]);

  useEffect(() => {
    setCurrentInfoIndex((currentIndex) => {
      if (onboardingSections.length <= 0) return 0;
      if (currentIndex < 0) return 0;
      if (currentIndex > onboardingSections.length - 1) return 0;
      return currentIndex;
    });
  }, [onboardingSections.length]);

  const infoSliderSection = useMemo(() => {
    if (onboardingSections.length === 0) return null;
    return onboardingSections[currentInfoIndex % onboardingSections.length];
  }, [currentInfoIndex, onboardingSections]);

  return (
    <div className="flex min-h-0 flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-3.5 lg:p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3 sm:flex-nowrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Onboarding</p>
          <h2 className="mt-2 whitespace-nowrap text-[1.55rem] font-black text-slate-900 dark:text-white lg:text-[1.72rem]">
            Section progress
          </h2>
        </div>
        <CandidateActionButton
          variant="outline"
          size="sm"
          className="whitespace-nowrap"
          onClick={() => router.push('/candidate/onboarding')}
        >
          Open onboarding
        </CandidateActionButton>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        {infoSliderSection ? (
          <div className="flex h-full min-h-0 flex-col justify-between gap-4">
            <div className="min-h-0 flex-1">
              <div key={infoSliderSection.id} className="h-full">
                <SectionStatusCard section={infoSliderSection} className="h-full" />
              </div>
            </div>

            <SliderDots
              count={onboardingSections.length}
              currentIndex={currentInfoIndex}
              onChange={setCurrentInfoIndex}
              labelPrefix="Show onboarding section"
            />
          </div>
        ) : (
          <CandidateCallout
            tone="info"
            title="No onboarding section progress yet"
            message="Your section progress will appear here once onboarding data is available."
          />
        )}
      </div>
    </div>
  );
}
