import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { getPortalAccessContext } from '@/lib/auth/portal-access';
import { PageFrame } from '@/components/ui/PageFrame';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { readMasterAdminRouteResolution, resolveMasterAdminStepRoute } from '@/lib/master-admin/route-resolution';

export const dynamic = 'force-dynamic';

function formatLabel(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function compactTenantId(value: string | null) {
  if (!value) return 'Not bound';
  return value.slice(0, 8).toUpperCase();
}

function toneForStepStatus(status: string): 'info' | 'success' | 'warning' {
  if (status === 'completed') {
    return 'success';
  }

  if (status === 'blocked' || status === 'pending') {
    return 'warning';
  }

  return 'info';
}

export default async function MasterAdminOverviewPage() {
  const snapshot = await getServerAuthSnapshot();
  const access = await getPortalAccessContext(snapshot, 'master_admin');

  if (!access.allowed) {
    redirect('/');
  }

  if (access.tenantId) {
    const stepRoute = await resolveMasterAdminStepRoute(access.tenantId);
    if (stepRoute && stepRoute !== '/master_admin') {
      redirect(stepRoute);
    }
  }

  const displayName = snapshot.user?.user_metadata?.full_name ?? snapshot.user?.email?.split('@')[0] ?? 'Owner';
  const resolution = access.tenantId ? await readMasterAdminRouteResolution(access.tenantId) : null;
  const journeyState = resolution?.journey_state;
  const commercialState = resolution?.commercial_state;
  const stepStatuses = resolution?.step_statuses ?? [];

  return (
    <PageFrame>
      <HeroCard>
        <SectionHeader
          eyebrow="Owner"
          title={`Master admin workspace for ${displayName}`}
          description="This owner landing now reflects live GSO route and commercial state instead of acting as a placeholder shell."
          status="Live"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard label="Role scope" value={formatLabel(access.effectiveRole, 'Unknown')} hint="Resolved from canonical UserRoles truth, not browser-selected state." />
          <MetricCard label="Tenant context" value={compactTenantId(access.tenantId)} hint="This owner workspace is bound to the live tenant context created during provisioning." />
          <MetricCard label="Setup completion" value={`${journeyState?.completion_percent ?? 0}%`} hint="Derived from the active GSO master_admin journey state." />
          <MetricCard label="Current route" value={journeyState?.current_route ?? '/master_admin'} hint="The route resolver output now stays visible on the owner landing." />
        </div>
      </HeroCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <SurfaceCard className="p-8">
          <SectionHeader
            eyebrow="Journey state"
            title="Live owner setup evidence"
            description="These step cards come from the active GSO route-resolution payload. They reflect real step status, sequence order, and any current blocking reason."
          />
          <div className="mt-6 space-y-4">
            {stepStatuses.length === 0 ? (
              <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-600">
                No journey-state evidence is available for this owner yet.
              </div>
            ) : (
              stepStatuses.map((step) => (
                <div key={step.step_code} className="flex flex-wrap items-start justify-between gap-4 rounded-[1.2rem] border border-slate-200 bg-white px-5 py-5 shadow-[var(--shadow-card)]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Step {step.sequence_no}</p>
                    <p className="mt-2 text-lg font-black text-slate-950">{formatLabel(step.step_code, 'Unknown step')}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {step.last_blocking_reason_code
                        ? `Blocking reason: ${formatLabel(step.last_blocking_reason_code, 'Unresolved')}`
                        : 'No current blocking reason reported.'}
                    </p>
                  </div>
                  <StatusChip tone={toneForStepStatus(step.step_status)}>{formatLabel(step.step_status, 'Unknown')}</StatusChip>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Commercial"
              title="Seeded billing state"
              description="This is the current commercial payload returned with owner route resolution."
            />
            <div className="mt-5 space-y-3">
              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Plan</p>
                <p className="mt-2 text-sm font-black text-slate-950">{formatLabel(commercialState?.explanation?.plan_code, 'Unknown')}</p>
              </div>
              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Gate status</p>
                <p className="mt-2 text-sm font-black text-slate-950">{formatLabel(commercialState?.gate_status, 'Unknown')}</p>
              </div>
              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Billing state</p>
                <p className="mt-2 text-sm font-black text-slate-950">{formatLabel(commercialState?.billing_state, 'Unknown')}</p>
              </div>
              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Included employees</p>
                <p className="mt-2 text-sm font-black text-slate-950">{commercialState?.explanation?.included_employee_count ?? 0}</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader
              eyebrow="Progress"
              title="Resolver summary"
              description="This is the current owner route-decision snapshot as seen by the new application shell."
            />
            <div className="mt-5 space-y-3">
              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Decision</p>
                <p className="mt-2 text-sm font-black text-slate-950">{formatLabel(resolution?.decision, 'Unknown')}</p>
              </div>
              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Current step</p>
                <p className="mt-2 text-sm font-black text-slate-950">{formatLabel(journeyState?.current_step_code, 'Completed')}</p>
              </div>
              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Pending steps</p>
                <p className="mt-2 text-sm font-black text-slate-950">{journeyState?.pending_step_codes?.length ?? 0}</p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}
