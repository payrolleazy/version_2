import { getServerAuthSnapshot } from '@/lib/auth/session';
import { fetchRecruiterRequisitions } from '@/lib/recruiter/contracts';
import { formatDate, formatLabel, getDaysOpen, getMetaLabel, getRequisitionTitle } from '@/lib/recruiter/presentation';
import { PageFrame } from '@/components/ui/PageFrame';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActionLink } from '@/components/ui/ActionButton';

export const dynamic = 'force-dynamic';

export default async function RecruiterRequisitionsPage() {
  const snapshot = await getServerAuthSnapshot();
  const result = snapshot.session?.access_token
    ? await fetchRecruiterRequisitions(snapshot.session.access_token)
    : null;

  const rows = result?.success ? result.data ?? [] : [];
  const error = result && !result.success ? result.error ?? 'Could not load recruiter requisitions.' : null;

  const openRows = rows.filter((row) => {
    const status = (row.pipeline_status ?? '').toLowerCase();
    return !row.closed_at && (status === 'open' || status === 'active' || status.length === 0);
  });
  const closedRows = rows.filter((row) => row.closed_at || (row.pipeline_status ?? '').toLowerCase() === 'closed');
  const agedRows = openRows.filter((row) => {
    const days = getDaysOpen(row.opened_at, row.closed_at);
    return typeof days === 'number' && days > 30;
  });

  return (
    <PageFrame>
      <HeroCard>
        <SectionHeader
          eyebrow="Recruiter"
          title="Requisition workbench"
          description="This route now reads recruiter-owned requisition bindings from the live recruiter-safe read surface."
          status="Wave 1"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Open" value={String(openRows.length)} hint="Recruiter-owned requisitions still active in the hiring flow." />
          <MetricCard label="Closed" value={String(closedRows.length)} hint="Bindings that have already been closed but remain reviewable." />
          <MetricCard label="Aged 30+" value={String(agedRows.length)} hint="Open demand that has been sitting for more than thirty days." />
        </div>
      </HeroCard>

      {error ? <EmptyState title="Could not load requisitions" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Open demand"
              title="Active requisitions"
              description="These rows come directly from the recruiter-scoped requisition binding view."
            />
            <div className="mt-6 space-y-4">
              {openRows.length > 0 ? (
                openRows.map((row) => {
                  const department = getMetaLabel(row.meta, ['department_name', 'department', 'business_unit_name']) ?? 'Unmapped department';
                  const location = getMetaLabel(row.meta, ['location_name', 'location', 'branch_name']);
                  const daysOpen = getDaysOpen(row.opened_at, row.closed_at);

                  return (
                    <SurfaceCard key={row.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{department}</p>
                          <h3 className="mt-3 text-xl font-black text-slate-950">{getRequisitionTitle(row)}</h3>
                        </div>
                        <StatusChip tone="info">{formatLabel(row.pipeline_status)}</StatusChip>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p>Opened: {formatDate(row.opened_at)}</p>
                        <p>Days open: {daysOpen ?? 'Not available'}</p>
                        <p>Template: {row.pipeline_template_id ? row.pipeline_template_id.slice(0, 8) : 'Not linked'}</p>
                        <p>Location: {location ?? 'Not mapped'}</p>
                      </div>
                    </SurfaceCard>
                  );
                })
              ) : (
                <EmptyState title="No active requisitions" message="Recruiter-owned requisition bindings will appear here once live demand is assigned." />
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8">
            <SectionHeader
              eyebrow="Review"
              title="Recently closed requisitions"
              description="Closed recruiter-owned requisitions remain visible for audit and follow-up."
            />
            <div className="mt-6 space-y-4">
              {closedRows.length > 0 ? (
                closedRows.slice(0, 12).map((row) => (
                  <div key={row.id} className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Closed requisition</p>
                        <p className="mt-2 text-lg font-black text-slate-950">{getRequisitionTitle(row)}</p>
                      </div>
                      <StatusChip tone="success">Closed</StatusChip>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">Closed at: {formatDate(row.closed_at)}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No closed requisitions yet" message="Closed recruiter-owned requisitions will surface here once they leave the active flow." />
              )}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Focus"
              title="Where to look first"
              description="Use aging first to surface the requisitions most at risk of stalling."
            />
            <div className="mt-5 space-y-3">
              {agedRows.length > 0 ? (
                agedRows.slice(0, 6).map((row) => (
                  <div key={row.id} className="rounded-[1.05rem] border border-amber-200 bg-amber-50 px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Aged requisition</p>
                    <p className="mt-2 text-base font-black text-slate-950">{getRequisitionTitle(row)}</p>
                    <p className="mt-2 text-sm text-slate-600">{getDaysOpen(row.opened_at, row.closed_at)} days open</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No aged demand" message="No active recruiter-owned requisitions are currently beyond the 30-day mark." />
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Next"
              title="Continue recruiter flow"
              description="The next operating surfaces after requisitions are queue and pipeline."
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
