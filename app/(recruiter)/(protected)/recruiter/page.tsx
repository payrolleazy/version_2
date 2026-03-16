import { getServerAuthSnapshot } from '@/lib/auth/session';
import { fetchRecruiterDashboard } from '@/lib/recruiter/contracts';
import { PageFrame } from '@/components/ui/PageFrame';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActionLink } from '@/components/ui/ActionButton';

export const dynamic = 'force-dynamic';

function formatLabel(value: string | null | undefined) {
  if (!value) return 'Pending';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateRange(start: string | null | undefined, end: string | null | undefined) {
  if (!start) {
    return 'Not scheduled yet';
  }

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) {
    return 'Schedule unavailable';
  }

  const dateText = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(startDate);

  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const startText = timeFormatter.format(startDate);

  if (!end) {
    return `${dateText} - ${startText}`;
  }

  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) {
    return `${dateText} - ${startText}`;
  }

  return `${dateText} - ${startText} - ${timeFormatter.format(endDate)}`;
}

export default async function RecruiterOverviewPage() {
  const snapshot = await getServerAuthSnapshot();
  const result = snapshot.session?.access_token
    ? await fetchRecruiterDashboard(snapshot.session.access_token)
    : null;

  const dashboard = result?.success ? result.data : null;
  const error = result && !result.success ? result.error ?? 'Could not load recruiter overview.' : null;
  const openRequisitionCount = dashboard?.open_requisition_count ?? 0;
  const pendingFeedbackCount = dashboard?.pending_feedback_count ?? 0;
  const upcomingInterviews = dashboard?.upcoming_interviews ?? [];
  const offerSummary = dashboard?.offer_summary ?? [];
  const stageSummary = dashboard?.candidate_status_summary ?? [];
  const displayName = snapshot.user?.user_metadata?.full_name ?? snapshot.user?.email?.split('@')[0] ?? 'Recruiter';

  return (
    <PageFrame>
      <HeroCard>
        <SectionHeader
          eyebrow="Recruiter"
          title={`Recruiter overview for ${displayName}`}
          description="This protected recruiter home now sits on the live dashboard contract and links into the first real recruiter route set inside version_2."
          status="Wave 1"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Open requisitions"
            value={String(openRequisitionCount)}
            hint="Live recruiter-owned demand from the RCM dashboard contract."
          />
          <MetricCard
            label="Upcoming interviews"
            value={String(upcomingInterviews.length)}
            hint="Scheduled rounds currently assigned to this recruiter workbench."
          />
          <MetricCard
            label="Pending feedback"
            value={String(pendingFeedbackCount)}
            hint="Feedback workload currently surfaced by the recruiter dashboard."
          />
        </div>
      </HeroCard>

      {error ? <EmptyState title="Could not load recruiter overview" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Pipeline"
              title="Candidate status summary"
              description="These stage counts come directly from the live recruiter-safe dashboard response."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {stageSummary.length > 0 ? (
                stageSummary.map((item) => (
                  <SurfaceCard key={`${item.application_status}-${item.count}`} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Stage</p>
                        <p className="mt-3 text-xl font-black text-slate-950">{formatLabel(item.application_status)}</p>
                      </div>
                      <StatusChip tone="info">{item.count}</StatusChip>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Candidates currently sitting in this recruiter-owned pipeline stage.
                    </p>
                  </SurfaceCard>
                ))
              ) : (
                <div className="md:col-span-2 xl:col-span-3">
                  <EmptyState
                    title="No pipeline activity yet"
                    message="Stage counts will appear here once recruiter-owned applications become active in the pipeline."
                  />
                </div>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Interviews"
              title="Upcoming schedule"
              description="This summary feeds directly into the recruiter calendar and queue routes now available in the new app."
            />
            <div className="mt-6 space-y-4">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((item) => (
                  <SurfaceCard key={item.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{formatLabel(item.round_code)}</p>
                        <p className="mt-3 text-xl font-black text-slate-950">
                          {formatDateRange(item.scheduled_start_at, item.scheduled_end_at)}
                        </p>
                      </div>
                      <StatusChip tone={item.status === 'scheduled' ? 'info' : 'warning'}>
                        {formatLabel(item.status)}
                      </StatusChip>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Candidate state ID: {item.candidate_pipeline_state_id}
                    </p>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState
                  title="No interviews scheduled"
                  message="Interview rounds will appear here once recruiter-owned scheduling becomes active."
                />
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Offers"
              title="Offer summary"
              description="Grouped offer counts already coming back from the live recruiter dashboard contract."
            />
            <div className="mt-5 space-y-3">
              {offerSummary.length > 0 ? (
                offerSummary.map((item) => (
                  <div
                    key={`${item.offer_status}-${item.count}`}
                    className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Offer status</p>
                        <p className="mt-2 text-lg font-black text-slate-950">{formatLabel(item.offer_status)}</p>
                      </div>
                      <StatusChip tone="success">{item.count}</StatusChip>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No offer activity yet"
                  message="Offer records will appear here once the recruiter workflow advances further."
                />
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Routes"
              title="Recruiter operating surfaces"
              description="The first recruiter route set is now live inside the new protected app."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <ActionLink href="/recruiter/requisitions" variant="secondary">Requisitions</ActionLink>
              <ActionLink href="/recruiter/queue" variant="secondary">Queue</ActionLink>
              <ActionLink href="/recruiter/pipeline" variant="secondary">Pipeline</ActionLink>
              <ActionLink href="/recruiter/calendar" variant="primary">Calendar</ActionLink>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}
