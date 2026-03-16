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
import {
  acknowledgeCandidateLetter,
  fetchCandidateOfferRoom,
  markCandidateLetterRead,
  type CandidateOfferRoomLetter,
} from '@/lib/candidate/contracts';

function formatLabel(value: string | null | undefined) {
  if (!value) return 'Pending';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date unavailable';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function getTone(status: string): 'info' | 'warning' | 'success' {
  if (status === 'acknowledged') return 'success';
  if (status === 'read') return 'info';
  return 'warning';
}

function buildStats(letters: CandidateOfferRoomLetter[]) {
  return letters.reduce(
    (accumulator, letter) => {
      if (letter.room_status === 'acknowledged') {
        accumulator.acknowledged += 1;
      } else if (letter.room_status === 'read') {
        accumulator.read += 1;
      } else {
        accumulator.unread += 1;
      }

      return accumulator;
    },
    { unread: 0, read: 0, acknowledged: 0 },
  );
}

export function CandidateLettersSurface({
  accessToken,
  displayName,
  initialLetters,
  initialError,
}: {
  accessToken: string;
  displayName: string;
  initialLetters: CandidateOfferRoomLetter[];
  initialError: string | null;
}) {
  const [letters, setLetters] = useState(initialLetters);
  const [error, setError] = useState(initialError);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const stats = useMemo(() => buildStats(letters), [letters]);
  const selectedLetter = useMemo(
    () => letters.find((letter) => letter.id === selectedLetterId) ?? null,
    [letters, selectedLetterId],
  );

  async function refreshLetters() {
    setIsRefreshing(true);
    setError(null);

    try {
      const result = await fetchCandidateOfferRoom(accessToken);
      if (result.success && Array.isArray(result.data?.letters)) {
        setLetters(result.data.letters);
      } else {
        setError(result.error ?? 'Could not refresh candidate letters.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  async function openLetter(letter: CandidateOfferRoomLetter) {
    setSelectedLetterId(letter.id);

    if (letter.room_status !== 'new') {
      return;
    }

    const result = await markCandidateLetterRead(accessToken, letter.id);
    if (!result.success) {
      return;
    }

    const readAt = new Date().toISOString();
    setLetters((currentLetters) =>
      currentLetters.map((currentLetter) =>
        currentLetter.id === letter.id
          ? {
              ...currentLetter,
              is_read: true,
              read_at: readAt,
              room_status: 'read',
            }
          : currentLetter,
      ),
    );
  }

  async function acknowledgeSelectedLetter() {
    if (!selectedLetter || selectedLetter.room_status === 'acknowledged') {
      return;
    }

    setIsAcknowledging(true);

    try {
      const result = await acknowledgeCandidateLetter(accessToken, selectedLetter.id);
      if (!result.success) {
        setError(result.error ?? 'Could not acknowledge candidate letter.');
        return;
      }

      const acknowledgedAt = result.data?.acknowledged_at ?? new Date().toISOString();
      setLetters((currentLetters) =>
        currentLetters.map((currentLetter) =>
          currentLetter.id === selectedLetter.id
            ? {
                ...currentLetter,
                room_status: 'acknowledged',
                is_read: true,
                read_at: currentLetter.read_at ?? acknowledgedAt,
                acknowledgement: {
                  acknowledgement_type: result.data?.acknowledgement_type ?? 'acknowledged',
                  acknowledged_at: acknowledgedAt,
                  acknowledgement_payload: {},
                },
              }
            : currentLetter,
        ),
      );
    } finally {
      setIsAcknowledging(false);
    }
  }

  if (error && letters.length === 0) {
    return (
      <PageFrame>
        <EmptyState title="Could not load offer room" message={error} />
      </PageFrame>
    );
  }

  if (selectedLetter) {
    return (
      <PageFrame>
        <SurfaceCard className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                {formatLabel(selectedLetter.letter_type)}
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">{selectedLetter.letter_title}</h2>
              <p className="mt-3 text-sm text-slate-600">
                Shared on {formatDate(selectedLetter.shared_at)}
                {selectedLetter.shared_by_email ? ` by ${selectedLetter.shared_by_email}` : ''}
              </p>
            </div>
            <StatusChip tone={getTone(selectedLetter.room_status)}>
              {formatLabel(selectedLetter.room_status)}
            </StatusChip>
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedLetter.html_content }} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton variant="secondary" onClick={() => setSelectedLetterId(null)}>Back to letters</ActionButton>
            {selectedLetter.room_status !== 'acknowledged' ? (
              <ActionButton onClick={() => void acknowledgeSelectedLetter()} disabled={isAcknowledging}>
                {isAcknowledging ? 'Acknowledging...' : 'Acknowledge letter'}
              </ActionButton>
            ) : null}
            <ActionLink href="/candidate/documents" variant="secondary">Open documents</ActionLink>
          </div>
        </SurfaceCard>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <HeroCard className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_36%),linear-gradient(135deg,_rgba(15,23,42,0.04),_rgba(14,165,233,0.08))]">
        <SectionHeader
          eyebrow="Candidate"
          title={`Offer room for ${displayName}`}
          description={
            stats.unread > 0
              ? `${stats.unread} shared letter${stats.unread === 1 ? '' : 's'} still need review.`
              : 'Your offer room is synced and currently has no unread letters.'
          }
          status={stats.unread > 0 ? 'Review letters' : 'In control'}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Unread" value={String(stats.unread)} hint="Letters still waiting to be opened from the candidate room." />
          <MetricCard label="Read" value={String(stats.read)} hint="Letters already opened but not yet acknowledged." />
          <MetricCard label="Acknowledged" value={String(stats.acknowledged)} hint="Documents already acknowledged by this candidate." />
        </div>
      </HeroCard>

      {error ? (
        <SurfaceCard className="p-5">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SurfaceCard className="p-8">
          <SectionHeader
            eyebrow="Letters"
            title="Shared documents"
            description="This route restores the candidate offer room with read-state handling and acknowledgement on top of the live candidate contracts."
          />
          {letters.length > 0 ? (
            <div className="mt-6 space-y-4">
              {letters.map((letter) => (
                <SurfaceCard key={letter.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                        {formatLabel(letter.letter_type)}
                      </p>
                      <p className="mt-3 text-xl font-black text-slate-950">{letter.letter_title}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Shared on {formatDate(letter.shared_at)}
                        {letter.shared_by_email ? ` by ${letter.shared_by_email}` : ''}
                      </p>
                    </div>
                    <StatusChip tone={getTone(letter.room_status)}>{formatLabel(letter.room_status)}</StatusChip>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <ActionButton onClick={() => void openLetter(letter)}>Open letter</ActionButton>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
              No letters have been shared with this candidate yet.
            </div>
          )}
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Attention"
              title="Latest focus"
              description="The side panel keeps the candidate pointed at the next meaningful document task without bringing back the old shell."
            />
            <div className="mt-5 space-y-3">
              {letters.length > 0 ? (
                <div className="rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Latest letter</p>
                      <p className="mt-2 text-lg font-black text-slate-950">{letters[0].letter_title}</p>
                    </div>
                    <StatusChip tone={getTone(letters[0].room_status)}>{formatLabel(letters[0].room_status)}</StatusChip>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Open the latest shared letter to review the latest HR-issued document.
                  </p>
                </div>
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
                  This offer room is waiting for its first shared document.
                </div>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Navigation"
              title="Portal restoration"
              description="Launchpad, documents, and offer room are now live in version_2. Interview and onboarding remain next."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <ActionLink href="/candidate" variant="secondary">Launchpad</ActionLink>
              <ActionLink href="/candidate/documents" variant="secondary">Documents</ActionLink>
              <ActionButton variant="secondary" onClick={() => void refreshLetters()} disabled={isRefreshing}>
                {isRefreshing ? 'Refreshing...' : 'Refresh letters'}
              </ActionButton>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}
