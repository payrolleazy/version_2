'use client';

import { useMemo, useState } from 'react';
import { ActionButton, ActionLink } from '@/components/ui/ActionButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageFrame } from '@/components/ui/PageFrame';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { CandidateDocumentUploadDialog } from '@/components/candidate/CandidateDocumentUploadDialog';
import { fetchCandidateDocumentRequirements, type CandidateDocumentGroup, type CandidateDocumentRequirementsResponse } from '@/lib/candidate/contracts';

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPendingLabels(group: CandidateDocumentGroup) {
  return group.documents
    .filter((document) => document.is_required && !document.is_uploaded)
    .map((document) => formatLabel(document.document_key));
}

function getSuggestedDocumentType(group: CandidateDocumentGroup) {
  return (
    group.documents.find((document) => document.is_required && !document.is_uploaded)?.document_key ??
    group.documents[0]?.document_key ??
    null
  );
}

export function CandidateDocumentsSurface({
  accessToken,
  displayName,
  initialData,
  initialError,
}: {
  accessToken: string;
  displayName: string;
  initialData: CandidateDocumentRequirementsResponse | null;
  initialError: string | null;
}) {
  const [documentData, setDocumentData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const requiredDocuments = documentData?.summary?.required_documents ?? 0;
  const uploadedDocuments = documentData?.summary?.uploaded_documents ?? 0;
  const pendingDocuments = documentData?.summary?.pending_required_documents ?? 0;
  const completionPercentage =
    documentData?.summary?.completion_percentage ??
    (requiredDocuments > 0 ? Math.round((uploadedDocuments / requiredDocuments) * 100) : 100);

  async function refreshWorkspace() {
    setIsRefreshing(true);
    setError(null);

    try {
      const result = await fetchCandidateDocumentRequirements(accessToken);
      if (result.success && result.data) {
        setDocumentData(result.data);
      } else {
        setError(result.error ?? 'Could not refresh candidate document workspace.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  function openDialog(group: CandidateDocumentGroup) {
    setActiveGroupId(group.sub_folder);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setActiveGroupId(null);
  }

  if (error && !documentData) {
    return (
      <PageFrame>
        <EmptyState title="Could not load candidate documents" message={error} />
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <HeroCard className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.16),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.04),_rgba(34,197,94,0.08))]">
        <SectionHeader
          eyebrow="Candidate"
          title={`Document workspace for ${displayName}`}
          description={
            pendingDocuments > 0
              ? `${pendingDocuments} required document${pendingDocuments === 1 ? '' : 's'} still need attention.`
              : 'All required document buckets currently look complete.'
          }
          status={pendingDocuments > 0 ? 'Needs uploads' : 'Ready'}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Completion" value={`${completionPercentage}%`} hint="Candidate-safe checklist completion based on required uploads." />
          <MetricCard label="Required" value={String(requiredDocuments)} hint="Total required documents currently assigned to this candidate." />
          <MetricCard label="Uploaded" value={String(uploadedDocuments)} hint="Required files already uploaded through the secure file handler." />
          <MetricCard label="Pending" value={String(pendingDocuments)} hint="Required uploads still outstanding in the current checklist." />
        </div>
      </HeroCard>

      {error ? (
        <SurfaceCard className="p-5">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SurfaceCard className="p-8">
          <SectionHeader
            eyebrow="Buckets"
            title="Upload buckets"
            description="Each bucket is backed by the live candidate document requirements contract and can open the secure upload dialog."
          />
          {orderedGroups.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {orderedGroups.map((group) => {
                const pendingLabels = getPendingLabels(group);
                const completion =
                  group.required_documents > 0
                    ? Math.round((group.uploaded_documents / group.required_documents) * 100)
                    : 100;

                return (
                  <SurfaceCard key={group.sub_folder} className="flex h-full flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Bucket</p>
                          <p className="mt-3 text-xl font-black text-slate-950">{formatLabel(group.sub_folder)}</p>
                        </div>
                        <StatusChip tone={group.pending_required_documents > 0 ? 'warning' : 'success'}>
                          {group.pending_required_documents > 0 ? 'Pending' : 'Ready'}
                        </StatusChip>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Required</p>
                          <p className="mt-2 text-2xl font-black text-slate-950">{group.required_documents}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Uploaded</p>
                          <p className="mt-2 text-2xl font-black text-slate-950">{group.uploaded_documents}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Pending</p>
                          <p className="mt-2 text-2xl font-black text-slate-950">{group.pending_required_documents}</p>
                        </div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-cyan-500" style={{ width: `${completion}%` }} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {pendingLabels.length > 0 ? (
                          pendingLabels.slice(0, 4).map((label) => (
                            <span key={`${group.sub_folder}-${label}`} className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              {label}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            All required items uploaded
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <ActionButton onClick={() => openDialog(group)}>Open upload bucket</ActionButton>
                      <ActionButton variant="secondary" onClick={() => void refreshWorkspace()} disabled={isRefreshing}>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                      </ActionButton>
                    </div>
                  </SurfaceCard>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
              No document buckets are published for this candidate yet.
            </div>
          )}
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Priority"
              title="What to upload next"
              description="The right panel keeps the urgent buckets visible even while the detailed document route is being restored."
            />
            <div className="mt-5 space-y-3">
              {orderedGroups.filter((group) => group.pending_required_documents > 0).length > 0 ? (
                orderedGroups
                  .filter((group) => group.pending_required_documents > 0)
                  .slice(0, 5)
                  .map((group) => (
                    <div key={`priority-${group.sub_folder}`} className="rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Bucket</p>
                          <p className="mt-2 text-lg font-black text-slate-950">{formatLabel(group.sub_folder)}</p>
                        </div>
                        <StatusChip tone="warning">{group.pending_required_documents} pending</StatusChip>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {getPendingLabels(group).slice(0, 3).join(', ') || 'Review this bucket for pending uploads.'}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
                  No urgent buckets remain right now.
                </div>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Navigation"
              title="Portal restoration"
              description="Launchpad, documents, and offer room are now live inside the restored candidate portal. Interview follows next."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <ActionLink href="/candidate" variant="secondary">Back to launchpad</ActionLink>
              <ActionLink href="/candidate/letters" variant="secondary">Offer room live</ActionLink>
              <span className="inline-flex items-center rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                Interview next
              </span>
            </div>
          </SurfaceCard>
        </div>
      </div>

      {activeGroup ? (
        <CandidateDocumentUploadDialog
          accessToken={accessToken}
          isOpen={isDialogOpen}
          onClose={closeDialog}
          documentTypes={activeGroup.documents.map((document) => document.document_key)}
          initialDocumentType={getSuggestedDocumentType(activeGroup)}
          bucketTitle={formatLabel(activeGroup.sub_folder)}
          onUploaded={refreshWorkspace}
        />
      ) : null}
    </PageFrame>
  );
}


