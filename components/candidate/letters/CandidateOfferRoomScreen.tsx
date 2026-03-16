'use client';

import { useRouter } from 'next/navigation';

import CandidateSidebarSection from '@/components/candidate/shell/CandidateSidebarSection';
import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateCallout from '@/components/candidate/ui/CandidateCallout';
import CandidateHeroCard from '@/components/candidate/ui/CandidateHeroCard';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import CandidateMessageState from '@/components/candidate/ui/CandidateMessageState';
import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import { CandidateOfferRoomLetter } from '@/lib/candidate/contracts';
import { useCandidateOfferRoom, type CandidateOfferRoomStats } from '@/hooks/useCandidateOfferRoom';

const letterTypeLabels: Record<string, string> = {
  offer_letter: 'Offer Letter',
  appointment_letter: 'Appointment Letter',
  welcome_letter: 'Welcome Letter',
  custom: 'Letter',
};

const letterTypeColors: Record<string, string> = {
  offer_letter: 'from-emerald-500 to-green-500',
  appointment_letter: 'from-blue-500 to-indigo-500',
  welcome_letter: 'from-purple-500 to-pink-500',
  custom: 'from-slate-500 to-slate-700',
};

function formatRoomStatus(status: string) {
  if (status === 'acknowledged') return 'Acknowledged';
  if (status === 'read') return 'Read';
  return 'New';
}

function getRoomStatusClasses(status: string) {
  if (status === 'acknowledged') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  }
  if (status === 'read') {
    return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
  }
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
}

