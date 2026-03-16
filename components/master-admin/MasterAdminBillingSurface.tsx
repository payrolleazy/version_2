'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '@/components/ui/ActionButton';
import { PageFrame } from '@/components/ui/PageFrame';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusChip } from '@/components/ui/StatusChip';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { completeOwnerSetupStep, resolveOwnerSetupRoute, type OwnerRouteResolution } from '@/lib/master-admin/setup';

function formatLabel(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractPlanCode(payload: OwnerRouteResolution | null) {
  return payload?.commercial_state?.explanation?.plan_code ?? 'starter_free_200';
}

export function MasterAdminBillingSurface({ tenantId }: { tenantId: string }) {
  const [resolution, setResolution] = useState<OwnerRouteResolution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const accessToken = session?.access_token;
        if (!accessToken) {
          throw new Error('Authentication required to load commercial setup.');
        }

        const result = await resolveOwnerSetupRoute(accessToken, tenantId);
        if (!result.success) {
          throw new Error(result.error ?? 'Could not load commercial setup state.');
        }

        if (!cancelled) {
          setResolution(result.data ?? null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load commercial setup state.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const commercialState = resolution?.commercial_state;
  const journeyState = resolution?.journey_state;
  const planCode = useMemo(() => extractPlanCode(resolution), [resolution]);

  async function handleContinue() {
    setIsSubmitting(true);
    setError(null);
    setStatusMessage('Confirming commercial setup...');

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error('Authentication required to continue setup.');
      }

      const completeResult = await completeOwnerSetupStep(accessToken, tenantId, 'commercial_setup', {
        manual_complete: true,
        acknowledged_at: new Date().toISOString(),
        commercial_snapshot: commercialState ?? null,
      });

      if (!completeResult.success) {
        throw new Error(completeResult.error ?? 'Could not complete commercial setup.');
      }

      const routeResult = await resolveOwnerSetupRoute(accessToken, tenantId);
      if (!routeResult.success) {
        throw new Error(routeResult.error ?? 'Could not resolve the next setup step.');
      }

      const nextRoute = routeResult.data?.next_route;
      if (nextRoute && nextRoute !== '/master_admin/billing') {
        window.location.assign(nextRoute);
        return;
      }

      setResolution(routeResult.data ?? null);
      setStatusMessage('Commercial setup is marked complete.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not complete commercial setup.');
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageFrame>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <SurfaceCard className="p-8">
          <SectionHeader
            eyebrow="Commercial setup"
            title="Confirm the live billing state for this tenant"
            description="This step is driven by the active GSO master_admin journey. The commercial state below is resolved from the live owner setup route payload before the step is manually acknowledged."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Plan code</p>
              <p className="mt-3 text-lg font-black text-slate-950">{formatLabel(planCode, 'Unresolved')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Commercial seed has already attached the starter plan to this tenant.</p>
            </div>

            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Gate status</p>
              <div className="mt-3">
                <StatusChip tone={commercialState?.gate_status === 'open' ? 'success' : 'warning'}>
                  {formatLabel(commercialState?.gate_status, 'Unknown')}
                </StatusChip>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">The owner route resolver uses this gate state before opening deeper workspace capabilities.</p>
            </div>

            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Billing state</p>
              <p className="mt-3 text-lg font-black text-slate-950">{formatLabel(commercialState?.billing_state, 'Unknown')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">This value comes from the same post-login setup payload used for owner routing.</p>
            </div>

            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Payment state</p>
              <p className="mt-3 text-lg font-black text-slate-950">{formatLabel(commercialState?.payment_state, 'Unknown')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">The public owner provisioning flow has already seeded this tenant into the commercial layer.</p>
            </div>

            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Included employees</p>
              <p className="mt-3 text-lg font-black text-slate-950">{commercialState?.explanation?.included_employee_count ?? 0}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">This reflects the seeded commercial allowance attached to the active plan.</p>
            </div>

            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Billing enabled</p>
              <p className="mt-3 text-lg font-black text-slate-950">
                {commercialState?.allowed_capabilities?.billing_enabled ? 'Enabled' : 'Not enabled'}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">This is part of the live capability payload returned alongside the current setup route.</p>
            </div>
          </div>

          {statusMessage ? (
            <div className="mt-6 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {statusMessage}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <ActionButton type="button" disabled={isLoading || isSubmitting} onClick={handleContinue}>
              {isSubmitting ? 'Confirming...' : 'Continue to admin handoff'}
            </ActionButton>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionHeader
            eyebrow="Journey"
            title="Current setup position"
            description="This sidebar reflects the same GSO route-resolution payload that controls the owner workspace landing."
          />

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Current step</p>
              <p className="mt-2 text-lg font-black text-slate-950">{formatLabel(journeyState?.current_step_code, 'Unresolved')}</p>
            </div>
            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Completion</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{journeyState?.completion_percent ?? 0}%</p>
            </div>
            <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Tenant context</p>
              <p className="mt-2 break-all text-sm font-black text-slate-950">{tenantId}</p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageFrame>
  );
}
