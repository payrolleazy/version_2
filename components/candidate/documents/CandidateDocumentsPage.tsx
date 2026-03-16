'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import CandidateDocumentUploadDialog from '@/components/candidate/documents/CandidateDocumentUploadDialog';
import CandidateSidebarSection from '@/components/candidate/shell/CandidateSidebarSection';
import CandidateHeroCard from '@/components/candidate/ui/CandidateHeroCard';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidateMessageState from '@/components/candidate/ui/CandidateMessageState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  CandidateDocumentGroup,
  CandidateDocumentRequirementsResponse,
  fetchCandidateDocumentRequirements,
} from '@/lib/candidate/contracts';

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

function getGroupSuggestedDocumentType(group: CandidateDocumentGroup) {
  return (
    group.documents.find((document) => !document.is_uploaded && document.is_required)?.document_key ??
    group.documents[0]?.document_key ??
    null
  );
}

function getPendingDocumentLabels(group: CandidateDocumentGroup) {
  return group.documents
    .filter((document) => document.is_required && !document.is_uploaded)
    .map((document) => formatTitle(document.document_key));
}

function buildDocumentOverallTone(completionPercentage: number, pendingRequiredDocuments: number) {
  if (pendingRequiredDocuments === 0) return 'Your document checklist looks complete.';
  if (completionPercentage >= 85) return 'You are close to finishing the required uploads.';
  if (completionPercentage >= 60) return 'You are making steady progress on your document checklist.';
  return 'A few document buckets still need attention before joining.';
}

