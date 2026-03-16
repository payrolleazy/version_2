import { getServerAuthSnapshot } from '@/lib/auth/session';
import { fetchRecruiterInterviewPlans } from '@/lib/recruiter/contracts';
import { formatDate, formatLabel, formatTimeRange, getPanelCount } from '@/lib/recruiter/presentation';
import { PageFrame } from '@/components/ui/PageFrame';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActionLink } from '@/components/ui/ActionButton';

export const dynamic = 'force-dynamic';

export default async function RecruiterCalendarPage() {
  const snapshot = await getServerAuthSnapshot();
  const result = snapshot.session?.access_token
    ? await fetchRecruiterInterviewPlans(snapshot.session.access_token, 100)
    : null;

  const interviews = result?.success ? result.data ?? [] : [];
  const error = result && !result.success ? result.error ?? 'Could not load recruiter calendar.' : null;

  const dayBuckets = [...interviews.reduce((map, item) => {
    const key = item.scheduled_start_at ? new Date(item.scheduled_start_at).toISOString().slice(0, 10) : 'unscheduled';
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
    return map;
  }, new Map<string, typeof interviews>()).entries()]
    .sort(([left], [right]) => {
      if (left === 'unscheduled') return 1;
      if (right === 'unscheduled') return -1;
      return left.localeCompare(right);
    })
    .map(([key, items]) => ({
      key,
      label: key === 'unscheduled' ? 'Unscheduled interviews' : formatDate(`${key}T00:00:00.000Z`),
      items: items.sort((left, right) => {
        const leftTime = left.scheduled_start_at ? new Date(left.scheduled_start_at).getTime() : 0;
        const rightTime = right.scheduled_start_at ? new Date(right.scheduled_start_at).getTime() : 0;
        return leftTime - rightTime;
      }),
    }));

  const scheduled = interviews.filter((item) => item.status === 'scheduled').length;
  const unscheduled = interviews.filter((item) => !item.scheduled_start_at).length;
  const activeDays = dayBuckets.filter((bucket) => bucket.key !== 'unscheduled').length;

  return (
    <PageFrame>
      <HeroCard>
        <SectionHeader
          eyebrow="Recruiter"
          title="Recruiter calendar"
          description="This view reads only the recruiter-owned interview-plan surface and groups rounds by day."
          status="Wave 1"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Scheduled" value={String(scheduled)} hint="Interview rounds already scheduled in the recruiter-safe plan view." />
          <MetricCard label="Open days" value={String(activeDays)} hint="Distinct calendar days currently carrying recruiter-owned interview load." />
          <MetricCard label="Unscheduled" value={String(unscheduled)} hint="Interview rows that exist but do not yet have a scheduled start time." />
        </div>
      </HeroCard>

      {error ? <EmptyState title="Could not load recruiter calendar" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Schedule view"
              title="Interview plan by day"
              description="Every card here comes from the live recruiter-scoped interview plan read surface."
            />
            <div className="mt-6 space-y-5">
              {dayBuckets.length > 0 ? (
                dayBuckets.map((bucket) => (
                  <SurfaceCard key={bucket.key} className="p-6">
                    <SectionHeader
                      eyebrow="Day bucket"
                      title={bucket.label}
                      description={`${bucket.items.length} interview ${bucket.items.length === 1 ? 'slot' : 'slots'} currently in this bucket.`}
                    />
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {bucket.items.map((item) => (
                        <SurfaceCard key={item.id} className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{formatLabel(item.round_code)}</p>
                              <p className="mt-2 text-lg font-black text-slate-950">{formatDate(item.scheduled_start_at)}</p>
                            </div>
                            <StatusChip tone={item.status === 'scheduled' ? 'info' : 'warning'}>
                              {formatLabel(item.status)}
                            </StatusChip>
                          </div>
                          <div className="mt-3 grid gap-2 text-sm text-slate-600">
                            <p>Time: {formatTimeRange(item.scheduled_start_at, item.scheduled_end_at)}</p>
                            <p>Candidate state: {item.candidate_pipeline_state_id}</p>
                            <p>Panel members: {getPanelCount(item.panel_json)}</p>
                          </div>
                        </SurfaceCard>
                      ))}
                    </div>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState title="No interview plans yet" message="Recruiter-owned rounds will appear here once scheduling becomes active." />
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Coverage"
              title="Calendar scope"
              description="This route intentionally exposes only recruiter-owned interview plans, not tenant-wide scheduling."
            />
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.05rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Scheduled interviews</p>
                <p className="mt-2 text-lg font-black text-slate-950">{scheduled}</p>
              </div>
              <div className="rounded-[1.05rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Unscheduled rows</p>
                <p className="mt-2 text-lg font-black text-slate-950">{unscheduled}</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Next"
              title="Continue recruiter flow"
              description="Queue and pipeline now work alongside this calendar inside the new protected shell."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <ActionLink href="/recruiter/queue" variant="primary">Open queue</ActionLink>
              <ActionLink href="/recruiter/pipeline" variant="secondary">Open pipeline</ActionLink>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}
