import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { getPortalAccessContext } from '@/lib/auth/portal-access';
import { PageFrame } from '@/components/ui/PageFrame';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { readAdminRouteResolution, resolveAdminStepRoute } from '@/lib/admin/route-resolution';

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

export default async function AdminOverviewPage() {
  const snapshot = await getServerAuthSnapshot();
  const access = await getPortalAccessContext(snapshot, 'admin');

  if (!access.allowed) {
    redirect('/');
  }

  if (access.tenantId) {
    const stepRoute = await resolveAdminStepRoute(access.tenantId);
    if (stepRoute && stepRoute !== '/admin') {
      redirect(stepRoute);
    }
  }

  const displayName = snapshot.user?.user_metadata?.full_name ?? snapshot.user?.email?.split('@')[0] ?? 'Admin';
  const resolution = access.tenantId ? await readAdminRouteResolution(access.tenantId) : null;
  const journeyState = resolution?.journey_state;
  const commercialState = resolution?.commercial_state;
  const stepStatuses = resolution?.step_statuses ?? [];

  return (
    <PageFrame>
      <HeroCard>
        <SectionHeader
          eyebrow="Admin"
          title={`Admin workspace for ${displayName}`}
          description="This portal now resolves from active UserRoles and employee status instead of browser-stamped role metadata alone."
          status="Live"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <MetricCard label="Role scope" value={formatLabel(access.effectiveRole, 'Unknown')} hint="Validated on the server from UserRoles plus active employment state." />
          <MetricCard label="Tenant context" value={compactTenantId(access.tenantId)} hint="The admin portal stays tied to the tenant where the active admin row exists." />
          <MetricCard label="Setup completion" value={`${journeyState?.completion_percent ?? 0}%`} hint="Derived from the admin-scoped GSO route resolver." />
          <MetricCard label="Current route" value={journeyState?.current_route ?? '/admin'} hint="This page reflects the current GSO route output for the admin scope." />
        </div>
      </HeroCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <SurfaceCard className="p-8">
          <SectionHeader
            eyebrow="Journey state"
            title="Admin step evidence"
            description="These step cards come from the admin-scoped post-login route resolution payload."
          />
          <div className="mt-6 space-y-4">
            {stepStatuses.length === 0 ? (
              <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-600">
                No admin journey-state evidence is available for this tenant yet.
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
              title="Tenant commercial state"
              description="This is the commercial payload currently attached to the admin route resolver."
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
        </div>
      </div>
    </PageFrame>
  );
}