function LetterListCard({
  letter,
  onOpen,
}: {
  letter: CandidateOfferRoomLetter;
  onOpen: (letter: CandidateOfferRoomLetter) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(letter)}
      className={`w-full rounded-[1.75rem] border p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        letter.room_status === 'new'
          ? 'border-sky-200 bg-sky-50 dark:border-sky-900/40 dark:bg-sky-950/30'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${
              letterTypeColors[letter.letter_type] || letterTypeColors.custom
            } shadow-md`}
          >
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-base font-black text-slate-900 dark:text-white">{letter.letter_title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full bg-gradient-to-r px-2.5 py-1 text-[11px] font-bold text-white ${
                  letterTypeColors[letter.letter_type] || letterTypeColors.custom
                }`}
              >
                {letterTypeLabels[letter.letter_type] || letter.letter_type}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getRoomStatusClasses(letter.room_status)}`}>
                {formatRoomStatus(letter.room_status)}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Shared on{' '}
              {new Date(letter.shared_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              {letter.shared_by_email ? ` by ${letter.shared_by_email}` : ''}
            </p>
          </div>
        </div>

        {letter.room_status === 'new' ? <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-sky-500" /> : null}
      </div>
    </button>
  );
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

export default function CandidateOfferRoomScreen({
  session,
  initialLetters,
  initialStats,
  initialError,
}: {
  session: { access_token?: string } | null;
  initialLetters?: CandidateOfferRoomLetter[];
  initialStats?: CandidateOfferRoomStats;
  initialError?: string | null;
}) {
  const router = useRouter();
  const {
    letters,
    loading,
    error,
    stats,
    selectedLetter,
    acknowledging,
    fetchLetters,
    openLetter,
    closeLetter,
    acknowledgeSelected,
    downloadSelectedPdf,
  } = useCandidateOfferRoom(session?.access_token, true, {
    initialLetters,
    initialStats,
    initialError,
  });

  const latestLetter = letters[0] ?? null;

  if (loading && !error && letters.length === 0 && !selectedLetter) {
    return (
      <CandidatePageFrame
        title="Letters"
        subtitle="Candidate letter workspace"
        containerClassName="max-w-full"
      >
        <CandidateLoadingState message="Loading your shared letters..." />
      </CandidatePageFrame>
    );
  }

  if (selectedLetter) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(17rem,1fr)_minmax(0,3fr)_minmax(17rem,1fr)] lg:items-stretch">
        <CandidateSidebarSection className="lg:h-full" />

        <section className="min-w-0 h-full lg:min-h-0">
          <CandidateSurfaceCard className="h-full min-h-0 p-0">
            <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800 lg:px-7">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold text-white ${
                    letterTypeColors[selectedLetter.letter_type] || letterTypeColors.custom
                  }`}
                >
                  {letterTypeLabels[selectedLetter.letter_type] || selectedLetter.letter_type}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${getRoomStatusClasses(selectedLetter.room_status)}`}>
                  {formatRoomStatus(selectedLetter.room_status)}
                </span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Shared on{' '}
                  {new Date(selectedLetter.shared_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {selectedLetter.shared_by_email ? ` by ${selectedLetter.shared_by_email}` : ''}
                </p>
              </div>
            </div>

            <div className="h-full overflow-y-auto p-5 lg:p-6">
              <div
                id="candidate-offer-room-letter"
                className="prose prose-sm max-w-none rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                dangerouslySetInnerHTML={{ __html: selectedLetter.html_content }}
              />
            </div>
          </CandidateSurfaceCard>
        </section>

        <CandidateSurfaceCard className="h-full p-2.5 lg:min-h-0">
          <div className="grid h-full gap-2 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-2">
            <div className="flex min-h-0 flex-col justify-between overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Action rail</p>
                <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">What to do next</h2>
              </div>

              <div className="mt-4">
                {selectedLetter.room_status !== 'acknowledged' ? (
                  <CandidateCallout
                    tone="attention"
                    title="Review before joining"
                    message="Read the complete letter, then acknowledge it so HR knows you reviewed the latest shared document."
                  />
                ) : (
                  <CandidateCallout
                    tone="success"
                    title="Already acknowledged"
                    message={`Acknowledged on ${
                      selectedLetter.acknowledgement?.acknowledged_at
                        ? new Date(selectedLetter.acknowledgement.acknowledged_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'your latest session'
                    }.`}
                  />
                )}
              </div>

              <div className="mt-4 space-y-3">
                <CandidateActionButton block variant="outline" onClick={closeLetter}>
                  Back to letters
                </CandidateActionButton>
                {selectedLetter.room_status !== 'acknowledged' ? (
                  <CandidateActionButton block onClick={acknowledgeSelected} isLoading={acknowledging}>
                    Acknowledge letter
                  </CandidateActionButton>
                ) : null}
                <CandidateActionButton block variant="ghost" onClick={() => downloadSelectedPdf('candidate-offer-room-letter')}>
                  Download PDF
                </CandidateActionButton>
              </div>
            </div>

            <div className="flex min-h-0 flex-col justify-between overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Move next</p>
                <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Continue your next task</h2>
              </div>

              <div className="mt-4 space-y-3">
                <CandidateActionButton block onClick={() => router.push('/candidate/onboarding')}>
                  Open onboarding
                </CandidateActionButton>
                <CandidateActionButton block variant="outline" onClick={() => router.push('/candidate/documents')}>
                  Review documents
                </CandidateActionButton>
              </div>
            </div>
          </div>
        </CandidateSurfaceCard>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(17rem,1fr)_minmax(0,3fr)_minmax(17rem,1fr)] lg:items-stretch">
      <CandidateSidebarSection className="lg:h-full" />

      <section className="min-w-0 h-full lg:min-h-0">
        <div className="grid h-full gap-4 lg:grid-rows-[minmax(0,1fr)_minmax(0,1.8fr)]">
          <CandidateHeroCard
            className="h-full min-h-[13.5rem] px-8 py-7 sm:px-9 sm:py-8"
            gradientClassName="from-indigo-600 via-sky-600 to-cyan-600"
          >
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-100/85">Latest shared letter</p>
                <h1 className="mt-4 text-[2.45rem] font-black tracking-tight sm:text-[2.85rem]">
                  {latestLetter ? latestLetter.letter_title : 'Shared letters'}
                </h1>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3">
                <HeroStatusCard label="New" value={String(stats.unreadCount)} />
                <HeroStatusCard label="Read" value={String(stats.readCount)} />
                <HeroStatusCard label="Acknowledged" value={String(stats.acknowledgedCount)} />
              </div>
            </div>
          </CandidateHeroCard>

          <CandidateSurfaceCard className="h-full min-h-0 p-0">
            <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800 lg:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Letter workspace</p>
                  <h2 className="mt-2 text-[2.25rem] font-black text-slate-900 dark:text-white">Shared letters</h2>
                </div>
                <CandidateActionButton variant="ghost" onClick={() => void fetchLetters()} isLoading={loading}>
                  Refresh letters
                </CandidateActionButton>
              </div>
            </div>

            <div className="h-full overflow-y-auto p-5 lg:p-6">
              {loading ? (
                <CandidateCallout
                  tone="info"
                  title="Loading your letters"
                  message="Fetching the latest items shared by HR."
                />
              ) : null}

              {error ? (
                <CandidateMessageState
                  title="Could not load letters"
                  message={error}
                  tone="error"
                  action={
                    <CandidateActionButton onClick={() => void fetchLetters()} size="sm">
                      Retry
                    </CandidateActionButton>
                  }
                />
              ) : null}

              {!loading && !error && letters.length === 0 ? (
                <CandidateMessageState
                  title="No letters shared yet"
                  message="Offer letters, appointment letters, and other candidate documents will appear here once HR shares them."
                />
              ) : null}

              {!loading && !error && letters.length > 0 ? (
                <div className="grid gap-4">
                  {letters.map((letter) => (
                    <LetterListCard key={letter.id} letter={letter} onOpen={openLetter} />
                  ))}
                </div>
              ) : null}
            </div>
          </CandidateSurfaceCard>
        </div>
      </section>

      <CandidateSurfaceCard className="h-full p-2.5 lg:min-h-0">
        <div className="grid h-full gap-2 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-2">
          <div className="flex min-h-0 flex-col justify-between overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Attention</p>
              <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">What needs attention</h2>
            </div>

            <div className="mt-4">
              {stats.unreadCount > 0 ? (
                <CandidateCallout
                  tone="attention"
                  title="Review unread letters"
                  message={`You still have ${stats.unreadCount} unread letter${stats.unreadCount === 1 ? '' : 's'} waiting for review.`}
                />
              ) : (
                <CandidateCallout
                  tone="success"
                  title="Offer room is under control"
                  message="You are caught up on unread letters. Revisit this space any time HR shares a new document."
                />
              )}
            </div>

            {latestLetter ? (
              <div className="mt-4 rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Latest issue</p>
                <p className="mt-2 text-base font-black text-slate-900 dark:text-white">{latestLetter.letter_title}</p>
                <div className="mt-3">
                  <CandidateActionButton size="sm" onClick={() => openLetter(latestLetter)}>
                    Open latest letter
                  </CandidateActionButton>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col justify-between overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Quick move</p>
              <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Continue your next task</h2>
            </div>

            <div className="mt-4 space-y-3">
              <CandidateActionButton block onClick={() => router.push('/candidate/onboarding')}>
                Open onboarding
              </CandidateActionButton>
              <CandidateActionButton block variant="outline" onClick={() => router.push('/candidate/documents')}>
                Review documents
              </CandidateActionButton>
              <CandidateActionButton block variant="ghost" onClick={() => void fetchLetters()} isLoading={loading}>
                Refresh letters
              </CandidateActionButton>
            </div>
          </div>
        </div>
      </CandidateSurfaceCard>
    </div>
  );
}



