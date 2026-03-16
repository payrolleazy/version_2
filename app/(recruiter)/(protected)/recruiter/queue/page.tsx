import { getServerAuthSnapshot } from '@/lib/auth/session';
import {
  fetchRecruiterCandidatePipeline,
  fetchRecruiterConversions,
  fetchRecruiterInterviewFeedback,
  fetchRecruiterInterviewPlans,
  fetchRecruiterOffers,
} from '@/lib/recruiter/contracts';
import { formatDateTime, formatLabel, getCandidateDisplayName } from '@/lib/recruiter/presentation';
import { PageFrame } from '@/components/ui/PageFrame';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActionLink } from '@/components/ui/ActionButton';

export const dynamic = 'force-dynamic';

type QueueItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  tone: 'warning' | 'info' | 'success';
  updatedAt: string | null;
};

export default async function RecruiterQueuePage() {
  const snapshot = await getServerAuthSnapshot();

  const responses = snapshot.session?.access_token
    ? await Promise.all([
        fetchRecruiterCandidatePipeline(snapshot.session.access_token, 100),
        fetchRecruiterInterviewPlans(snapshot.session.access_token, 100),
        fetchRecruiterInterviewFeedback(snapshot.session.access_token, 100),
        fetchRecruiterOffers(snapshot.session.access_token, 100),
        fetchRecruiterConversions(snapshot.session.access_token, 100),
      ])
    : null;

  const [candidateRes, interviewRes, feedbackRes, offerRes, conversionRes] = responses ?? [];
  const firstFailure = responses?.find((result) => !result.success) ?? null;
  const error = firstFailure ? firstFailure.error ?? 'Could not load recruiter queue.' : null;

  const candidates = candidateRes?.success ? candidateRes.data ?? [] : [];
  const interviews = interviewRes?.success ? interviewRes.data ?? [] : [];
  const feedback = feedbackRes?.success ? feedbackRes.data ?? [] : [];
  const offers = offerRes?.success ? offerRes.data ?? [] : [];
  const conversions = conversionRes?.success ? conversionRes.data ?? [] : [];

  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  const queueItems: QueueItem[] = [
    ...feedback
      .filter((item) => item.feedback_status !== 'submitted')
      .map((item) => {
        const interview = interviews.find((plan) => plan.id === item.interview_plan_id);
        const candidate = interview ? candidateById.get(interview.candidate_pipeline_state_id) : null;
        return {
          id: item.id,
          eyebrow: 'Feedback',
          title: candidate ? getCandidateDisplayName(candidate) : 'Interview feedback pending',
          description: `${formatLabel(interview?.round_code)} feedback is still pending recruiter follow-up.`,
          tone: 'warning',
          updatedAt: item.updated_at ?? item.created_at,
        } satisfies QueueItem;
      }),
    ...interviews
      .filter((item) => item.status === 'scheduled')
      .map((item) => {
        const candidate = candidateById.get(item.candidate_pipeline_state_id);
        return {
          id: item.id,
          eyebrow: 'Interview',
          title: candidate ? getCandidateDisplayName(candidate) : formatLabel(item.round_code),
          description: `${formatLabel(item.round_code)} is scheduled for ${formatDateTime(item.scheduled_start_at)}.`,
          tone: 'info',
          updatedAt: item.updated_at ?? item.created_at,
        } satisfies QueueItem;
      }),
    ...offers
      .filter((item) => !['accepted', 'rejected'].includes((item.offer_status ?? '').toLowerCase()))
      .map((item) => {
        const candidate = candidateById.get(item.candidate_pipeline_state_id);
        return {
          id: item.id,
          eyebrow: 'Offer',
          title: candidate ? getCandidateDisplayName(candidate) : `Offer ${item.id.slice(0, 8)}`,
          description: `${formatLabel(item.offer_status)} offer is awaiting recruiter action.`,
          tone: item.offer_status === 'issued' ? 'info' : 'warning',
          updatedAt: item.updated_at ?? item.created_at,
        } satisfies QueueItem;
      }),
    ...conversions
      .filter((item) => !['completed', 'dispatched'].includes((item.conversion_status ?? '').toLowerCase()))
      .map((item) => {
        const candidate = candidateById.get(item.candidate_pipeline_state_id);
        return {
          id: item.id,
          eyebrow: 'Conversion',
          title: candidate ? getCandidateDisplayName(candidate) : `Conversion ${item.id.slice(0, 8)}`,
          description:
            item.last_error && item.last_error.trim().length > 0
              ? item.last_error
              : `${formatLabel(item.conversion_status)} handoff still needs recruiter attention.`,
          tone: item.last_error ? 'warning' : 'success',
          updatedAt: item.updated_at ?? item.created_at,
        } satisfies QueueItem;
      }),
  ]
    .sort((left, right) => {
      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
      return rightTime - leftTime;
    })
    .slice(0, 18);

  const pendingFeedback = feedback.filter((item) => item.feedback_status !== 'submitted').length;
  const scheduledInterviews = interviews.filter((item) => item.status === 'scheduled').length;
  const liveOffers = offers.filter((item) => !['accepted', 'rejected'].includes((item.offer_status ?? '').toLowerCase())).length;
  const activeConversions = conversions.filter((item) => !['completed', 'dispatched'].includes((item.conversion_status ?? '').toLowerCase())).length;

  return (
    <PageFrame>
      <HeroCard>
        <SectionHeader
          eyebrow="Recruiter"
          title="Recruiter queue"
          description="This page merges recruiter-owned interview, feedback, offer, and conversion items into one server-rendered action queue."
          status="Wave 1"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard label="Pending feedback" value={String(pendingFeedback)} hint="Interview feedback still waiting for recruiter follow-up." />
          <MetricCard label="Scheduled interviews" value={String(scheduledInterviews)} hint="Live interview rounds still sitting on the recruiter calendar." />
          <MetricCard label="Live offers" value={String(liveOffers)} hint="Offer rows not yet accepted or rejected." />
          <MetricCard label="Active conversions" value={String(activeConversions)} hint="Candidates still moving toward onboarding handoff." />
        </div>
      </HeroCard>

      {error ? <EmptyState title="Could not load recruiter queue" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Live work"
              title="Prioritized action queue"
              description="Newest recruiter-owned work is shown first across interviews, offers, and conversions."
            />
            <div className="mt-6 space-y-4">
              {queueItems.length > 0 ? (
                queueItems.map((item) => (
                  <SurfaceCard key={item.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{item.eyebrow}</p>
                        <h3 className="mt-3 text-xl font-black text-slate-950">{item.title}</h3>
                      </div>
                      <StatusChip tone={item.tone === 'warning' ? 'warning' : item.tone === 'success' ? 'success' : 'info'}>
                        {item.eyebrow}
                      </StatusChip>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Last updated: {formatDateTime(item.updatedAt)}
                    </p>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState title="Queue is clear" message="No recruiter-owned interview, offer, or conversion items currently need attention." />
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Breakdown"
              title="What this queue includes"
              description="This screen is intentionally limited to recruiter-safe reads only."
            />
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.05rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Feedback</p>
                <p className="mt-2 text-lg font-black text-slate-950">{pendingFeedback} interview follow-ups</p>
              </div>
              <div className="rounded-[1.05rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Interviews</p>
                <p className="mt-2 text-lg font-black text-slate-950">{scheduledInterviews} upcoming rounds</p>
              </div>
              <div className="rounded-[1.05rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Conversions</p>
                <p className="mt-2 text-lg font-black text-slate-950">{activeConversions} handoff steps</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Next"
              title="Continue recruiter flow"
              description="After queue, use pipeline and calendar to work the current candidate movement and interview load."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <ActionLink href="/recruiter/pipeline" variant="primary">Open pipeline</ActionLink>
              <ActionLink href="/recruiter/calendar" variant="secondary">Open calendar</ActionLink>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}
