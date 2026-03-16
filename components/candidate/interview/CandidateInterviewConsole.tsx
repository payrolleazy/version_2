'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';

import CandidateSidebarSection from '@/components/candidate/shell/CandidateSidebarSection';
import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateHeroCard from '@/components/candidate/ui/CandidateHeroCard';
import CandidateLoadingState from '@/components/candidate/ui/CandidateLoadingState';
import CandidateMessageState from '@/components/candidate/ui/CandidateMessageState';
import CandidatePageFrame from '@/components/candidate/ui/CandidatePageFrame';
import CandidateSurfaceCard from '@/components/candidate/ui/CandidateSurfaceCard';
import {
  CandidateInterviewConsoleItem,
  CandidateInterviewConsoleResponse,
  fetchCandidateInterviewConsole,
} from '@/lib/candidate/contracts';
import { StatusBadge } from '@/components/ui/StatusBadge';

type CandidateSessionLike = Session | null;

function formatPersonName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatRoundLabel(value: string | null | undefined) {
  if (!value) return 'Pending';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return 'TBD';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function formatDateTimeRange(start: string | null | undefined, end: string | null | undefined) {
  if (!start) return 'No interview has been scheduled yet.';

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return 'Schedule unavailable';

  const datePart = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(startDate);

  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const startTime = timeFormatter.format(startDate);

  if (!end) {
    return `${datePart}  -  ${startTime}`;
  }

  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) {
    return `${datePart}  -  ${startTime}`;
  }

  return `${datePart}  -  ${startTime} to ${timeFormatter.format(endDate)}`;
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

function RailCard({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-col justify-between rounded-[1.1rem] border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
        <h3 className="mt-2 text-[1rem] font-black leading-5 text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-[0.84rem] leading-5 text-slate-600 dark:text-slate-300">{body}</p>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function InterviewListCard({
  interview,
  isPrimary = false,
}: {
  interview: CandidateInterviewConsoleItem;
  isPrimary?: boolean;
}) {
  const openJoinUrl = () => {
    if (!interview.join_url || typeof window === 'undefined') return;
    window.open(interview.join_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-[1.45rem] border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[1.05rem] font-black text-slate-900 dark:text-white">
            {interview.meeting_label || formatRoundLabel(interview.round_code)}
          </p>
          <p className="mt-1 text-[0.9rem] text-slate-600 dark:text-slate-300">
            {formatDateTimeRange(interview.scheduled_start_at, interview.scheduled_end_at)}
          </p>
        </div>
        <StatusBadge status={interview.status || 'scheduled'} size="sm" showDot />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Provider</p>
          <p className="mt-2 text-[0.96rem] font-bold text-slate-900 dark:text-white">
            {interview.meeting_provider ? interview.meeting_provider.replace(/_/g, ' ') : 'Microsoft Teams'}
          </p>
        </div>
        <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Contact</p>
          <p className="mt-2 text-[0.96rem] font-bold text-slate-900 dark:text-white">
            {interview.contact_name || 'Recruitment Team'}
          </p>
          {interview.contact_email ? (
            <p className="mt-1 text-[0.84rem] text-slate-600 dark:text-slate-300">{interview.contact_email}</p>
          ) : null}
        </div>
        <div className="rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Join</p>
          <div className="mt-2">
            {interview.join_url ? (
              <CandidateActionButton size="sm" onClick={openJoinUrl}>
                Join Microsoft Teams
              </CandidateActionButton>
            ) : (
              <span className="text-[0.9rem] font-semibold text-slate-600 dark:text-slate-300">
                Link not shared yet
              </span>
            )}
          </div>
        </div>
      </div>

      {interview.instructions ? (
        <div className="mt-4 rounded-[1rem] border border-sky-200 bg-sky-50/80 px-3.5 py-3 text-[0.9rem] leading-6 text-slate-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-slate-200">
          <span className="font-black text-slate-900 dark:text-white">Instructions:</span> {interview.instructions}
        </div>
      ) : null}

      {isPrimary ? (
        <p className="mt-4 text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          This is your nearest active interview round.
        </p>
      ) : null}
    </div>
  );
}

export default function CandidateInterviewConsole({
  session,
}: {
  session: CandidateSessionLike;
}) {
  const router = useRouter();
  const [consoleData, setConsoleData] = useState<CandidateInterviewConsoleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadInterviewConsole = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await fetchCandidateInterviewConsole(session.access_token);

      if (!active) return;

      if (result.success && result.data) {
        setConsoleData(result.data);
      } else {
        setError(result.error ?? 'Could not load the interview console.');
      }

      setLoading(false);
    };

    void loadInterviewConsole();

    return () => {
      active = false;
    };
  }, [session?.access_token]);

  const displayName = formatPersonName(
    consoleData?.candidate?.candidate_name ||
      session?.user?.user_metadata?.full_name ||
      session?.user?.email?.split('@')[0] ||
      'Candidate',
  );

  const primaryInterview = consoleData?.primary_interview ?? null;
  const upcomingInterviews = useMemo(() => {
    const rows = consoleData?.upcoming_interviews ?? [];
    if (!primaryInterview) return rows;
    return rows.filter((item) => item.interview_plan_id !== primaryInterview.interview_plan_id);
  }, [consoleData?.upcoming_interviews, primaryInterview]);

  const roundValue = primaryInterview ? formatRoundLabel(primaryInterview.round_code) : 'Pending';
  const dateValue = primaryInterview ? formatShortDate(primaryInterview.scheduled_start_at) : 'TBD';
  const joinValue = primaryInterview?.join_url ? 'Ready' : 'Wait';

  const openPrimaryJoinUrl = () => {
    if (!primaryInterview?.join_url || typeof window === 'undefined') return;
    window.open(primaryInterview.join_url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <CandidatePageFrame
        title="Interview"
        subtitle="Candidate interview console"
        containerClassName="max-w-full"
      >
        <CandidateLoadingState message="Loading interview console..." />
      </CandidatePageFrame>
    );
  }

  if (error) {
    return (
      <CandidatePageFrame
        title="Interview"
        subtitle="Candidate interview console"
        containerClassName="max-w-full"
      >
        <CandidateMessageState
          title="Could not load interview console"
          message={error}
          tone="error"
        />
      </CandidatePageFrame>
    );
  }

  return (
    <CandidatePageFrame
      title="Interview"
      subtitle="Candidate interview console"
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
                    Interview Console
                  </p>
                  <h1 className="mt-4 text-[2.45rem] font-black tracking-tight sm:text-[2.85rem]">
                    Stay ready, {displayName}
                  </h1>
                  <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 text-cyan-50/92">
                    Review your scheduled interview round, keep your meeting link ready, and join Microsoft Teams directly when HR shares the session.
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <HeroStatusCard label="Next Round" value={roundValue} />
                  <HeroStatusCard label="Schedule" value={dateValue} />
                  <HeroStatusCard label="Join" value={joinValue} />
                </div>
              </div>
            </CandidateHeroCard>

            <CandidateSurfaceCard className="h-full p-0">
              <div className="border-b border-slate-200 px-6 py-6 dark:border-slate-800 lg:px-7">
                <h2 className="text-[2.25rem] font-black text-slate-900 dark:text-white">Interview Desk</h2>
              </div>

              <div className="space-y-4 p-5 lg:p-6">
                {consoleData?.has_interview && primaryInterview ? (
                  <>
                    <InterviewListCard interview={primaryInterview} isPrimary />
                    {upcomingInterviews.length > 0 ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-[0.8rem] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Upcoming Rounds
                          </p>
                          <h3 className="mt-2 text-[1.15rem] font-black text-slate-900 dark:text-white">
                            What comes after your next interview
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {upcomingInterviews.map((interview) => (
                            <InterviewListCard
                              key={interview.interview_plan_id}
                              interview={interview}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <CandidateMessageState
                    title="No interview scheduled yet"
                    message={consoleData?.message || 'Your interview plan is not available yet. Once the recruiter schedules a round, you will see the schedule and join link here.'}
                    action={
                      <div className="flex flex-wrap gap-3">
                        <CandidateActionButton onClick={() => router.push('/candidate/letters')}>
                          Review offer room
                        </CandidateActionButton>
                        <CandidateActionButton variant="outline" onClick={() => router.push('/candidate/onboarding')}>
                          Continue onboarding
                        </CandidateActionButton>
                      </div>
                    }
                  />
                )}
              </div>
            </CandidateSurfaceCard>
          </div>
        </section>

        <CandidateSurfaceCard className="h-full p-2.5 lg:min-h-0">
          <div className="grid h-full gap-2 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <RailCard
              eyebrow="Application"
              title={consoleData?.candidate?.position_title || 'Interview pipeline'}
              body={consoleData?.candidate?.application_status ? `Current application status: ${consoleData.candidate.application_status.replace(/_/g, ' ').toLowerCase()}.` : 'Your recruiter will update this console as soon as the next round is scheduled.'}
            />

            <RailCard
              eyebrow="Join"
              title={primaryInterview?.meeting_label || 'Waiting for interview link'}
              body={primaryInterview?.join_url ? 'Your Microsoft Teams join link is ready. Join from here when your round starts.' : 'The interview slot is not ready yet. HR will share the join link here once the round is scheduled.'}
              action={
                primaryInterview?.join_url ? (
                  <CandidateActionButton size="sm" onClick={openPrimaryJoinUrl}>
                    Join Microsoft Teams
                  </CandidateActionButton>
                ) : undefined
              }
            />

            <RailCard
              eyebrow="Support"
              title={primaryInterview?.contact_name || 'Recruitment Team'}
              body={primaryInterview?.instructions || primaryInterview?.contact_email || 'Use this console to check interview timing, instructions, and contact details before the round starts.'}
            />
          </div>
        </CandidateSurfaceCard>
      </div>
    </CandidatePageFrame>
  );
}