function buildPriorityBucketPhrase(groups: CandidateDocumentGroup[]) {
  const names = groups
    .filter((group) => group.pending_required_documents > 0)
    .slice(0, 3)
    .map((group) => formatTitle(group.sub_folder));

  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function buildDocumentsNarration({
  uploadedDocuments,
  totalRequiredDocuments,
  pendingRequiredDocuments,
  completionPercentage,
  orderedGroups,
}: {
  uploadedDocuments: number;
  totalRequiredDocuments: number;
  pendingRequiredDocuments: number;
  completionPercentage: number;
  orderedGroups: CandidateDocumentGroup[];
}) {
  if (totalRequiredDocuments === 0) {
    return 'Here is your document upload overview. There are no required joining documents in your checklist right now. Review your buckets if you want to confirm what HR has shared.';
  }

  const pendingGroups = orderedGroups.filter((group) => group.pending_required_documents > 0);
  const priorityBuckets = buildPriorityBucketPhrase(pendingGroups);
  const leadingBucket = pendingGroups[0];
  const previousEmploymentPending = pendingGroups.some((group) => /previous employment|experience/i.test(group.sub_folder));

  if (pendingRequiredDocuments === 0) {
    return [
      'Here is your document upload overview.',
      'All required joining documents are uploaded.',
      `You have completed all ${totalRequiredDocuments} required uploads.`,
      'You can still open any upload bucket to review or download the files already submitted.',
    ].join(' ');
  }

  return [
    `Here is your document upload overview. ${buildDocumentOverallTone(completionPercentage, pendingRequiredDocuments)}`,
    `You have uploaded ${uploadedDocuments} of ${totalRequiredDocuments} required documents, and ${pendingRequiredDocuments} required document${pendingRequiredDocuments === 1 ? '' : 's'} are still pending.`,
    priorityBuckets ? `Focus on ${priorityBuckets} first.` : null,
    leadingBucket
      ? `${formatTitle(leadingBucket.sub_folder)} currently has ${leadingBucket.pending_required_documents} required item${leadingBucket.pending_required_documents === 1 ? '' : 's'} left.`
      : null,
    previousEmploymentPending
      ? 'If previous employment documents do not apply because you are a fresher, confirm that with HR before skipping them.'
      : null,
    'Open the matching upload bucket to add the remaining files or review what you have already submitted.',
  ]
    .filter(Boolean)
    .join(' ');
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

function UploadBucketCard({
  group,
  onOpen,
}: {
  group: CandidateDocumentGroup;
  onOpen: (group: CandidateDocumentGroup) => void;
}) {
  const completion =
    group.required_documents > 0
      ? Math.round((group.uploaded_documents / group.required_documents) * 100)
      : 100;

  return (
    <button
      type="button"
      onClick={() => onOpen(group)}
      className="flex min-h-[12rem] flex-col justify-between rounded-[1.45rem] border border-slate-200 bg-white px-3.5 py-3.5 text-left shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50/35 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="flex flex-col items-start gap-2.5">
        <div className="min-w-0">
          <p className="truncate text-[1.08rem] font-black text-slate-900 dark:text-white">
            {formatTitle(group.sub_folder)}
          </p>
          <p className="mt-1 text-[0.84rem] text-slate-600 dark:text-slate-300">
            {group.uploaded_documents} of {group.required_documents} required uploaded
          </p>
        </div>
        <StatusBadge
          status={group.pending_required_documents > 0 ? 'attention_required' : 'ready'}
          size="sm"
          className={
            group.pending_required_documents > 0
              ? 'self-start !border-amber-300/70 !bg-amber-300/15 !text-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.24)] dark:!text-amber-300'
              : 'self-start !border-emerald-300/70 !bg-emerald-300/15 !text-emerald-600 shadow-[0_0_18px_rgba(16,185,129,0.24)] dark:!text-emerald-300'
          }
        />
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500"
          style={{ width: `${completion}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[0.84rem] font-semibold">
        <span
          className={
            group.pending_required_documents > 0
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-emerald-700 dark:text-emerald-300'
          }
        >
          {group.pending_required_documents > 0
            ? `${group.pending_required_documents} required item${group.pending_required_documents === 1 ? '' : 's'} pending`
            : 'This bucket is complete'}
        </span>
        <span className="text-base font-black text-slate-900 dark:text-white">{completion}%</span>
      </div>
    </button>
  );
}

function PendingDocumentBucketCard({
  group,
  onOpenMore,
}: {
  group: CandidateDocumentGroup;
  onOpenMore: (groupId: string) => void;
}) {
  const pendingLabels = getPendingDocumentLabels(group);
  const visibleLabels = pendingLabels.slice(0, 2);
  const remainingCount = Math.max(0, pendingLabels.length - visibleLabels.length);

  return (
    <div className="flex min-h-0 flex-col justify-between overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white px-2.5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.92rem] font-black leading-4 text-slate-900 dark:text-white">
          {formatTitle(group.sub_folder)}
        </p>
      </div>

      <div className="mt-2.5 flex min-h-0 flex-col items-start gap-1.5">
        {pendingLabels.length > 0 ? (
          <>
            {visibleLabels.map((label) => (
              <span
                key={`${group.sub_folder}-${label}`}
                className="inline-flex max-w-full items-center truncate rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[0.76rem] font-semibold leading-4 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-200"
                title={label}
              >
                {label}
              </span>
            ))}
            {remainingCount > 0 ? (
              <button
                type="button"
                onClick={() => onOpenMore(group.sub_folder)}
                className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-red-700 transition-colors hover:bg-red-200 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25"
              >
                +{remainingCount} more
              </button>
            ) : null}
          </>
        ) : (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[0.76rem] font-semibold leading-4 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200">
            All items uploaded
          </span>
        )}
      </div>
    </div>
  );
}

function PendingDocumentPopover({
  group,
  onClose,
}: {
  group: CandidateDocumentGroup | null;
  onClose: () => void;
}) {
  if (!group) return null;

  const pendingLabels = getPendingDocumentLabels(group);

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
              Pending Uploads
            </p>
            <h3 className="mt-2 text-[1.25rem] font-black text-slate-900 dark:text-white">
              {formatTitle(group.sub_folder)}
            </h3>
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
          {pendingLabels.length > 0 ? (
            pendingLabels.map((label) => (
              <span
                key={`${group.sub_folder}-modal-${label}`}
                className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-[0.8rem] font-semibold leading-4 text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-200"
              >
                {label}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[0.8rem] font-semibold leading-4 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200">
              All items uploaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface CandidateDocumentsPageProps {
  session: Session | null;
  initialDocumentData?: CandidateDocumentRequirementsResponse | null;
  initialError?: string | null;
}

export default function CandidateDocumentsPage({
  session,
  initialDocumentData,
  initialError,
}: CandidateDocumentsPageProps) {
  const hasInitialData = initialDocumentData !== undefined || initialError !== undefined;
  const [documentData, setDocumentData] = useState<CandidateDocumentRequirementsResponse | null>(initialDocumentData ?? null);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeDocumentType, setActiveDocumentType] = useState<string | null>(null);
  const [openPendingGroupId, setOpenPendingGroupId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingTarget, setSpeakingTarget] = useState<string | 'all' | null>(null);
  const [preferredVoiceUri, setPreferredVoiceUri] = useState<string | null>(null);

  useEffect(() => {
    if (hasInitialData) {
      return;
    }

    let active = true;

    const loadDocuments = async () => {
      if (!session?.access_token) return;

      setLoading(true);
      setError(null);

      const result = await fetchCandidateDocumentRequirements(session.access_token);

      if (!active) return;

      if (result.success && result.data) {
        setDocumentData(result.data);
      } else {
        setError(result.error ?? 'Could not load document requirements.');
      }

      setLoading(false);
    };

    void loadDocuments();

    return () => {
      active = false;
    };
  }, [hasInitialData, session?.access_token]);

  useEffect(() => {
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
  }, []);

  const candidateName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.email?.split('@')[0] ??
    'Candidate';
  const displayName = formatPersonName(candidateName);

  const orderedGroups = useMemo(() => {
    return [...(documentData?.groups ?? [])].sort((left, right) => {
      if (left.pending_required_documents > 0 && right.pending_required_documents === 0) return -1;
      if (left.pending_required_documents === 0 && right.pending_required_documents > 0) return 1;
      return left.sub_folder.localeCompare(right.sub_folder);
    });
  }, [documentData?.groups]);

  const activeGroup = useMemo(
    () => orderedGroups.find((group) => group.sub_folder === activeGroupId) ?? null,
    [activeGroupId, orderedGroups],
  );

  const modalDocumentTypes = useMemo(
    () => activeGroup?.documents.map((document) => document.document_key) ?? [],
    [activeGroup],
  );

  const totalRequiredDocuments = documentData?.summary?.required_documents ?? 0;
  const uploadedDocuments = documentData?.summary?.uploaded_documents ?? 0;
  const pendingRequiredDocuments = documentData?.summary?.pending_required_documents ?? 0;
  const completionPercentage =
    documentData?.summary?.completion_percentage ??
    (totalRequiredDocuments > 0 ? Math.round((uploadedDocuments / totalRequiredDocuments) * 100) : 100);

  const openPendingGroup = useMemo(
    () => orderedGroups.find((group) => group.sub_folder === openPendingGroupId) ?? null,
    [openPendingGroupId, orderedGroups],
  );

  const stopNarration = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingTarget(null);
  }, []);

  const speakText = useCallback(
    (text: string, target: string | 'all') => {
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
    },
    [preferredVoiceUri],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const publishVoiceState = () => {
      window.dispatchEvent(
        new CustomEvent('candidate-documents-voice-state', {
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
        speakText(
          buildDocumentsNarration({
            uploadedDocuments,
            totalRequiredDocuments,
            pendingRequiredDocuments,
            completionPercentage,
            orderedGroups,
          }),
          'all',
        );
      }
    };

    const handleStateRequest = () => {
      publishVoiceState();
    };

    publishVoiceState();
    window.addEventListener('candidate-documents-voice-command', handleVoiceCommand as EventListener);
    window.addEventListener('candidate-documents-voice-request-state', handleStateRequest);

    return () => {
      window.dispatchEvent(
        new CustomEvent('candidate-documents-voice-state', {
          detail: {
            available: false,
            supported: false,
            speaking: false,
          },
        }),
      );
      window.removeEventListener('candidate-documents-voice-command', handleVoiceCommand as EventListener);
      window.removeEventListener('candidate-documents-voice-request-state', handleStateRequest);
    };
  }, [
    speechSupported,
    speakingTarget,
    stopNarration,
    speakText,
    uploadedDocuments,
    totalRequiredDocuments,
    pendingRequiredDocuments,
    completionPercentage,
    orderedGroups,
  ]);

  const openUploadBucket = (group: CandidateDocumentGroup) => {
    setActiveGroupId(group.sub_folder);
    setActiveDocumentType(getGroupSuggestedDocumentType(group));
    setModalOpen(true);
  };

  const closeUploadBucket = () => {
    setModalOpen(false);
    setActiveGroupId(null);
    setActiveDocumentType(null);
  };

  const handleUploaded = async () => {
    if (!session?.access_token) return;

    const result = await fetchCandidateDocumentRequirements(session.access_token);
    if (result.success && result.data) {
      setDocumentData(result.data);
      setError(null);
    } else {
      setError(result.error ?? 'Could not refresh document requirements.');
    }
  };

  if (loading || !session) {
    return (
      <CandidatePageFrame
        title="Documents"
        subtitle="Candidate document workspace"
        containerClassName="max-w-full"
      >
        <CandidateLoadingState message="Loading document workspace..." />
      </CandidatePageFrame>
    );
  }

  if (error) {
    return (
      <CandidatePageFrame
        title="Documents"
        subtitle="Candidate document workspace"
        containerClassName="max-w-full"
      >
        <CandidateMessageState title="Could not load document workspace" message={error} tone="error" />
      </CandidatePageFrame>
    );
  }

  return (
    <CandidatePageFrame
      title="Documents"
      subtitle="Candidate document workspace"
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
                    Document Workspace
                  </p>
                  <h1 className="mt-4 text-[2.45rem] font-black tracking-tight sm:text-[2.85rem]">
                    Keep your file moving, {displayName}
                  </h1>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <HeroStatusCard label="Overall" value={`${completionPercentage}%`} />
                  <HeroStatusCard label="Uploaded" value={String(uploadedDocuments)} />
                  <HeroStatusCard label="Pending" value={String(pendingRequiredDocuments)} />
                </div>
              </div>
            </CandidateHeroCard>

            <CandidateSurfaceCard className="h-full p-0">
              <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800 lg:px-7">
                <h2 className="text-[2.25rem] font-black text-slate-900 dark:text-white">Upload Bucket</h2>
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3 lg:p-6">
                {orderedGroups.map((group) => (
                  <UploadBucketCard
                    key={group.sub_folder}
                    group={group}
                    onOpen={openUploadBucket}
                  />
                ))}
              </div>
            </CandidateSurfaceCard>
          </div>
        </section>

        <CandidateSurfaceCard className="h-full p-2.5 lg:min-h-0">
          <div
            className="grid h-full gap-2 lg:gap-2"
            style={{ gridTemplateRows: `repeat(${Math.max(orderedGroups.length, 1)}, minmax(0, 1fr))` }}
          >
            {orderedGroups.map((group) => (
              <PendingDocumentBucketCard
                key={`pending-${group.sub_folder}`}
                group={group}
                onOpenMore={setOpenPendingGroupId}
              />
            ))}
          </div>
        </CandidateSurfaceCard>
      </div>

      <PendingDocumentPopover
        group={openPendingGroup}
        onClose={() => setOpenPendingGroupId(null)}
      />

      <CandidateDocumentUploadDialog
        session={session}
        isOpen={modalOpen}
        onClose={closeUploadBucket}
        documentTypes={modalDocumentTypes}
        initialDocumentType={activeDocumentType}
        bucketTitle={activeGroup ? formatTitle(activeGroup.sub_folder) : null}
        onUploaded={handleUploaded}
      />
    </CandidatePageFrame>
  );
}













