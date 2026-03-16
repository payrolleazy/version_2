import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { getPortalAccessContext } from '@/lib/auth/portal-access';
import { PageFrame } from '@/components/ui/PageFrame';
import { HeroCard } from '@/components/ui/HeroCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { StatusChip } from '@/components/ui/StatusChip';

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

export default async function EmployeeOverviewPage() {
  const snapshot = await getServerAuthSnapshot();
  const access = await getPortalAccessContext(snapshot, 'employee');

  if (!access.allowed) {
    redirect('/');
  }

  const displayName = snapshot.user?.user_metadata?.full_name ?? snapshot.user?.email?.split('@')[0] ?? 'Employee';

  return (
    <PageFrame>
      <HeroCard>
        <SectionHeader
          eyebrow="Employee"
          title={`Employee workspace for ${displayName}`}
          description="This landing is now protected by the same active-role and active-employment checks enforced by the real sign-in gateway."
          status="Live"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Role scope" value={formatLabel(access.effectiveRole, 'Unknown')} hint="Resolved on the server from UserRoles plus the active employment row." />
          <MetricCard label="Tenant context" value={compactTenantId(access.tenantId)} hint="The employee portal binds to the tenant where the current active employment exists." />
          <MetricCard label="Matched roles" value={`${access.matchedRoles.length}`} hint="Multiple employee-capable rows remain visible, but the shell binds to the latest active tenant role." />
        </div>
      </HeroCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <SurfaceCard className="p-8">
          <SectionHeader
            eyebrow="Access"
            title="Employee entry is now server-validated"
            description="This page exists so the new application can land employee sessions without falling back to the legacy shell or a stale candidate context."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-5 py-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Primary tenant</p>
              <p className="mt-2 text-lg font-black text-slate-950">{compactTenantId(access.tenantId)}</p>
              <p className="mt-2 text-sm text-slate-600">Resolved from the active employee row and current employment state.</p>
            </div>
            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-5 py-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Current role</p>
              <p className="mt-2 text-lg font-black text-slate-950">{formatLabel(access.effectiveRole, 'Unknown')}</p>
              <p className="mt-2 text-sm text-slate-600">This is no longer derived only from auth metadata.</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionHeader
            eyebrow="Status"
            title="Session posture"
            description="These indicators show that the session is landing through the rebuilt role-aware resolver."
          />
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <span className="text-sm font-semibold text-slate-700">Canonical access source</span>
              <StatusChip tone="success">UserRoles</StatusChip>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <span className="text-sm font-semibold text-slate-700">Sign-in gateway</span>
              <StatusChip tone="success">secure-employee-signin</StatusChip>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <span className="text-sm font-semibold text-slate-700">Fallback mode</span>
              <StatusChip tone="info">Disabled</StatusChip>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageFrame>
  );
}
