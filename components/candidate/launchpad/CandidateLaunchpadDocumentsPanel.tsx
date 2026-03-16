'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateCallout from '@/components/candidate/ui/CandidateCallout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CandidateDocumentGroup, CandidateDocumentRequirementsResponse } from '@/lib/candidate/contracts';

function formatTitle(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index > length - 1) return 0;
  return index;
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

export default function CandidateLaunchpadDocumentsPanel({
  documentData,
}: {
  documentData: CandidateDocumentRequirementsResponse | null;
}) {
  const router = useRouter();
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);

  const documentGroups = useMemo(() => documentData?.groups ?? [], [documentData?.groups]);

  useEffect(() => {
    setCurrentDocumentIndex((currentIndex) => clampIndex(currentIndex, documentGroups.length));
  }, [documentGroups.length]);

  const documentSliderGroup = useMemo(() => {
    if (documentGroups.length === 0) return null;
    return documentGroups[currentDocumentIndex % documentGroups.length];
  }, [currentDocumentIndex, documentGroups]);

  return (
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
  );
}
