import { ActionLink } from '@/components/ui/ActionButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageFrame } from '@/components/ui/PageFrame';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import type {
  CandidateInterviewConsoleResponse,
  CandidateLaunchpadIssue,
  CandidateLaunchpadResponse,
} from '@/lib/candidate/contracts';

function formatLabel(value: string | null | undefined) {
  if (!value) return 'Pending';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Schedule pending';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Schedule pending';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsed);
}

function getIssueTone(issue: CandidateLaunchpadIssue): 'info' | 'warning' | 'success' {
  if (issue.severity === 'blocking' || issue.severity === 'warning') {
    return 'warning';
  }

  return 'info';
}

function renderPanelEmpty(title: string, message: string) {
  return (
    <div className="mt-6 rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
      <p className="font-black text-slate-900">{title}</p>
      <p className="mt-2 leading-6">{message}</p>
    </div>
  );
}

export function CandidateLaunchpadOverview({
  displayName,
  launchpad,
  interviewConsole,
  error,
}: {
  displayName: string;
  launchpad: CandidateLaunchpadResponse | null;
  interviewConsole: CandidateInterviewConsoleResponse | null;
  error: string | null;
}) {
  if (error || !launchpad?.success) {
    return (
      <PageFrame>
        <EmptyState
          title="Candidate launchpad unavailable"
          message={error ?? 'The live candidate launchpad contract did not return a usable snapshot.'}
        />
      </PageFrame>
    );
  }

  const summary = launchpad.summary;
  const readiness = launchpad.readiness;
  const documentSummary = launchpad.documents?.summary;
  const documentGroups = launchpad.documents?.groups ?? [];
  const offerRoom = launchpad.offer_room;
  const day0Packet = launchpad.day0_packet?.packet;
  const readinessIssues = readiness?.issues ?? [];
  const unreadLetters = offerRoom?.unread_count ?? summary?.unread_letters ?? 0;
  const unreadNotifications = summary?.unread_notifications ?? launchpad.notifications?.unread_count ?? 0;
  const actionableNotifications =
    summary?.actionable_notifications ?? launchpad.notifications?.actionable_count ?? 0;
  const upcomingInterviews = interviewConsole?.upcoming_interviews ?? [];
  const primaryInterview = interviewConsole?.primary_interview ?? null;

  return (
    <PageFrame>
      <HeroCard className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.04),_rgba(14,165,233,0.08))]">
        <SectionHeader
          eyebrow="Candidate"
          title={`Welcome back, ${displayName}`}
          description={
            summary?.next_recommended_action
              ? `Next recommended action: ${summary.next_recommended_action}`
              : 'Your restored candidate launchpad now runs on the live CXP contracts inside version_2.'
          }
          status={formatLabel(summary?.overall_status)}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Readiness score"
            value={String(Math.round(summary?.overall_score ?? readiness?.snapshot?.overall_score ?? 0))}
            hint="Live readiness score returned by the candidate launchpad contract."
          />
          <MetricCard
            label="Pending docs"
            value={String(summary?.pending_required_documents ?? documentSummary?.pending_required_documents ?? 0)}
            hint="Required uploads still missing from the candidate-safe checklist."
          />
          <MetricCard
            label="Unread letters"
            value={String(unreadLetters)}
            hint="Offer-room documents still waiting for candidate attention."
          />
          <MetricCard
            label="Actionable nudges"
            value={String(actionableNotifications)}
            hint={`Unread notifications currently surfaced: ${unreadNotifications}.`}
          />
        </div>
      </HeroCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div className="space-y-6">
          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Readiness"
              title="What needs attention"
              description="These issues come directly from the live candidate launchpad snapshot and replace the old proof-only candidate landing."
            />
            {readinessIssues.length > 0 ? (
              <div className="mt-6 space-y-4">
                {readinessIssues.map((issue) => (
                  <SurfaceCard key={issue.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          {formatLabel(issue.issue_code)}
                        </p>
                        <p className="mt-3 text-xl font-black text-slate-950">{issue.title}</p>
                      </div>
                      <StatusChip tone={getIssueTone(issue)}>{formatLabel(issue.severity)}</StatusChip>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{issue.message}</p>
                    {issue.resolution_hint ? (
                      <p className="mt-3 text-sm font-semibold text-sky-700">
                        Resolve next: {issue.resolution_hint}
                      </p>
                    ) : null}
                  </SurfaceCard>
                ))}
              </div>
            ) : (
              renderPanelEmpty(
                'No active blockers',
                'Your readiness layer did not report any active issues for this candidate right now.',
              )
            )}
          </SurfaceCard>

          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Documents"
              title="Upload snapshot"
              description="Document groups are coming from the restored launchpad contract, and the dedicated documents route is now live in version_2."
            />
            {documentGroups.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {documentGroups.map((group) => (
                  <SurfaceCard key={group.sub_folder} className="p-5">
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
                  </SurfaceCard>
                ))}
              </div>
            ) : (
              renderPanelEmpty(
                'No document buckets yet',
                'The candidate-safe document checklist has not published any active buckets for this candidate.',
              )
            )}
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Offer room"
              title="Letter and packet status"
              description="Offer-room counts and day-zero packet details are already available from the candidate launchpad payload."
            />
            <div className="mt-5 space-y-3">
              <div className="rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Letters</p>
                    <p className="mt-2 text-lg font-black text-slate-950">{unreadLetters} unread</p>
                  </div>
                  <StatusChip tone={unreadLetters > 0 ? 'warning' : 'success'}>
                    {unreadLetters > 0 ? 'Review' : 'Clear'}
                  </StatusChip>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Read: {offerRoom?.read_count ?? 0} - Acknowledged: {offerRoom?.acknowledged_count ?? 0}
                </p>
              </div>

              <div className="rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Day-zero packet</p>
                    <p className="mt-2 text-lg font-black text-slate-950">
                      {formatLabel(day0Packet?.packet_status ?? summary?.day0_packet_status)}
                    </p>
                  </div>
                  <StatusChip tone={day0Packet?.packet_status === 'ready' ? 'success' : 'info'}>
                    {day0Packet?.joining_date ? 'Scheduled' : 'Pending'}
                  </StatusChip>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Joining date: {day0Packet?.joining_date ? formatDateTime(day0Packet.joining_date) : 'Not published yet'}
                </p>
                {day0Packet?.packet_json?.reporting_manager?.manager_name ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Reporting manager: {day0Packet.packet_json.reporting_manager.manager_name}
                  </p>
                ) : null}
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Interview"
              title="Upcoming interview console"
              description="The interview console contract is now pulled into the candidate home so schedule visibility is present before the dedicated route lands."
            />
            {primaryInterview || upcomingInterviews.length > 0 ? (
              <div className="mt-5 space-y-3">
                {(primaryInterview ? [primaryInterview] : upcomingInterviews.slice(0, 2)).map((item) => (
                  <div key={item.interview_plan_id} className="rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          {formatLabel(item.round_code)}
                        </p>
                        <p className="mt-2 text-lg font-black text-slate-950">
                          {formatDateTime(item.scheduled_start_at)}
                        </p>
                      </div>
                      <StatusChip tone={item.status === 'scheduled' ? 'info' : 'warning'}>
                        {formatLabel(item.status)}
                      </StatusChip>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.instructions || item.meeting_label || 'Interview instructions will appear here once published.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              renderPanelEmpty(
                'No interview scheduled',
                'The candidate interview console is live, but no active interview schedule is currently assigned to this user.',
              )
            )}
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Migration"
              title="Restoration sequence"
              description="The candidate portal is being restored route by route from version_1. Launchpad, documents, and offer room are now live; interview and onboarding follow next."
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <ActionLink href="/candidate" variant="secondary">Launchpad live</ActionLink>
              <ActionLink href="/candidate/documents" variant="secondary">Documents live</ActionLink>
              <span className="inline-flex items-center rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                Letters after that
              </span>
              <span className="inline-flex items-center rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                Interview next, onboarding after that
              </span>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}



