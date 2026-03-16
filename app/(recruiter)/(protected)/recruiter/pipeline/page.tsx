import { getServerAuthSnapshot } from '@/lib/auth/session';
import { fetchRecruiterCandidatePipeline } from '@/lib/recruiter/contracts';
import {
  formatDateTime,
  formatLabel,
  getCandidateDisplayName,
  getCandidateRole,
  getCandidateSourceLabel,
  getDaysSinceUpdate,
  getScoreValue,
  isFreshCandidate,
  isStaleCandidate,
} from '@/lib/recruiter/presentation';
import { PageFrame } from '@/components/ui/PageFrame';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActionLink } from '@/components/ui/ActionButton';

export const dynamic = 'force-dynamic';

const stagePriority: Record<string, number> = {
  sourced: 1,
  screening: 2,
  shortlisted: 3,
  interviewing: 4,
  interview: 4,
  offered: 5,
  offer: 5,
  selected: 6,
  conversion_ready: 7,
  converted: 8,
  hired: 8,
  rejected: 99,
  withdrawn: 100,
};

export default async function RecruiterPipelinePage() {
  const snapshot = await getServerAuthSnapshot();
  const result = snapshot.session?.access_token
    ? await fetchRecruiterCandidatePipeline(snapshot.session.access_token, 150)
    : null;

  const rows = result?.success ? result.data ?? [] : [];
  const error = result && !result.success ? result.error ?? 'Could not load recruiter pipeline.' : null;

  const total = rows.length;
  const stale = rows.filter(isStaleCandidate).length;
  const activeStages = new Set(
    rows.map((row) => row.current_stage_code?.toLowerCase()).filter((value): value is string => Boolean(value)),
  ).size;
  const scores = rows.map((row) => getScoreValue(row.current_score)).filter((value): value is number => value !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;

  const stageColumns = [...rows.reduce((map, row) => {
    const key = (row.current_stage_code ?? 'unassigned').toLowerCase();
    const bucket = map.get(key) ?? [];
    bucket.push(row);
    map.set(key, bucket);
    return map;
  }, new Map<string, typeof rows>()).entries()]
    .sort((left, right) => {
      const leftPriority = stagePriority[left[0]] ?? 1000;
      const rightPriority = stagePriority[right[0]] ?? 1000;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
      return formatLabel(left[0]).localeCompare(formatLabel(right[0]));
    })
    .map(([key, bucket]) => ({
      key,
      label: formatLabel(key),
      rows: bucket.sort((left, right) => {
        const leftTime = left.updated_at ? new Date(left.updated_at).getTime() : 0;
        const rightTime = right.updated_at ? new Date(right.updated_at).getTime() : 0;
        return rightTime - leftTime;
      }),
    }));

  return (
    <PageFrame>
      <HeroCard>
        <SectionHeader
          eyebrow="Recruiter"
          title="Candidate pipeline board"
          description="This board is now reading the recruiter-scoped candidate-state surface directly inside the new protected app."
          status="Wave 1"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard label="Candidates" value={String(total)} hint="Recruiter-owned candidate rows currently visible in the board." />
          <MetricCard label="Active stages" value={String(activeStages)} hint="Distinct live stage groups currently returned by the recruiter-safe read layer." />
          <MetricCard label="Avg score" value={String(avgScore)} hint="Average candidate score across rows where a score is present." />
          <MetricCard label="Stale 7+" value={String(stale)} hint="Candidates that have been sitting in the same stage for more than seven days." />
        </div>
      </HeroCard>

      {error ? <EmptyState title="Could not load recruiter pipeline" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Live board"
              title="Stage by stage"
              description="Columns are derived directly from the current stage codes returned by the recruiter-scoped read model."
            />
            <div className="mt-6 overflow-x-auto pb-2">
              {stageColumns.length > 0 ? (
                <div className="flex gap-4">
                  {stageColumns.map((column) => (
                    <SurfaceCard key={column.key} className="min-w-[19rem] shrink-0 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Stage</p>
                          <h3 className="mt-2 text-lg font-black text-slate-950">{column.label}</h3>
                        </div>
                        <StatusChip tone="info">{column.rows.length}</StatusChip>
                      </div>
                      <div className="mt-5 space-y-3">
                        {column.rows.map((row) => {
                          const score = getScoreValue(row.current_score);
                          const staleDays = getDaysSinceUpdate(row.updated_at ?? row.created_at);
                          const tone = score !== null && score >= 70 ? 'success' : isFreshCandidate(row) ? 'info' : 'warning';

                          return (
                            <SurfaceCard key={row.id} className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-slate-500">{getCandidateSourceLabel(row)}</p>
                                  <h4 className="mt-2 text-base font-black text-slate-950">{getCandidateDisplayName(row)}</h4>
                                </div>
                                <StatusChip tone={tone}>{score !== null ? `${Math.round(score)}` : 'NA'}</StatusChip>
                              </div>
                              <div className="mt-3 space-y-2 text-sm text-slate-600">
                                <p>{getCandidateRole(row)}</p>
                                <p>Status: {formatLabel(row.application_status)}</p>
                                <p>Updated: {formatDateTime(row.updated_at ?? row.created_at)}</p>
                              </div>
                              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                {staleDays !== null ? `${staleDays} day${staleDays === 1 ? '' : 's'} in stage` : 'Freshly updated'}
                              </p>
                            </SurfaceCard>
                          );
                        })}
                      </div>
                    </SurfaceCard>
                  ))}
                </div>
              ) : (
                <EmptyState title="No candidates in pipeline" message="Recruiter-owned candidate rows will appear here once the live pipeline becomes active." />
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Focus"
              title="What to watch"
              description="This wave keeps the board read-first and exposes the most actionable signals only."
            />
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.05rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Freshly updated</p>
                <p className="mt-2 text-lg font-black text-slate-950">{rows.filter(isFreshCandidate).length} candidates</p>
              </div>
              <div className="rounded-[1.05rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">High score</p>
                <p className="mt-2 text-lg font-black text-slate-950">{rows.filter((row) => (getScoreValue(row.current_score) ?? 0) >= 70).length} candidates</p>
              </div>
              <div className="rounded-[1.05rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Stale stages</p>
                <p className="mt-2 text-lg font-black text-slate-950">{stale} candidates</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Next"
              title="Continue recruiter flow"
              description="After pipeline, the next most useful operational view is calendar."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <ActionLink href="/recruiter/calendar" variant="primary">Open calendar</ActionLink>
              <ActionLink href="/recruiter/requisitions" variant="secondary">Open requisitions</ActionLink>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}
